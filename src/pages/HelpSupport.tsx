import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpSupport = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
            <p className="text-muted-foreground">We're here to help</p>
          </div>
        </motion.div>

        {/* Getting Started */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="getting-1">
                  <AccordionTrigger>What is Inner Fire?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Inner Fire is your personal partner in transformation. It's more than just a fitness app; it's a tool designed to help you build consistency, celebrate your progress, and connect with a supportive community, all while igniting the powerful fire that drives you from within.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="getting-2">
                  <AccordionTrigger>How do I navigate the app?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    The navigation bar at the bottom of the screen is your compass. It has five key areas:<br/><br/>
                    <strong>Home:</strong> Your daily dashboard and starting point.<br/>
                    <strong>Stats:</strong> A detailed look at your progress and history.<br/>
                    <strong>Workouts:</strong> Your library of exercises and routines.<br/>
                    <strong>Achievements:</strong> A gallery of your earned badges and milestones.<br/>
                    <strong>Friends:</strong> Your connection to the Inner Fire community.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Workouts & Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Workouts & Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="workout-1">
                  <AccordionTrigger>How do I start my first workout?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Ready to ignite your journey? It's simple! From the Home screen, set the timer and tap Start Workout to begin your featured workout, like the "Forearm Plank," OR navigate to the Workouts tab to explore a full library of exercises. Choose one that's right for you, and tap "Select" to begin!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="workout-2">
                  <AccordionTrigger>How does the workout timer work?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    The timer is your guide through every moment of effort. You can tap the timer to easily set your preferred workout time or you can use the +5s and -5s buttons to instantly adjust your time by 5-second increments giving you the power to shorten or extend your challenge based on how you feel. Once you start a workout, the main timer will count down the duration of your exercise or hold. When the timer hits zero, your workout is complete!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="workout-3">
                  <AccordionTrigger>Can I do more than one workout per day?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Absolutely! Your ambition is the only limit. While the app tracks your daily streak for consistency, you can certainly complete as many workouts as you feel comfortable with. Each completed workout will be logged in your Stats page, where your overall progress is displayed. When you dedicate time to your health, you get to feel the improvement.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="workout-4">
                  <AccordionTrigger>Where can I see my past workouts?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Your history of dedication is always available to you. Navigate to the Stats tab to see a complete log of your completed workouts, including dates, durations, and types of exercises. Use this to reflect on how far you've come!
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements & Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="achieve-1">
                  <AccordionTrigger>What are achievements and how do I earn them?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Achievements are milestones that celebrate your dedication and your progress! You earn them by completing workouts, maintaining streaks, and exploring new exercises. Think of them as badges of honor that mark key moments in your fitness journey. You can view all your earned and upcoming achievements in the Achievements tab.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="achieve-2">
                  <AccordionTrigger>What is a "Day Streak"?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Your Day Streak is a powerful symbol of your consistency. It represents the number of consecutive days you have completed at least one workout. It's a testament to your commitment to showing up for yourself, day after day. Keep that fire burning! Even just 5 minutes a day, just for you.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="achieve-3">
                  <AccordionTrigger>How is my "Momentum" calculated?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Momentum is the energy you build with every workout. It's a score that reflects your recent activity and consistency. The more you work out, the more momentum you build. It's designed to motivate you and help you maintain your rhythm of improvement.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Friends & Social */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Friends & Social</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="friend-1">
                  <AccordionTrigger>How do I add friends?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Your journey is more powerful when shared. To connect with others, head to the Friends tab. Here, you can search for friends by their username or email and send a request to connect. Building your circle of support is a great way to stay motivated and celebrate each other's progress.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="friend-2">
                  <AccordionTrigger>What information can my friends see?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    You are in control of what you share. Depending on your privacy settings, your friends can see your profile, workout activity, and earned achievements. You can customize these settings at any time to create the experience that feels right for you.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings & Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Settings & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="privacy-1">
                  <AccordionTrigger>How do I control my privacy?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Your journey is yours to share as you see fit. You are in complete control. Navigate to Settings (the gear icon ⚙️) and select "Privacy Settings". Here, you can easily decide who sees your profile, workout activity, and achievements. Tailor your settings to your level of comfort.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy-2">
                  <AccordionTrigger>What happens if I set my profile to "Private"?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Choosing "Private" means your journey is for your eyes only. When you set your profile to Private, all other visibility settings are automatically locked to their most restrictive state. Your activity will not be shared with anyone, and you will not be able to send or receive friend requests. It's the ultimate solo-flight mode.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy-3">
                  <AccordionTrigger>How do I change my app's theme from light to dark mode?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Customize your environment to match your mood. Go to Settings and you can toggle between the light and dark themes. Choose the one that feels most comfortable and inspiring for you.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account & Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Account & Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="account-1">
                  <AccordionTrigger>How do I change my username or email address?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    To update your account details, go to Settings &gt; Profile. Here you can change your username, avatar, and first name by clicking the "Edit" button. To change your email address, click the "Change" button next to your current email - you'll receive a verification link to complete the change. To change your password, click the "Change Password" button on your profile.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="account-2">
                  <AccordionTrigger>How is my data used?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Your data is used to power your in-app experience—to track your progress, award you achievements, and connect you with friends. We are committed to protecting your privacy. For more details, please review our full Privacy Policy.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="account-3">
                  <AccordionTrigger>How do I delete my account?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    If you choose to end your journey with Inner Fire, you can request account deletion by going to Settings &gt; Privacy Settings &gt; Privacy Tools &gt; Delete Account. Please be aware that account deletion requires verification and contacting support@innerfire.app. This action is permanent and will erase all your workout history, achievements, and social connections within the app.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email us at</p>
                  <p className="font-medium text-foreground">support@innerfire.app</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Contact functionality will be added soon
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpSupport;
