"use client";

import { useState } from "react";
import { FileText, History, Settings, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DocumentList from "@/components/document-list/DocumentList";
import DocumentViewer from "@/components/document-viewer/DocumentViewer";
import DocumentInsights from "@/components/document-insights/DocumentInsights";
import { mockDocuments } from "@/lib/mock-data";
import { Document } from "@/lib/mock-data";
import HistoryModal from "@/components/ui/HistoryModal";
import SettingsModal from "@/components/ui/SettingsModal";
import Notification from "@/components/ui/Notification";
import mammoth from "mammoth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChangesComparisonView from "@/components/document-viewer/ChangesComparisonView";
import ReviewDashboard from "@/components/dashboard/ReviewDashboard";

export default function Home() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState(mockDocuments);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("review");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [aiReviewedParagraphs, setAiReviewedParagraphs] = useState<Document["paragraphs"] | null>(null);

  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
    setAiReviewedParagraphs(null);
  };

  const handleDocumentsUpdate = (updatedDocuments: Document[]) => {
    setDocuments(updatedDocuments);
  };

  const parseDocumentContent = async (fileContent: ArrayBuffer, fileName: string) => {
    try {
      let html = "";
      console.log(`开始解析文件: ${fileName}`);
      
      if (fileName.endsWith('.docx')) {
        // 增加错误处理和日志
        try {
          // 使用 mammoth 转换为 HTML
          const result = await mammoth.convertToHtml({ arrayBuffer: fileContent });
          html = result.value;
          console.log("Mammoth转换成功");
        } catch (mammothError) {
          console.error("Mammoth转换失败:", mammothError);
          throw mammothError;
        }
  
        // 将 HTML 分割成段落
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
        // 解析 TXT 文件
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

  // 处理AI审阅完成
  const handleReviewComplete = (paragraphs: Document["paragraphs"]) => {
    setAiReviewedParagraphs(paragraphs);
    
    // 如果有选中的文档，更新其状态为进行中
    if (selectedDocument) {
      const updatedDocuments = documents.map(doc => {
        if (doc.id === selectedDocument.id) {
          return {
            ...doc,
            status: "in_progress" as const
          };
        }
        return doc;
      });
      setDocuments(updatedDocuments);
    }
  };

  // 处理接受变更
  const handleAcceptChange = (paragraphId: number, changeId: string) => {
    if (!aiReviewedParagraphs || !selectedDocument) return;
    
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
    setNotification({
      message: "已接受修改建议",
      type: "success"
    });
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
    setNotification({
      message: "已拒绝修改建议",
      type: "info"
    });
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
              onClick={() => setActiveTab(activeTab === "dashboard" ? "review" : "dashboard")}
            >
              <BarChart size={18} />
              <span>审阅看板</span>
            </Button>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsContent value="review" className="flex-1">
          <div className="flex-1 grid grid-cols-12 min-w-[1280px] p-6 gap-6">
            {/* 左侧文档列表 */}
            <div className="col-span-3">
              <DocumentList 
                documents={documents} 
                selectedDocument={selectedDocument}
                onSelectDocument={handleSelectDocument}
                onUploadComplete={handleUploadComplete}
                onDocumentsUpdate={handleDocumentsUpdate}
              />
            </div>

            {/* 中间文档查看器 */}
            <div className="col-span-6">
              <Tabs defaultValue="view" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="view">文档视图</TabsTrigger>
                  <TabsTrigger value="compare">变更对比</TabsTrigger>
                </TabsList>
                <TabsContent value="view" className="mt-0">
                  <DocumentViewer 
                    document={selectedDocument} 
                    onReviewComplete={handleReviewComplete}
                  />
                </TabsContent>
                <TabsContent value="compare" className="mt-0">
                  {selectedDocument && aiReviewedParagraphs ? (
                    <ChangesComparisonView 
                      document={selectedDocument}
                      reviewedParagraphs={aiReviewedParagraphs}
                      onAcceptChange={handleAcceptChange}
                      onRejectChange={handleRejectChange}
                      onClose={() => setActiveTab("review")}
                    />
                  ) : (
                    <Card className="h-full flex items-center justify-center">
                      <div className="text-center p-6">
                        <p className="text-gray-500">请先选择文档并完成AI审阅</p>
                      </div>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* 右侧文档洞察面板 */}
            <div className="col-span-3">
              <DocumentInsights document={selectedDocument} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="dashboard" className="flex-1 p-6">
          <ReviewDashboard documents={documents} />
        </TabsContent>
      </Tabs>
      
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