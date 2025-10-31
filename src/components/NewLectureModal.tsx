import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useMutation, useAction } from "convex/react";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface NewLectureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const loadingMessages = [
  "🧠 AI is reading your notes...",
  "📝 Generating questions...",
  "✨ Creating your study materials...",
];

export function NewLectureModal({ open, onOpenChange }: NewLectureModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const createLecture = useMutation(api.lectures.create);
  const generateMaterials = useAction(api.aiGeneration.generateStudyMaterials);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsProcessing(true);
    setLoadingMessageIndex(0);

    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    try {
      const lectureId = await createLecture({ title, content });

      // Trigger AI generation
      await generateMaterials({ lectureId, title, content });

      clearInterval(messageInterval);
      toast.success("Study materials created!");
      onOpenChange(false);
      setTitle("");
      setContent("");
      navigate(`/lecture/${lectureId}`);
    } catch (error) {
      clearInterval(messageInterval);
      toast.error("Failed to create lecture");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {!isProcessing ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl">Create New Lecture</DialogTitle>
                <DialogDescription>
                  Paste your lecture notes and let AI create interactive study materials
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Lecture Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Introduction to Machine Learning"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Paste Your Lecture Notes</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste your lecture notes here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {content.length} characters
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer"
                    disabled={!title.trim() || !content.trim()}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Study Materials
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-16 text-center"
            >
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
              <motion.p
                key={loadingMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-medium"
              >
                {loadingMessages[loadingMessageIndex]}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
