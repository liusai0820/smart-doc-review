import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Document } from "@/lib/mock-data";
import StatusBadge from "../ui/StatusBadge";
import FileUpload from "../ui/FileUpload";
import { Button } from "@/components/ui/button"; 
import { ListChecks, FolderOpen } from "lucide-react";
import BatchReview from "../batch-review/BatchReview";

// 骨架屏组件
const DocumentSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-3 rounded-lg border bg-gray-50 animate-pulse">
        <div className="flex justify-between items-start mb-2">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

interface DocumentListProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDocument: (document: Document) => void;
  onUploadComplete?: (fileName: string, fileContent?: ArrayBuffer, fileUrl?: string) => void;
  onDocumentsUpdate?: (documents: Document[]) => void;
}

export default function DocumentList({
  documents,
  selectedDocument,
  onSelectDocument,
  onUploadComplete,
  onDocumentsUpdate
}: DocumentListProps) {
  const [isBatchReviewOpen, setIsBatchReviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 处理文件上传
  const handleUploadStart = () => {
    setIsLoading(true);
  };

  const handleUploadComplete = (fileName: string, fileContent?: ArrayBuffer, fileUrl?: string) => {
    setIsLoading(false);
    onUploadComplete?.(fileName, fileContent, fileUrl);
  };

  // 处理批量审阅完成
  const handleBatchReviewComplete = (updatedDocuments: Document[]) => {
    if (onDocumentsUpdate) {
      onDocumentsUpdate(updatedDocuments);
    }
    setIsBatchReviewOpen(false);
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">文档列表</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setIsBatchReviewOpen(true)}
              >
                <ListChecks size={16} />
                <span>批量审阅</span>
              </Button>
              <FileUpload 
                onUploadStart={handleUploadStart}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-210px)]">
            {isLoading ? (
              <DocumentSkeleton />
            ) : documents.length === 0 ? (
              <div className="empty-state">
                <FolderOpen className="empty-state-icon" />
                <h3 className="empty-state-title">暂无文档</h3>
                <p className="empty-state-description">点击上方按钮上传您的第一个文档</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:translate-y-[-2px] ${
                      selectedDocument?.id === document.id
                        ? "bg-blue-50 border-l-4 border-l-accent border-t-0 border-r-0 border-b-0"
                        : "bg-white border hover:bg-gray-50 border-gray-200"
                    }`}
                    onClick={() => onSelectDocument(document)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{document.title}</h3>
                      <StatusBadge status={document.status} />
                    </div>
                    <p className="text-sm text-gray-500">{document.date}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 批量审阅组件 */}
      {isBatchReviewOpen && (
        <BatchReview
          documents={documents}
          onReviewComplete={handleBatchReviewComplete}
          onClose={() => setIsBatchReviewOpen(false)}
        />
      )}
    </>
  );
}