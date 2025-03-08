import React, { useState, useEffect } from "react";
import { MessageSquare, FileText, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Document, Paragraph } from "@/lib/types";
import DocViewer from "./DocViewer";
import ChangesView from "./ChangesView";
import ReviewButton from "../ui/ReviewButton";
import ExportButton from "../ui/ExportButton";
import DebugTools from "../ui/DebugTools";
import { toast } from "sonner";
import { extractDocumentContent } from "@/lib/document-content-extraction";
import EnhancedReviewView from "./EnhancedReviewView";

interface DocumentViewerProps {
  document: Document | null;
  onReviewStart?: () => void;
  onReviewComplete?: (paragraphs: Paragraph[]) => void;
}

export default function DocumentViewer({ 
  document, 
  onReviewStart,
  onReviewComplete 
}: DocumentViewerProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [aiReviewedParagraphs, setAiReviewedParagraphs] = useState<Paragraph[] | null>(null);
  const [activeTab, setActiveTab] = useState("original");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isDebugToolsOpen, setIsDebugToolsOpen] = useState(false);
  const [documentContent, setDocumentContent] = useState<string | null>(null);

  // 当文档变更时重置状态并提取内容
  useEffect(() => {
    setActiveTab("original");
    setIsReviewing(false);
    setAiReviewedParagraphs(null);
    setReviewError(null);
    
    // 提取并验证文档内容
    if (document) {
      const extractContent = async () => {
        try {
          const content = await extractDocumentContent(document);
          setDocumentContent(content);
          
          if (!content || content.length < 10) {
            setReviewError("警告：文档内容为空或太短，无法进行有效审阅");
          } else {
            console.log(`文档内容已提取: ${document.title}`, {
              contentLength: content.length,
              preview: content.substring(0, 100) + '...'
            });
          }
        } catch (error) {
          console.error('提取文档内容失败:', error);
          setReviewError("提取文档内容失败，请重试");
          setDocumentContent(null);
        }
      };
      
      extractContent();
    } else {
      setDocumentContent(null);
    }
  }, [document]);

  // 处理审阅开始
  const handleReviewStart = () => {
    setIsReviewing(true);
    setActiveTab("review");
    onReviewStart?.();
  };

  // 处理审阅完成
  const handleReviewComplete = (paragraphs: Paragraph[]) => {
    setIsReviewing(false);
    setAiReviewedParagraphs(paragraphs);
    onReviewComplete?.(paragraphs);
  };

  // 处理接受修改
  const handleAcceptChange = (paragraphId: number, changeId: string) => {
    if (!aiReviewedParagraphs) return;

    const updatedParagraphs = aiReviewedParagraphs.map(p => {
      if (p.id === paragraphId) {
        const change = p.changes?.find(c => c.id === changeId);
        if (change) {
          // 更新段落文本，应用修改
          let newText = p.text;
          if (change.type === 'replace' || change.type === 'deletion') {
            const start = change.position?.start ?? 0;
            const end = change.position?.end ?? 0;
            newText = newText.slice(0, start) + 
                     (change.type === 'replace' ? change.new : '') + 
                     newText.slice(end);
          } else if (change.type === 'addition') {
            const start = change.position?.start ?? 0;
            newText = newText.slice(0, start) + 
                     change.new + 
                     newText.slice(start);
          }
          
          return {
            ...p,
            text: newText,
            changes: p.changes?.filter(c => c.id !== changeId)
          };
        }
      }
      return p;
    });

    setAiReviewedParagraphs(updatedParagraphs);
  };

  // 处理拒绝修改
  const handleRejectChange = (paragraphId: number, changeId: string) => {
    if (!aiReviewedParagraphs) return;

    const updatedParagraphs = aiReviewedParagraphs.map(p => {
      if (p.id === paragraphId) {
        return {
          ...p,
          changes: p.changes?.filter(c => c.id !== changeId)
        };
      }
      return p;
    });

    setAiReviewedParagraphs(updatedParagraphs);
  };

  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <FileText className="h-8 w-8 text-gray-400 mb-3" />
        <div className="text-sm text-center">
          <p className="mb-1">暂无文档</p>
          <p className="text-xs text-gray-400">请从左侧选择或上传文档</p>
        </div>
      </div>
    );
  }

  // 计算各类型问题的数量
  const paragraphsToUse = aiReviewedParagraphs || document.paragraphs;
  const errorCount = paragraphsToUse.flatMap(p => p.changes).filter(c => c.severity === 'error').length;
  const warningCount = paragraphsToUse.flatMap(p => p.changes).filter(c => c.severity === 'warning').length;
  const infoCount = paragraphsToUse.flatMap(p => p.changes).filter(c => c.severity === 'info').length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          <ReviewButton 
            document={document}
            onReviewStart={handleReviewStart}
            onReviewComplete={handleReviewComplete}
            documentContent={documentContent}
          />
          <ExportButton 
            document={aiReviewedParagraphs ? {...document, paragraphs: aiReviewedParagraphs} : document} 
            isLoading={isReviewing}
          />
          {process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setIsDebugToolsOpen(true)}
            >
              <Bug size={16} />
              <span>调试</span>
            </Button>
          )}
          <div className="flex gap-2">
            <span className="badge-error">错误 {errorCount}</span>
            <span className="badge-warning">警告 {warningCount}</span>
            <span className="badge-info">建议 {infoCount}</span>
          </div>
        </div>
      </div>

      {reviewError && (
        <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
          ⚠️ {reviewError}
        </div>
      )}
      
      {/* 显示文档内容信息 */}
      {documentContent && (
        <div className="mb-4 p-2 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs flex justify-between">
          <span>文档内容: {document.paragraphs.length}段落, {documentContent.length}字符</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 px-2 py-0 text-xs text-blue-700 hover:bg-blue-100"
            onClick={() => {
              toast.info(
                <div>
                  <p className="font-bold mb-1">文档内容预览</p>
                  <p className="text-xs max-h-40 overflow-auto">{documentContent.substring(0, 200)}...</p>
                </div>
              );
            }}
          >
            查看预览
          </Button>
        </div>
      )}
      
      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="original">原文视图</TabsTrigger>
            <TabsTrigger value="review">审阅视图</TabsTrigger>
          </TabsList>
          <TabsContent value="original" className="flex-1 mt-4">
            {document.content instanceof ArrayBuffer ? (
              <DocViewer content={document.content} />
            ) : document.fileUrl ? (
              <DocViewer fileUrl={document.fileUrl} />
            ) : documentContent ? (
              <div className="h-full p-4 space-y-4 bg-white rounded border text-gray-800 overflow-auto">
                {documentContent.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="leading-7">{paragraph}</p>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400 mb-3" />
                <div className="text-sm text-center">
                  <p className="mb-1">无法预览文档</p>
                  <p className="text-xs text-gray-400">未找到文件内容或URL</p>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="review" className="flex-1 mt-4">
            {isReviewing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="text-sm text-gray-500">AI 正在分析文档...</p>
              </div>
            ) : reviewError ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="text-red-500">{reviewError}</div>
                <button 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                  onClick={() => setReviewError(null)}
                >
                  重试
                </button>
              </div>
            ) : (
              <div className="h-full overflow-auto">
                <EnhancedReviewView 
                  paragraphs={aiReviewedParagraphs || document.paragraphs}
                  onAcceptChange={handleAcceptChange}
                  onRejectChange={handleRejectChange}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {!isReviewing && !reviewError && (
        <div className="mt-4 flex items-center justify-center text-gray-400 text-xs">
          <MessageSquare size={14} className="mr-1" />
          <span>点击高亮修改处可查看修改建议并选择接受或拒绝</span>
        </div>
      )}
      
      <DebugTools 
        isOpen={isDebugToolsOpen}
        onClose={() => setIsDebugToolsOpen(false)}
        document={document}
        documentContent={documentContent}
      />
    </div>
  );
}