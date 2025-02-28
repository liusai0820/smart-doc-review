import { useState } from "react";
import { Document, ChangeType, ChangeSeverity } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, ListChecks, Sparkles } from "lucide-react";
import { reviewDocumentWithLLM } from "@/lib/openrouter-api";
import { toast } from "sonner";

interface BatchReviewProps {
  documents: Document[];
  onReviewComplete: (updatedDocuments: Document[]) => void;
  onClose: () => void;
}

export default function BatchReview({ documents, onReviewComplete, onClose }: BatchReviewProps) {
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  // 选择/取消选择文档
  const toggleDocument = (docId: string) => {
    const newSelected = new Set(selectedDocIds);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocIds(newSelected);
  };

  // 选择/取消选择所有文档
  const toggleSelectAll = () => {
    if (selectedDocIds.size === documents.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(documents.map(doc => doc.id)));
    }
  };

  // 开始批量审阅
  const startBatchReview = async () => {
    if (selectedDocIds.size === 0) {
      toast.error("请至少选择一个文档");
      return;
    }

    setIsProcessing(true);
    setProcessedCount(0);
    
    // 过滤出选中的文档
    const selectedDocs = documents.filter(doc => selectedDocIds.has(doc.id));
    const updatedDocuments = [...documents];
    
    try {
      // 依次处理每个文档
      for (let i = 0; i < selectedDocs.length; i++) {
        const doc = selectedDocs[i];
        setCurrentDocId(doc.id);
        
        // 调用API审阅文档
        const result = await reviewDocumentWithLLM(doc);
        
        // 更新进度
        setProcessedCount(i + 1);
        
        // 查找当前文档在原始数组中的索引
        const docIndex = updatedDocuments.findIndex(d => d.id === doc.id);
        if (docIndex !== -1) {
          // 更新文档状态
          updatedDocuments[docIndex] = {
            ...updatedDocuments[docIndex],
            status: "in_progress",
            paragraphs: result.reviewContent.map((review, idx) => ({
              ...doc.paragraphs[idx],
              changes: review.changes.map(change => ({
                id: Math.random().toString(36).substr(2, 9),
                type: change.type === 'delete' ? 'deletion' : 
                      change.type === 'insert' ? 'addition' : 
                      change.type as ChangeType,
                original: change.originalText,
                new: change.newText,
                explanation: change.explanation,
                severity: change.severity as ChangeSeverity,
                category: change.category || ''
              }))
            }))
          };
        }
        
        // 为了避免API请求过快，添加短暂延迟
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success(`成功审阅 ${processedCount} 个文档`);
      onReviewComplete(updatedDocuments);
      onClose();
    } catch (error) {
      console.error("批量审阅失败:", error);
      toast.error("批量审阅过程中发生错误");
    } finally {
      setIsProcessing(false);
      setCurrentDocId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListChecks className="mr-2 h-5 w-5" />
            批量文档审阅
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">选择要审阅的文档</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSelectAll}
                className="h-7 text-xs"
              >
                {selectedDocIds.size === documents.length ? "取消全选" : "全选"}
              </Button>
            </div>
            
            <ScrollArea className="h-60 border rounded-md">
              <div className="p-2 space-y-1">
                {documents.map(doc => (
                  <div 
                    key={doc.id} 
                    className={`flex items-center p-2 rounded hover:bg-gray-100 ${
                      currentDocId === doc.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Checkbox 
                      checked={selectedDocIds.has(doc.id)}
                      onCheckedChange={() => toggleDocument(doc.id)}
                      disabled={isProcessing}
                      className="mr-2"
                    />
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-xs text-gray-500">{doc.date}</div>
                    </div>
                    {currentDocId === doc.id && (
                      <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {isProcessing && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>处理进度</span>
                <span>{processedCount}/{selectedDocIds.size}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(processedCount / selectedDocIds.size) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>预计耗时: {selectedDocIds.size * 1.5} 分钟</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
              >
                取消
              </Button>
              <Button
                onClick={startBatchReview}
                disabled={isProcessing || selectedDocIds.size === 0}
                className="flex items-center gap-1"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    <span>处理中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>开始审阅</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}