import { Button } from "@/components/ui/button";
import { Document, Paragraph } from "@/lib/mock-data";
import { reviewDocumentWithLLM, convertReviewToChanges } from "@/lib/openrouter-api";
import { Sparkles } from "lucide-react";

interface ReviewButtonProps {
  document: Document;
  onReviewStart: () => void;
  onReviewComplete: (paragraphs: Paragraph[]) => void;
}

export default function ReviewButton({
  document,
  onReviewStart,
  onReviewComplete
}: ReviewButtonProps) {
  const handleClick = async () => {
    onReviewStart();
    
    try {
      const reviewResult = await reviewDocumentWithLLM(document);
      const paragraphs = convertReviewToChanges(reviewResult);
      onReviewComplete(paragraphs);
    } catch (error) {
      console.error('审阅失败:', error);
      // TODO: 添加错误提示
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="flex items-center gap-1"
      variant="default"
      size="sm"
    >
      <Sparkles size={16} />
      <span>AI文档审阅</span>
    </Button>
  );
} 