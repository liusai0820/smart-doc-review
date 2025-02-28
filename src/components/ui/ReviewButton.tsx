import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Document, Paragraph } from "@/lib/types";
import { reviewDocumentWithLLM, convertReviewToChanges } from "@/lib/openrouter-api";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import TemplateSelectionDialog from "../dialogs/TemplateSelectionDialog";
import { generatePromptFromTemplate } from "@/lib/review-templates";
import { extractDocumentContent } from "@/lib/document-content-extraction";

interface ReviewButtonProps {
  document: Document;
  documentContent?: string | null; // 从父组件传入的已提取文档内容
  onReviewStart: () => void;
  onReviewComplete: (paragraphs: Paragraph[]) => void;
}

export default function ReviewButton({
  document,
  documentContent,
  onReviewStart,
  onReviewComplete
}: ReviewButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const handleClick = (): void => {
    // 打开模板选择对话框
    setIsTemplateDialogOpen(true);
  };

  const handleTemplateSelect = async (templateId: string): Promise<void> => {
    setIsTemplateDialogOpen(false);
    
    // 开始审阅
    await startReview(templateId);
  };

  const startReview = async (templateId: string): Promise<void> => {
    if (isLoading || !document) return;
    
    setIsLoading(true);
    onReviewStart();
    
    try {
      // 确保有文档内容可以审阅
      let content = documentContent;
      
      // 如果没有传入内容，尝试提取
      if (!content) {
        console.log("从文档中提取内容", {
          title: document.title,
          paragraphCount: document.paragraphs?.length || 0,
          hasContent: !!document.content,
          contentType: document.content ? typeof document.content : 'undefined'
        });
        
        content = extractDocumentContent(document);
        
        console.log("提取的内容信息", {
          hasContent: !!content,
          contentLength: content?.length || 0,
          preview: content?.substring(0, 100)
        });
      }
      
      // 验证内容
      if (!content || content.trim().length < 10) {
        console.error("文档内容验证失败", {
          hasContent: !!content,
          contentLength: content?.length || 0,
          trimmedLength: content?.trim().length || 0
        });
        throw new Error("文档内容为空或太短，无法进行有效审阅");
      }
      
      // 打印文档内容预览，确认内容被正确提取
      console.log('文档内容:', {
        title: document.title,
        contentPreview: content.substring(0, 100) + '...',
        contentLength: content.length,
        paragraphCount: document.paragraphs.length,
        firstParagraph: document.paragraphs[0]?.text?.substring(0, 50)
      });
      
      // 生成基于模板的提示词
      const customPrompt = generatePromptFromTemplate(templateId, document.title, content);
      
      // 打印提示词预览，确认文档内容被包含
      console.log('提示词信息:', {
        templateId,
        promptLength: customPrompt.length,
        contentIncluded: customPrompt.includes(content.substring(0, 30)),
        promptPreview: customPrompt.substring(0, 100),
        contentPosition: customPrompt.indexOf(content.substring(0, 30))
      });
      
      // 从localStorage获取API密钥和模型设置
      const storedApiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('openrouter_api_key') : null;
      const storedModel = typeof localStorage !== 'undefined' ? localStorage.getItem('llm_model') : null;
      
      // 显示开始审阅的通知，包含内容长度信息
      toast.info(`正在分析文档... (${content.length}字符)`);
      
      // 创建超时Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("审阅请求超时，请稍后重试")), 120000); // 2分钟超时
      });
      
      // 直接调用API
      const reviewPromise = reviewDocumentWithLLM(
        document,
        storedApiKey || undefined,
        storedModel || undefined,
        customPrompt
      );
      
      // 使用Promise.race在超时和API请求之间竞争
      const reviewResult = await Promise.race([reviewPromise, timeoutPromise]);
      
      // 打印审阅结果概要，帮助调试
      console.log('收到审阅结果:', {
        overview: reviewResult.documentInfo.overview,
        reviewContentCount: reviewResult.reviewContent?.length,
        totalIssues: reviewResult.documentInfo.totalIssues
      });
      
      // 验证审阅结果
      if (!reviewResult.reviewContent || !Array.isArray(reviewResult.reviewContent)) {
        console.error('无效的审阅结果内容:', reviewResult);
        throw new Error("审阅结果结构无效");
      }
      
      // 检查是否有任何修改建议
      const hasChanges = reviewResult.reviewContent.some(
        content => Array.isArray(content.changes) && content.changes.length > 0
      );
      
      if (!hasChanges) {
        toast.info("文档审阅完成，未发现需要修改的内容");
      }
  
      // 转换结果格式
      const paragraphs = convertReviewToChanges(reviewResult);
      
      // 确保paragraphs不为null或undefined
      if (!paragraphs) {
        throw new Error("转换审阅结果失败");
      }
      
      // 统计变更数量
      const errorCount = paragraphs.reduce((sum: number, p: Paragraph) => 
        sum + (p.changes?.filter(c => c.severity === 'error')?.length || 0), 0);
      const warningCount = paragraphs.reduce((sum: number, p: Paragraph) => 
        sum + (p.changes?.filter(c => c.severity === 'warning')?.length || 0), 0);
      const infoCount = paragraphs.reduce((sum: number, p: Paragraph) => 
        sum + (p.changes?.filter(c => c.severity === 'info')?.length || 0), 0);
      
      // 调用回调函数
      onReviewComplete(paragraphs);
      
      // 显示成功通知
      toast.success(`文档审阅完成: ${errorCount}个错误, ${warningCount}个警告, ${infoCount}个建议`);
      
    } catch (error) {
      console.error('审阅失败:', error);
      
      // 友好的错误消息
      const errorMessage = error instanceof Error 
        ? error.message
        : "审阅过程中发生未知错误";
      
      // 判断错误类型并显示具体提示
      if (errorMessage.toLowerCase().includes("内容为空") || 
          errorMessage.toLowerCase().includes("太短")) {
        toast.error("文档内容提取失败或内容太少，无法进行有效审阅");
      } else if (errorMessage.toLowerCase().includes("api") || 
                errorMessage.toLowerCase().includes("密钥")) {
        toast.error("API调用失败，请检查API密钥设置");
      } else {
        toast.error(`审阅失败: ${errorMessage}`);
      }
      
      // 返回空结果，确保UI不会卡住
      onReviewComplete(document.paragraphs.map(p => ({
        ...p,
        changes: []
      })));
    } finally {
      setIsLoading(false);
    }
  };

  // 禁用按钮的条件
  const isDisabled = isLoading || !document || !document.paragraphs || document.paragraphs.length === 0;

  return (
    <>
      <Button
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center gap-1 shadow-sm"
        variant="default"
        size="sm"
        disabled={isDisabled}
        title={documentContent ? 
          `审阅文档 (${documentContent.length}字符)` : 
          "审阅文档"}
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
            <span>审阅中...</span>
          </>
        ) : isDisabled ? (
          <>
            <Sparkles className="h-4 w-4" />
            <span>请先选择文档</span>
          </>
        ) : !documentContent || documentContent.length < 10 ? (
          <>
            <Sparkles className="h-4 w-4" />
            <span>内容为空</span>
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