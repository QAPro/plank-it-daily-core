
/**
 * Hardened create_friend_activity Edge Function
 * - Verifies Authorization and user identity
 * - Validates input with Zod
 * - Applies a lightweight in-memory rate limit per user
 * - Uses anon key + Authorization forwarding to respect RLS
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

const json = (status: number, body: Record<string, JSONValue>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

// Simple in-memory rate limiter per user (best-effort; not multi-instance durable)
const getRateLimiter = () => {
  const g = globalThis as unknown as {
    __friend_activity_rl?: Map<string, number[]>;
  };
  if (!g.__friend_activity_rl) {
    g.__friend_activity_rl = new Map();
  }
  return g.__friend_activity_rl;
};

const RATE_LIMIT_WINDOW_MS = 10_000; // 10 seconds
const RATE_LIMIT_MAX = 5; // 5 requests per window

const bodySchema = z.object({
  action: z.string().min(1).max(64),
  target_user_id: z.string().uuid().optional(),
  metadata: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.any()), z.record(z.any())]))
    .optional(),
});

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return json(405, { error: "Method Not Allowed" });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return json(401, { error: "Missing or invalid Authorization header" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      // Server misconfiguration; do not leak details
      return json(500, { error: "Server configuration error" });
    }

    // Create RLS-respecting client using anon key and forward the user's JWT
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return json(401, { error: "Unauthorized" });
    }
    const userId = authData.user.id;

    // Rate limiting (best-effort)
    const store = getRateLimiter();
    const now = Date.now();
    const timestamps = store.get(userId) ?? [];
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX) {
      return json(429, { error: "Too Many Requests" });
    }
    recent.push(now);
    store.set(userId, recent);

    // Parse and validate body
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return json(400, { error: "Invalid JSON body" });
    }

    const parsed = bodySchema.safeParse(payload);
    if (!parsed.success) {
      return json(400, { error: "Validation failed", details: parsed.error.flatten() as unknown as JSONValue });
    }

    const { action, target_user_id, metadata } = parsed.data;

    // Insert activity (RLS should enforce user ownership)
    const { data: inserted, error: insertError } = await supabase
      .from("friend_activities")
      .insert({
        user_id: userId,
        action,
        target_user_id: target_user_id ?? null,
        metadata: metadata ?? null,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (insertError) {
      // Avoid leaking internal table details
      console.error("create_friend_activity insert error:", insertError);
      return json(403, { error: "Not allowed or invalid request" });
    }

    return json(201, { success: true, activity: inserted as JSONValue });
  } catch (err) {
    console.error("create_friend_activity unexpected error:", err);
    return json(500, { error: "Internal Server Error" });
  }
});
