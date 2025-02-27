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
      // 确保文档内容正确处理
      const documentContent = document.paragraphs
        .map(p => typeof p.text === 'string' ? p.text : '')
        .filter(text => text.trim() !== '')
        .join('\n\n');
      
      // 生成基于模板的提示词
      const customPrompt = generatePromptFromTemplate(templateId, document.title, documentContent);
      
      // 从localStorage获取API密钥和模型设置
      const storedApiKey = localStorage.getItem('openrouter_api_key');
      const storedModel = localStorage.getItem('llm_model');
      
      // 添加日志调试
      console.log('审阅配置:', {
        templateId,
        documentTitle: document.title,
        contentLength: documentContent.length,
        storedModel,
        hasStoredApiKey: !!storedApiKey
      });
      
      // 调用审阅API
      const reviewResult = await reviewDocumentWithLLM(
        document,
        storedApiKey || undefined,
        storedModel || undefined,
        customPrompt
      );
      
      if (!reviewResult.reviewContent || reviewResult.reviewContent.length === 0) {
        throw new Error('审阅结果为空');
      }
  
      const paragraphs = convertReviewToChanges(reviewResult);
      onReviewComplete(paragraphs);
      toast.success('文档审阅完成');
    } catch (error) {
      console.error('审阅失败:', error);
      toast.error('审阅失败: ' + (error instanceof Error ? error.message : '未知错误'));
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