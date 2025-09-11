import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              Welcome to Plank Coach. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our fitness application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-foreground mb-2">Account Information</h3>
            <ul className="list-disc ml-6 space-y-1 text-foreground/80">
              <li>Email address and password (encrypted) for account creation</li>
              <li>Profile information including username and avatar</li>
              <li>Authentication data managed securely through Supabase</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mb-2 mt-4">Workout Data</h3>
            <ul className="list-disc ml-6 space-y-1 text-foreground/80">
              <li>Exercise performance metrics and progress tracking</li>
              <li>Workout history and personal records</li>
              <li>Training preferences and goal settings</li>
              <li>Assessment results and fitness level data</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mb-2 mt-4">Device Information</h3>
            <ul className="list-disc ml-6 space-y-1 text-foreground/80">
              <li>Device type and operating system for app optimization</li>
              <li>Push notification tokens (if notifications are enabled)</li>
              <li>App usage analytics for improving user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">How We Use Your Information</h2>
            <ul className="list-disc ml-6 space-y-2 text-foreground/80">
              <li>Provide personalized workout recommendations and progress tracking</li>
              <li>Send push notifications about workouts, achievements, and reminders (if enabled)</li>
              <li>Improve app functionality and user experience through analytics</li>
              <li>Ensure account security and prevent unauthorized access</li>
              <li>Provide customer support and respond to your inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Data Storage and Security</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              Your data is securely stored using Supabase, a trusted backend-as-a-service provider. We implement industry-standard security measures including:
            </p>
            <ul className="list-disc ml-6 space-y-1 text-foreground/80">
              <li>End-to-end encryption for sensitive data</li>
              <li>Secure authentication protocols</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Push Notifications</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may send push notifications to remind you about workouts, celebrate achievements, and share helpful fitness tips. 
              You can control these notifications through your device settings or within the app preferences at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Third-Party Services</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              We use the following trusted third-party services:
            </p>
            <ul className="list-disc ml-6 space-y-1 text-foreground/80">
              <li><strong>Supabase:</strong> For secure data storage and authentication</li>
              <li><strong>Analytics Services:</strong> To understand app usage and improve functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Your Rights</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc ml-6 space-y-1 text-foreground/80">
              <li>Access your personal data and request copies</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your account and associated data</li>
              <li>Export your workout data</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Data Retention</h2>
            <p className="text-foreground/80 leading-relaxed">
              We retain your data for as long as your account is active. If you delete your account, 
              we will permanently remove your personal data within 30 days, except where we are legally required to retain certain information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Children's Privacy</h2>
            <p className="text-foreground/80 leading-relaxed">
              Our app is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. 
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Changes to This Policy</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page 
              and updating the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions about this privacy policy or our data practices, please contact us through the app's support feature 
              or by reaching out to our team. We're committed to addressing your privacy concerns promptly and transparently.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}