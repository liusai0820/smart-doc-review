import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Document, Paragraph } from "@/lib/mock-data";
import { reviewDocumentWithLLM, convertReviewToChanges } from "@/lib/openrouter-api";
import { Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";
import TemplateSelectionDialog from "../dialogs/TemplateSelectionDialog";
import { generatePromptFromTemplate } from "@/lib/review-templates";

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
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleClick = () => {
    // 打开模板选择对话框
    setIsTemplateDialogOpen(true);
  };

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsTemplateDialogOpen(false);
    
    // 开始审阅
    await startReview(templateId);
  };

  const startReview = async (templateId: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    onReviewStart();
    
    try {
      // 生成基于模板的提示词
      const documentContent = document.paragraphs.map(p => p.text).join('\n\n');
      const customPrompt = generatePromptFromTemplate(templateId, document.title, documentContent);
      
      // 调用审阅API
      const reviewResult = await reviewDocumentWithLLM(document, customPrompt);
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
    <>
      <Button
        onClick={handleClick}
        className="flex items-center gap-1"
        variant="default"
        size="sm"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Sparkles size={16} className="animate-spin" />
            <span>正在审阅...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>AI文档审阅</span>
          </>
        )}
      </Button>
      
      <TemplateSelectionDialog 
        isOpen={isTemplateDialogOpen}
        document={document}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </>
  );
}