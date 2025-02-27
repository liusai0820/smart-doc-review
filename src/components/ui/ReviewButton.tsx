import { Button } from "@/components/ui/button";
import { Document, Paragraph } from "@/lib/mock-data";
import { reviewDocumentWithLLM, convertReviewToChanges } from "@/lib/openrouter-api";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    onReviewStart();
    
    try {
      const reviewResult = await reviewDocumentWithLLM(document);
      console.log('获取到审阅结果:', reviewResult);
      
      if (!reviewResult.reviewContent || reviewResult.reviewContent.length === 0) {
        throw new Error('审阅结果为空');
      }

      const paragraphs = convertReviewToChanges(reviewResult);
      console.log('转换后的段落:', paragraphs);
      
      if (!paragraphs || paragraphs.length === 0) {
        throw new Error('转换结果为空');
      }

      onReviewComplete(paragraphs);
      toast.success('文档审阅完成');
    } catch (error) {
      console.error('审阅失败:', error);
      toast.error('审阅失败: ' + (error instanceof Error ? error.message : '未知错误'));
      // 在错误时也调用 onReviewComplete，但传入原始段落
      onReviewComplete(document.paragraphs);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="flex items-center gap-1"
      variant="default"
      size="sm"
      disabled={isLoading}
    >
      <Sparkles size={16} className={isLoading ? 'animate-spin' : ''} />
      <span>{isLoading ? '正在审阅...' : 'AI文档审阅'}</span>
    </Button>
  );
} 