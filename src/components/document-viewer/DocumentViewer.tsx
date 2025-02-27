import { useState } from "react";
import { MessageSquare, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Document, Paragraph } from "@/lib/mock-data";
import OriginalView from "./OriginalView";
import ReviewView from "./ReviewView";
import ReviewButton from "../ui/ReviewButton";
import ExportButton from "../ui/ExportButton"; // 导入导出按钮

interface DocumentViewerProps {
  document: Document | null;
  onReviewComplete?: (paragraphs: Paragraph[]) => void;
}

export default function DocumentViewer({ document, onReviewComplete }: DocumentViewerProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [aiReviewedParagraphs, setAiReviewedParagraphs] = useState<Paragraph[] | null>(null);
  const [activeTab, setActiveTab] = useState("review");

  // 处理AI审阅开始
  const handleReviewStart = () => {
    setIsReviewing(true);
    setAiReviewedParagraphs(null);
  };

  // 处理AI审阅完成
  const handleReviewComplete = (paragraphs: Paragraph[]) => {
    setIsReviewing(false);
    setAiReviewedParagraphs(paragraphs);
    // 调用父组件的回调函数
    onReviewComplete?.(paragraphs);
  };
  
  if (!document) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-500">请从左侧选择一个文档进行查看</p>
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
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileText size={18} className="text-gray-500" />
            {document.title}
          </CardTitle>
          <div className="flex gap-4 items-center">
            <ReviewButton 
              document={document}
              onReviewStart={handleReviewStart}
              onReviewComplete={handleReviewComplete}
            />
            {/* 添加导出按钮 */}
            <ExportButton 
              document={aiReviewedParagraphs ? {...document, paragraphs: aiReviewedParagraphs} : document} 
              isLoading={isReviewing}
            />
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
          <div className="tab-container">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="review" className="tab-active">审阅视图</TabsTrigger>
              <TabsTrigger value="original">原文</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="original">
            <OriginalView paragraphs={document.paragraphs} />
          </TabsContent>
          <TabsContent value="review">
            {isReviewing ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-260px)] space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="text-gray-500">AI 正在分析文档...</p>
              </div>
            ) : (
              <ReviewView paragraphs={aiReviewedParagraphs || document.paragraphs} />
            )}
          </TabsContent>
        </Tabs>
        <div className="mt-4 flex items-center justify-center text-gray-400 text-xs">
          <MessageSquare size={14} className="mr-1" />
          <span>将鼠标悬停在修改处可查看详细说明</span>
        </div>
      </CardContent>
    </Card>
  );
}