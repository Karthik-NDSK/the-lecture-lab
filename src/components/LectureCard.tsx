import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import type { Doc } from "@/convex/_generated/dataModel";

interface LectureCardProps {
  lecture: Doc<"lectures">;
  index: number;
}

export function LectureCard({ lecture, index }: LectureCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <CardHeader>
          <CardTitle className="text-lg line-clamp-2">{lecture.title}</CardTitle>
          <CardDescription>
            {formatDistanceToNow(lecture.createdAt, { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lecture.status === "processing" && (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}

          {lecture.status === "error" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Generation Failed</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="cursor-pointer">
                  Retry
                </Button>
                <Button size="sm" variant="destructive" className="cursor-pointer">
                  Delete
                </Button>
              </div>
            </div>
          )}

          {lecture.status === "ready" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {lecture.summary}
              </p>
              <Button
                className="w-full cursor-pointer"
                onClick={() => navigate(`/lecture/${lecture._id}`)}
              >
                Study
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
