import React from "react";
import { Document } from "@/lib/types";
import FileUpload from "../ui/FileUpload";
import { FileText } from "lucide-react";

interface DocumentListProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDocument: (document: Document) => void;
  onUploadComplete: (fileName: string, fileContent?: ArrayBuffer, fileUrl?: string) => void;
  onDocumentsUpdate: (documents: Document[]) => void;
}

export default function DocumentList({
  documents,
  selectedDocument,
  onSelectDocument,
  onUploadComplete
}: DocumentListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-center">
        <FileUpload onUploadComplete={onUploadComplete} />
      </div>
      
      {documents.length > 0 ? (
        <div className="flex-1 overflow-auto -mx-4 px-4">
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  selectedDocument?.id === doc.id
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium truncate mb-1">{doc.title}</div>
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span>{doc.date}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    doc.status === "completed" ? "bg-green-50 text-green-700" :
                    doc.status === "in_progress" ? "bg-yellow-50 text-yellow-700" :
                    "bg-gray-50 text-gray-700"
                  }`}>
                    {doc.status === "completed" ? "已完成" :
                     doc.status === "in_progress" ? "进行中" :
                     "待审阅"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <FileText className="h-8 w-8 text-gray-400 mb-3" />
          <div className="text-sm text-center">
            <p className="mb-1">暂无文档</p>
            <p className="text-xs text-gray-400">点击上方按钮上传文档</p>
          </div>
        </div>
      )}
    </div>
  );
}