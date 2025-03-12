import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Document, Paragraph } from "@/lib/mock-data";
import { reviewDocumentWithLLM, convertReviewToChanges } from "@/lib/openrouter-api";
import { Sparkles } from "lucide-react";
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

  const handleClick = () => {
    // 打开模板选择对话框
    setIsTemplateDialogOpen(true);
  };

  const handleTemplateSelect = async (templateId: string) => {
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
        .map(p => {
          // 处理HTML内容，去除HTML标签
          if (typeof p.text === 'string') {
            return p.isHtml 
              ? p.text.replace(/<[^>]*>/g, '') 
              : p.text;
          }
          return '';
        })
        .filter(text => text.trim() !== '')
        .join('\n\n');
      
      // 获取模板
      const template = getTemplateById(templateId);
      
      // 根据模板类型进行预处理
      let enhancedContent = documentContent;
      
      // 如果是公文类，添加公文格式检查信息
      if (template.category === "公文" || template.category === "党政文件") {
        // 获取公文格式指南
        const formatGuide = getFormatGuideByType(template.name);
        if (formatGuide) {
          // 简单检查公文格式要素
          const elements = formatGuide.commonElements || [];
          const missingRequired = elements
            .filter((e: { required: boolean; name: string }) => e.required)
            .filter((e: { name: string }) => !documentContent.includes(e.name))
            .map((e: { name: string }) => e.name);
          
          if (missingRequired.length > 0) {
            // 添加公文格式提示
            enhancedContent = `[公文格式提示] 该文档可能缺少以下必要的公文要素: ${missingRequired.join(', ')}。\n\n${documentContent}`;
          }
        }
      }
      
      // 生成基于模板的提示词
      const customPrompt = generatePromptFromTemplate(templateId, document.title, enhancedContent);
      
      // 从localStorage获取API密钥和模型设置
      const storedApiKey = localStorage.getItem('openrouter_api_key');
      const storedModel = localStorage.getItem('llm_model');
      
      // 添加日志调试
      console.log('审阅配置:', {
        templateId,
        templateName: template.name,
        templateCategory: template.category,
        documentTitle: document.title,
        contentLength: enhancedContent.length,
        storedModel,
        hasStoredApiKey: !!storedApiKey
      });
      
      // 调用审阅API，使用增强的审阅提示词
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
        className={`text-white font-medium flex items-center gap-1 shadow-sm ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        variant="default"
        size="sm"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
            <span>审阅中...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>开始审阅</span>
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

// Define getTemplateById and getFormatGuideByType functions
function getTemplateById(templateId: string): { name: string; category: string } {
  // Mock implementation
  return { name: "Template Name", category: "Category" };
}

function getFormatGuideByType(type: string): { commonElements: { required: boolean; name: string }[] } {
  // Mock implementation
  return { commonElements: [{ required: true, name: "Element Name" }] };
}