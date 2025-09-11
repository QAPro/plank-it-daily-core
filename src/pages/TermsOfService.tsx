import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Agreement to Terms</h2>
            <p className="text-foreground/80 leading-relaxed">
              By accessing and using Plank Coach, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Description of Service</h2>
            <p className="text-foreground/80 leading-relaxed">
              Plank Coach is a fitness application designed to help users improve their core strength through guided plank exercises, 
              progress tracking, and personalized workout plans. Our app provides exercise routines, performance analytics, and motivational features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Health and Safety Disclaimer</h2>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">Important Health Notice</p>
              <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                Consult with a healthcare professional before starting any exercise program. Our app provides general fitness guidance and is not a substitute for professional medical advice.
              </p>
            </div>
            
            <ul className="list-disc ml-6 space-y-2 text-foreground/80">
              <li>You acknowledge that physical exercise involves risk of injury</li>
              <li>You assume full responsibility for any risks, injuries, or damages</li>
              <li>You should stop exercising immediately if you experience pain, dizziness, or discomfort</li>
              <li>Our app is not intended to diagnose, treat, cure, or prevent any disease</li>
              <li>Individual results may vary based on personal factors and commitment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">User Responsibilities</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">As a user of Plank Coach, you agree to:</p>
            <ul className="list-disc ml-6 space-y-1 text-foreground/80">
              <li>Provide accurate and truthful information when creating your account</li>
              <li>Keep your account credentials secure and confidential</li>
              <li>Use the app in accordance with these terms and applicable laws</li>
              <li>Respect other users and maintain appropriate conduct</li>
              <li>Not attempt to reverse engineer, modify, or hack the application</li>
              <li>Not use the app for any commercial purposes without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibend text-foreground mb-3">Prohibited Uses</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">You may not use Plank Coach to:</p>
            <ul className="list-disc ml-6 space-y-1 text-foreground/80">
              <li>Share inappropriate, offensive, or harmful content</li>
              <li>Violate any local, state, national, or international law</li>
              <li>Transmit viruses, malware, or other malicious code</li>
              <li>Attempt to gain unauthorized access to other user accounts</li>
              <li>Interfere with or disrupt the app's functionality</li>
              <li>Create multiple accounts to circumvent restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Account Management</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              You are responsible for maintaining your account and the activities that occur under it. We reserve the right to:
            </p>
            <ul className="list-disc ml-6 space-y-1 text-foreground/80">
              <li>Suspend or terminate accounts for violation of these terms</li>
              <li>Remove content that violates our policies</li>
              <li>Modify or discontinue features with reasonable notice</li>
              <li>Refuse service to anyone at our discretion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Intellectual Property</h2>
            <p className="text-foreground/80 leading-relaxed">
              The Plank Coach app, including its content, features, and functionality, is owned by us and protected by copyright, 
              trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works 
              without our explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Service Availability</h2>
            <p className="text-foreground/80 leading-relaxed">
              We strive to provide reliable service but cannot guarantee uninterrupted access. Our app may be temporarily unavailable 
              due to maintenance, updates, or technical issues. We are not liable for any inconvenience or loss resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Limitation of Liability</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              To the maximum extent permitted by law, Plank Coach and its developers shall not be liable for:
            </p>
            <ul className="list-disc ml-6 space-y-1 text-foreground/80">
              <li>Any direct, indirect, incidental, or consequential damages</li>
              <li>Personal injuries or health issues resulting from app use</li>
              <li>Loss of data, profits, or business opportunities</li>
              <li>Damages arising from third-party services or integrations</li>
              <li>Any damages exceeding the amount paid for our services (if applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Privacy and Data</h2>
            <p className="text-foreground/80 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. 
              By using our app, you consent to our data practices as described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Modifications to Terms</h2>
            <p className="text-foreground/80 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes through 
              the app or via email. Continued use of the app after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Termination</h2>
            <p className="text-foreground/80 leading-relaxed">
              You may terminate your account at any time by deleting it through the app settings. We may terminate or suspend accounts 
              immediately, without prior notice, for any breach of these Terms of Service or for any other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Governing Law</h2>
            <p className="text-foreground/80 leading-relaxed">
              These Terms of Service are governed by and construed in accordance with applicable laws. 
              Any disputes arising from these terms or your use of the app will be resolved through appropriate legal channels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Contact Information</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have questions about these Terms of Service, please contact us through the app's support feature. 
              We're committed to addressing your concerns and ensuring a positive experience with Plank Coach.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Acknowledgment</h2>
            <p className="text-foreground/80 leading-relaxed">
              By using Plank Coach, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
              Thank you for choosing Plank Coach for your fitness journey!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}