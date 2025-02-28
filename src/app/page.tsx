"use client";

import { useState, useRef } from "react";
import { FileText, History, Settings, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DocumentList from "@/components/document-list/DocumentList";
import DocumentViewer from "@/components/document-viewer/DocumentViewer";
import { DocumentInsights, DocumentInsightsRef } from "@/components/document-insights/DocumentInsights";
import { Document } from "@/lib/types";
import HistoryModal from "@/components/ui/HistoryModal";
import SettingsModal from "@/components/ui/SettingsModal";
import Notification from "@/components/ui/Notification";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChangesComparisonView from "@/components/document-viewer/ChangesComparisonView";
import ReviewDashboard from "@/components/dashboard/ReviewDashboard";
import ApiDebugHelper from "@/components/debug/ApiDebugHelper";

export default function Home() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("review");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [aiReviewedParagraphs, setAiReviewedParagraphs] = useState<Document["paragraphs"] | null>(null);
  const insightsRef = useRef<DocumentInsightsRef>(null);
  const [documentTab, setDocumentTab] = useState("view");

  // 是否开发环境或本地主机
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       (typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1'));

  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
    setAiReviewedParagraphs(null);
  };

  const handleDocumentsUpdate = (updatedDocuments: Document[]) => {
    setDocuments(updatedDocuments);
  };

  const parseDocumentContent = async (fileContent: ArrayBuffer, fileName: string) => {
    try {
      console.log(`开始解析文件: ${fileName}`, {
        fileSize: fileContent.byteLength,
        fileType: fileName.split('.').pop()?.toLowerCase()
      });
      
      if (fileName.toLowerCase().endsWith('.docx')) {
        console.log('处理 DOCX 文件');
        return {
          paragraphs: [{
            id: Date.now(),
            text: fileName,
            isHtml: false,
            isTable: false,
            changes: [],
            severity: 0
          }],
          fileUrl: undefined,
          content: fileContent
        };
      } else if (fileName.toLowerCase().endsWith('.txt')) {
        console.log('处理 TXT 文件');
        // 解析 TXT 文件
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(fileContent);
        const paragraphs = text.split('\n\n')
          .filter(p => p.trim())
          .map((p, index) => ({
            id: index + 1,
            text: p.trim(),
            isHtml: false,
            isTable: false,
            changes: []
          }));

        console.log(`解析出 ${paragraphs.length} 个段落`);

        return {
          paragraphs,
          fileUrl: undefined,
          content: undefined
        };
      }

      throw new Error('不支持的文件格式');
    } catch (err) {
      console.error('解析文档失败:', err);
      throw err;
    }
  };

  const handleUploadComplete = async (fileName: string, fileContent?: ArrayBuffer, fileUrl?: string) => {
    if (!fileContent) {
      console.log('文件内容为空');
      setNotification({
        message: "文件内容为空",
        type: "error"
      });
      return;
    }

    try {
      console.log('开始处理上传文件:', {
        fileName,
        fileSize: fileContent.byteLength,
        hasFileUrl: !!fileUrl
      });
      
      // 解析文档内容
      const { paragraphs, fileUrl: docUrl, content } = await parseDocumentContent(fileContent, fileName);

      console.log('文档解析结果:', {
        hasParagraphs: paragraphs.length > 0,
        hasDocUrl: !!docUrl,
        hasContent: !!content,
        contentSize: content?.byteLength
      });

      // 创建新文档
      const newDocument = {
        id: `doc-${Date.now()}`,
        title: fileName.replace(/\.(docx|pdf|txt)$/, ""),
        date: new Date().toISOString().split("T")[0],
        status: "pending" as const,
        paragraphs,
        fileUrl: docUrl || fileUrl,
        content // 保存原始内容
      };

      console.log('创建新文档:', {
        id: newDocument.id,
        title: newDocument.title,
        hasFileUrl: !!newDocument.fileUrl,
        hasContent: !!newDocument.content,
        contentSize: newDocument.content?.byteLength
      });

      // 先更新文档列表
      setDocuments(prev => [newDocument, ...prev]);
      
      // 然后设置选中的文档
      setTimeout(() => {
        setSelectedDocument(newDocument);
      }, 0);
      
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

  // 处理审阅开始
  const handleReviewStart = () => {
    // 同时触发文档分析
    insightsRef.current?.startAnalysis();
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
      <header className="sticky top-0 z-50 backdrop-filter backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm py-4 px-6">
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
            <div className="col-span-2">
              <Card className="h-[calc(100vh-120px)]">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    文档列表
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-[calc(100%-57px)]">
                  <DocumentList 
                    documents={documents} 
                    selectedDocument={selectedDocument}
                    onSelectDocument={handleSelectDocument}
                    onUploadComplete={handleUploadComplete}
                    onDocumentsUpdate={handleDocumentsUpdate}
                  />
                </CardContent>
              </Card>
            </div>

            {/* 中间文档查看器 */}
            <div className="col-span-7">
              <Card className="h-[calc(100vh-120px)]">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    文档内容
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-[calc(100%-57px)]">
                  <Tabs value={documentTab} onValueChange={setDocumentTab} className="w-full h-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="view">文档视图</TabsTrigger>
                      <TabsTrigger value="compare">变更对比</TabsTrigger>
                    </TabsList>
                    <TabsContent value="view" className="mt-0 h-[calc(100%-44px)]">
                      <DocumentViewer 
                        document={selectedDocument} 
                        onReviewStart={handleReviewStart}
                        onReviewComplete={handleReviewComplete}
                      />
                    </TabsContent>
                    <TabsContent value="compare" className="mt-0 h-[calc(100%-44px)]">
                      {selectedDocument && aiReviewedParagraphs ? (
                        <ChangesComparisonView 
                          document={selectedDocument}
                          reviewedParagraphs={aiReviewedParagraphs}
                          onAcceptChange={handleAcceptChange}
                          onRejectChange={handleRejectChange}
                        />
                      ) : (
                        <div className="text-center p-6">
                          <p className="text-gray-500">请先选择文档并完成AI审阅</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* 右侧文档洞察面板 */}
            <div className="col-span-3">
              <Card className="h-[calc(100vh-120px)]">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-gray-500" />
                    文档分析
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-[calc(100%-57px)]">
                  <DocumentInsights 
                    ref={insightsRef}
                    document={selectedDocument} 
                  />
                </CardContent>
              </Card>
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

      {/* 调试工具 - 仅在开发环境或本地主机显示 */}
      {isDevelopment && <ApiDebugHelper />}
    </main>
  );
}