import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Document } from "@/lib/mock-data";
import StatusBadge from "../ui/StatusBadge";
import FileUpload from "../ui/FileUpload";
import { Button } from "@/components/ui/button"; 
import { ListChecks } from "lucide-react";
import BatchReview from "../batch-review/BatchReview";

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
              <FileUpload onUploadComplete={onUploadComplete} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-210px)]">
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDocument?.id === document.id
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200 hover:bg-gray-50"
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