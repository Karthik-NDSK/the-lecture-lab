import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Onboarding() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateDisplayName = useMutation(api.users.updateDisplayName);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  if (user?.hasCompletedOnboarding) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDisplayName({ displayName: displayName.trim() });
      toast.success("Welcome to The Lecture Lab!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to save your name");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border shadow-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <span className="text-4xl">📚</span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome to The Lecture Lab
              </CardTitle>
              <CardDescription className="text-sm">
                Let's get you set up in just a moment
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium">
                  What should we call you?
                </Label>
                <Input
                  id="displayName"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-11"
                  autoFocus
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 cursor-pointer"
                disabled={isSubmitting || !displayName.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}