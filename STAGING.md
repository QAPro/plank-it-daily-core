# Staging Environment

This document describes the staging environment setup for Inner Fire PWA.

## Environment Details

- **Branch**: `develop`
- **Supabase Project**: lhbgfppojpfhaooflfip (Staging)
- **Deployment**: Automatic via Vercel on push to develop branch

## Database

The staging database has been migrated with all production schema (128 tables).

## Environment Variables

All staging environment variables are configured in Vercel for the `develop` branch:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_SUPABASE_PROJECT_ID
- VITE_ENABLE_AI_FEATURES
- VITE_ENABLE_SOCIAL_FEATURES

## Deployment

Any push to the `develop` branch will automatically trigger a preview deployment on Vercel with the staging environment variables.

---
Last updated: November 18, 2025
