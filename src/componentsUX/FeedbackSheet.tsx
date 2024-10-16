import { useState } from "react";
import { Bug } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import styles from "./FeedbackSheet.module.css";
import { sendFeedbackInside } from "../utils/api";

export function FeedbackSheet() {
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendFeedbackInside(feedbackType, feedbackText);
      toast({
        title: "Feedback enviado",
        description: "Gracias por tu feedback. Lo revisaremos pronto.",
      });
      setFeedbackType("");
      setFeedbackText("");
    } catch (error) {
      console.error("Error al enviar feedback:", error);
      toast({
        title: "Error",
        description:
          "Hubo un problema al enviar tu feedback. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className={styles.feedbackButtonPulse}>
          <Bug className="h-[1.2rem] w-[1.2rem]" />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Enviar Feedback</SheetTitle>
          <SheetDescription>
            Comparte tus ideas para mejorar nuestra aplicación.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Select onValueChange={setFeedbackType} value={feedbackType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de feedback" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">Reportar un bug</SelectItem>
              <SelectItem value="feature">
                Sugerir una característica
              </SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Describe tu feedback aquí..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={5}
          />
          <Button type="submit" className="w-full">
            Enviar Feedback
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
