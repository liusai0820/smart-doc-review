"use client";

import { useState } from "react";
import { FileText, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentList from "@/components/document-list/DocumentList";
import DocumentViewer from "@/components/document-viewer/DocumentViewer";
import DocumentInsights from "@/components/document-insights/DocumentInsights";
import { mockDocuments } from "@/lib/mock-data";
import { Document } from "@/lib/mock-data";
import HistoryModal from "@/components/ui/HistoryModal";
import SettingsModal from "@/components/ui/SettingsModal";
import Notification from "@/components/ui/Notification";
import mammoth from "mammoth";

export default function Home() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState(mockDocuments);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  const parseDocumentContent = async (fileContent: ArrayBuffer, fileName: string) => {
    try {
      let html = "";
      
      if (fileName.endsWith('.docx')) {
        // 使用 mammoth 转换为 HTML,保留更多格式
        const result = await mammoth.convertToHtml({ arrayBuffer: fileContent }, {
          styleMap: [
            "p[style-name='Title'] => h1.doc-title:fresh",
            "p[style-name='Heading 1'] => h2.doc-heading:fresh",
            "p[style-name='Heading 2'] => h3.doc-heading:fresh",
            "p => p.doc-paragraph:fresh",
            "table => table.doc-table:fresh",
            "tr => tr.doc-tr:fresh",
            "td => td.doc-td:fresh",
            "th => th.doc-th:fresh",
            "b => strong.doc-bold:fresh",
            "i => em.doc-italic:fresh",
            "u => span.doc-underline:fresh",
            "comment-reference => span.doc-comment:fresh"
          ],
          transformDocument: (element) => {
            // 保留原始样式和结构
            return element;
          },
          ignoreEmptyParagraphs: false
        });
        html = result.value;

        // 将 HTML 分割成段落和表格
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const paragraphs = Array.from(tempDiv.children).map((element, index) => {
          const isTable = element.tagName.toLowerCase() === 'table';
          return {
            id: index + 1,
            text: element.outerHTML,
            isHtml: true,
            isTable,
            changes: []
          };
        });

        return paragraphs;
      } else if (fileName.endsWith('.txt')) {
        // 解析 TXT 文件,转换为 HTML 格式
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(fileContent);
        const paragraphs = text.split('\n\n')
          .filter(p => p.trim())
          .map((p, index) => ({
            id: index + 1,
            text: `<p class="doc-paragraph">${p.trim()}</p>`,
            isHtml: true,
            isTable: false,
            changes: []
          }));

        return paragraphs;
      } else if (fileName.endsWith('.pdf')) {
        // TODO: 添加 PDF 解析逻辑
        return [{
          id: 1,
          text: "<p class='doc-paragraph'>PDF 文件解析功能即将推出</p>",
          isHtml: true,
          isTable: false,
          changes: []
        }];
      }

      throw new Error('不支持的文件格式');
    } catch (err) {
      console.error('解析文档失败:', err);
      throw err;
    }
  };

  const handleUploadComplete = async (fileName: string, fileContent?: ArrayBuffer, fileUrl?: string) => {
    if (!fileContent) {
      setNotification({
        message: "文件内容为空",
        type: "error"
      });
      return;
    }

    try {
      // 解析文档内容
      const paragraphs = await parseDocumentContent(fileContent, fileName);

      // 创建新文档
      const newDocument = {
        id: `doc-${Date.now()}`,
        title: fileName.replace(/\.(docx|pdf|txt)$/, ""),
        date: new Date().toISOString().split("T")[0],
        status: "pending" as const,
        paragraphs,
        fileUrl: fileUrl || undefined
      };

      // 添加到文档列表
      const updatedDocuments = [newDocument, ...documents];
      setDocuments(updatedDocuments);
      
      // 自动选择新上传的文档
      setSelectedDocument(newDocument);
      
      // 显示成功通知
      setNotification({
        message: `文档 "${fileName}" 已成功解析并添加到列表`,
        type: "success"
      });
    } catch (err) {
      console.error('文档解析失败:', err);
      setNotification({
        message: `解析文档 "${fileName}" 失败，请重试`,
        type: "error"
      });
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 shadow-sm py-4 px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-500 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800">智能文档审阅系统</h1>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-1"
              onClick={() => setIsHistoryModalOpen(true)}
            >
              <History size={18} />
              <span>历史记录</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-1"
              onClick={() => setIsSettingsModalOpen(true)}
            >
              <Settings size={18} />
              <span>设置</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 grid grid-cols-12 min-w-[1280px] p-6 gap-6">
        {/* 左侧文档列表 */}
        <div className="col-span-3">
          <DocumentList 
            documents={documents} 
            selectedDocument={selectedDocument}
            onSelectDocument={handleSelectDocument}
            onUploadComplete={handleUploadComplete}
          />
        </div>

        {/* 中间文档查看器 */}
        <div className="col-span-6">
          <DocumentViewer document={selectedDocument} />
        </div>

        {/* 右侧文档洞察面板 */}
        <div className="col-span-3">
          <DocumentInsights document={selectedDocument} />
        </div>
      </div>
      
      {/* 弹窗和通知 */}
      <HistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </main>
  );
}