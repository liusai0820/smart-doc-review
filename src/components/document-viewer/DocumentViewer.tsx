import DocumentFormatChecker from '../ui/DocumentFormatChecker';
import FormatGuideButton from '../ui/FormatGuideButton';
import { useState } from "react";
import { MessageSquare, FileText, Bug, FileX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Document, Paragraph } from "@/lib/mock-data";
import OriginalView from "./OriginalView";
import EnhancedReviewView from "./ReviewView";
import TrackChangesView from "./TrackChangesView";
import ReviewButton from "../ui/ReviewButton";
import ExportButton from "../ui/ExportButton";
import DebugTools from "../ui/DebugTools";
import { toast } from "sonner";

interface DocumentViewerProps {
  document: Document | null;
  onReviewComplete?: (paragraphs: Paragraph[]) => void;
}

export default function DocumentViewer({ document, onReviewComplete }: DocumentViewerProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [aiReviewedParagraphs, setAiReviewedParagraphs] = useState<Paragraph[] | null>(null);
  const [activeTab, setActiveTab] = useState("review");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isDebugToolsOpen, setIsDebugToolsOpen] = useState(false);

  // 处理AI审阅开始
  const handleReviewStart = () => {
    setIsReviewing(true);
    setAiReviewedParagraphs(null);
    setReviewError(null);
  };

  // 处理AI审阅完成
  const handleReviewComplete = (paragraphs: Paragraph[]) => {
    setIsReviewing(false);
    
    if (!paragraphs || paragraphs.length === 0) {
      setReviewError("审阅结果为空，请重试");
      return;
    }
    
    try {
      setAiReviewedParagraphs(paragraphs);
      // 调用父组件的回调函数
      onReviewComplete?.(paragraphs);
    } catch (error) {
      console.error("处理审阅结果失败:", error);
      setReviewError("处理审阅结果失败，请重试");
    }
  };
  
  // 处理接受变更
  const handleAcceptChange = (paragraphId: number, changeId: string) => {
    if (!aiReviewedParagraphs || !document) return;
    
    // 更新审阅过的段落
    const updatedParagraphs = aiReviewedParagraphs.map(paragraph => {
      if (paragraph.id === paragraphId) {
        const change = paragraph.changes.find(c => c.id === changeId);
        
        if (change) {
          let updatedText = paragraph.text;
          
          // 应用变更
          if (change.type === 'replace' && change.original && change.new) {
            updatedText = updatedText.replace(change.original, change.new);
          } else if (change.type === 'deletion' && change.original) {
            updatedText = updatedText.replace(change.original, '');
          } else if (change.type === 'addition' && change.new) {
            updatedText += ' ' + change.new;
          }
          
          // 返回更新后的段落，移除已接受的变更
          return {
            ...paragraph,
            text: updatedText,
            changes: paragraph.changes.filter(c => c.id !== changeId)
          };
        }
      }
      
      return paragraph;
    });
    
    setAiReviewedParagraphs(updatedParagraphs);
    
    // 显示通知
    toast.success("已接受修改建议");
  };

  // 处理拒绝变更
  const handleRejectChange = (paragraphId: number, changeId: string) => {
    if (!aiReviewedParagraphs) return;
    
    // 更新审阅过的段落，移除被拒绝的变更
    const updatedParagraphs = aiReviewedParagraphs.map(paragraph => {
      if (paragraph.id === paragraphId) {
        return {
          ...paragraph,
          changes: paragraph.changes.filter(c => c.id !== changeId)
        };
      }
      return paragraph;
    });
    
    setAiReviewedParagraphs(updatedParagraphs);
    
    // 显示通知
    toast.info("已拒绝修改建议");
  };
  
  if (!document) {
    return (
      <Card className="h-full">
        <div className="empty-state">
          <FileX className="empty-state-icon" />
          <h3 className="empty-state-title">暂无文档</h3>
          <p className="empty-state-description">请从左侧选择一个文档或上传新文档</p>
        </div>
      </Card>
    );
  }

  // 计算各类型问题的数量
  const paragraphsToUse = aiReviewedParagraphs || document.paragraphs;
  const errorCount = paragraphsToUse.flatMap(p => p.changes).filter(c => c.severity === 'error').length;
  const warningCount = paragraphsToUse.flatMap(p => p.changes).filter(c => c.severity === 'warning').length;
  const infoCount = paragraphsToUse.flatMap(p => p.changes).filter(c => c.severity === 'info').length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-800 tracking-wide flex items-center gap-2">
            <FileText size={18} className="text-gray-500" />
            {document.title}
          </CardTitle>
          <div className="flex gap-4 items-center">
            <ReviewButton 
              document={document}
              onReviewStart={handleReviewStart}
              onReviewComplete={handleReviewComplete}
            />
            <ExportButton 
              document={aiReviewedParagraphs ? {...document, paragraphs: aiReviewedParagraphs} : document} 
              isLoading={isReviewing}
            />
            <FormatGuideButton document={document} />
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
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="review">审阅视图</TabsTrigger>
            <TabsTrigger value="original">原文</TabsTrigger>
            <TabsTrigger value="track">变更追踪</TabsTrigger>
          </TabsList>
          <TabsContent value="original">
            <OriginalView paragraphs={document.paragraphs} />
          </TabsContent>
          <TabsContent value="review">
            {isReviewing ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-260px)] space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="text-gray-500">AI 正在分析文档...</p>
              </div>
            ) : reviewError ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-260px)] space-y-4">
                <div className="text-red-500">{reviewError}</div>
                <button 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                  onClick={() => setReviewError(null)}
                >
                  重试
                </button>
              </div>
            ) : (
              <EnhancedReviewView 
                paragraphs={aiReviewedParagraphs || document.paragraphs}
                onAcceptChange={handleAcceptChange}
                onRejectChange={handleRejectChange}
              />
            )}
          </TabsContent>
          <TabsContent value="track">
            {isReviewing ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-260px)] space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="text-gray-500">AI 正在分析文档...</p>
              </div>
            ) : reviewError ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-260px)] space-y-4">
                <div className="text-red-500">{reviewError}</div>
                <button 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                  onClick={() => setReviewError(null)}
                >
                  重试
                </button>
              </div>
            ) : (
              <TrackChangesView 
                paragraphs={aiReviewedParagraphs || document.paragraphs}
                onAcceptChange={handleAcceptChange}
                onRejectChange={handleRejectChange}
              />
            )}
          </TabsContent>
        </Tabs>
        
        {!isReviewing && !reviewError && (
          <div className="mt-4 flex items-center justify-center text-gray-400 text-xs">
            <MessageSquare size={14} className="mr-1" />
            <span>点击高亮修改处可查看修改建议并选择接受或拒绝</span>
          </div>
        )}
      </CardContent>
      
      <DebugTools 
        isOpen={isDebugToolsOpen}
        onClose={() => setIsDebugToolsOpen(false)}
        document={document}
      />
    </Card>
  );
}