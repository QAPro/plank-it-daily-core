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

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Inner Fire?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Inner Fire is your personal partner in transformation. It's more than just a fitness app; it's a tool designed to help you build consistency, celebrate your progress, and connect with a supportive community, all while igniting the powerful fire within you.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I start my first workout?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Ready to ignite your journey? It's simple! From the Home screen, set the timer and tap Start Workout to begin your featured workout, like the "Forearm Plank," OR navigate to the Workouts tab to explore a full library of exercises. Choose one that's right for you, and tap "Select" to begin!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>How does the workout timer work?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    The timer is your guide through every moment of effort. You can tap the timer to easily set your preferred workout time or you can use the +5s and -5s buttons to instantly adjust your time by 5-second increments. Once you start a workout, the main timer will count down the duration of your exercise or hold. When the timer hits zero, your workout is complete!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>What are achievements and how do I earn them?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Achievements are milestones that celebrate your progress! You earn them by completing workouts, maintaining streaks, and exploring new exercises. Think of them as badges of honor that mark key moments in your fitness journey. You can view all your earned and upcoming achievements in the Achievements tab.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I add friends?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Your journey is more powerful when shared. To connect with others, head to the Friends tab. Here, you can search for friends by their username or email and send a request to connect. Building your circle of support is a great way to stay motivated and celebrate each other's progress.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>How do I control my privacy?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Your journey is yours to share as you see fit. You are in complete control. Navigate to Settings (the gear icon ⚙️) and select "Privacy." Here, you can easily decide who sees your profile, workout activity, and achievements. Tailor your settings to create the experience that feels right for you.
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
