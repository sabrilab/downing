import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LearningDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Learning Resources</DialogTitle>
          <DialogDescription>
            Learn about instructional design and best practices
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Card className="cursor-pointer hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-start space-x-4">
              <BookOpen className="h-8 w-8 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  Learning resources and articles will be available in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}