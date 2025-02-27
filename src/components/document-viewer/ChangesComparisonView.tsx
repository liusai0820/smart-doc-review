import { useState } from "react";
import { Document, Paragraph, Change } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeftRight, 
  PanelLeftClose, 
  PanelRightClose, 
  Eye, 
  Check, 
  X,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChangesComparisonViewProps {
  document: Document;
  reviewedParagraphs: Paragraph[];
  onAcceptChange?: (paragraphId: number, changeId: string) => void;
  onRejectChange?: (paragraphId: number, changeId: string) => void;
}

export default function ChangesComparisonView({
  document,
  reviewedParagraphs,
  onAcceptChange,
  onRejectChange
}: ChangesComparisonViewProps) {
  const [viewMode, setViewMode] = useState<"split" | "unified" | "final">("split");
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<number | null>(null);
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);
  
  // 获取所有段落的所有变更
  const allChanges = reviewedParagraphs.flatMap((paragraph, paragraphIndex) => 
    paragraph.changes.map(change => ({
      ...change,
      paragraphIndex,
      paragraphId: paragraph.id,
      paragraphText: paragraph.text
    }))
  );
  
  // 计算最终文本（应用所有变更后）
  const getFinalText = (paragraph: Paragraph): string => {
    let text = paragraph.text;
    
    // 排序变更以确保按位置应用
    const sortedChanges = [...paragraph.changes].sort((a, b) => {
      const posA = a.original ? text.indexOf(a.original) : 0;
      const posB = b.original ? text.indexOf(b.original) : 0;
      return posB - posA; // 从后向前应用变更
    });
    
    // 应用变更
    sortedChanges.forEach(change => {
      if (change.type === 'replace' && change.original && change.new) {
        text = text.replace(change.original, change.new);
      } else if (change.type === 'deletion' && change.original) {
        text = text.replace(change.original, '');
      } else if (change.type === 'addition' && change.new) {
        text += ' ' + change.new;
      }
    });
    
    return text;
  };
  
  // 处理接受变更
  const handleAcceptChange = (paragraphId: number, changeId: string) => {
    if (onAcceptChange) {
      onAcceptChange(paragraphId, changeId);
    }
    
    // 清除选中状态
    setSelectedChangeId(null);
  };
  
  // 处理拒绝变更
  const handleRejectChange = (paragraphId: number, changeId: string) => {
    if (onRejectChange) {
      onRejectChange(paragraphId, changeId);
    }
    
    // 清除选中状态
    setSelectedChangeId(null);
  };
  
  // 格式化变更文本
  const formatChangedText = (change: Change) => {
    switch (change.type) {
      case 'deletion':
        return <span className="deleted-text">{change.original}</span>;
      case 'addition':
        return <span className="added-text">{change.new}</span>;
      case 'replace':
        return (
          <>
            <span className="deleted-text">{change.original}</span>
            {' '}
            <ChevronRight className="inline h-3 w-3" />
            {' '}
            <span className="added-text">{change.new}</span>
          </>
        );
      default:
        return null;
    }
  };
  
  // 获取严重程度样式
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">变更对比视图</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "split" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("split")}
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              <span>对比视图</span>
            </Button>
            <Button
              variant={viewMode === "unified" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("unified")}
            >
              <PanelLeftClose className="h-4 w-4 mr-1" />
              <span>合并视图</span>
            </Button>
            <Button
              variant={viewMode === "final" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("final")}
            >
              <Eye className="h-4 w-4 mr-1" />
              <span>结果预览</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex overflow-hidden">
        {allChanges.length === 0 ? (
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-gray-500">该文档没有建议的修改</p>
          </div>
        ) : (
          <div className="w-full h-full flex">
            {/* 左侧变更列表 */}
            <div className="w-1/3 border-r pr-4">
              <h3 className="font-medium mb-3">建议的修改 ({allChanges.length})</h3>
              <ScrollArea className="h-[calc(100vh-240px)]">
                <div className="space-y-3">
                  {allChanges.map((change, index) => (
                    <div
                      key={change.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChangeId === change.id ? "border-blue-300 bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        setSelectedParagraphIndex(change.paragraphIndex);
                        setSelectedChangeId(change.id);
                      }}
                    >
                      <div className="flex justify-between mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityClass(change.severity)}`}>
                          {change.severity === 'error' ? '错误' : 
                           change.severity === 'warning' ? '警告' : '建议'}
                        </span>
                        <span className="text-xs text-gray-500">
                          段落 {change.paragraphIndex + 1}
                        </span>
                      </div>
                      <div className="text-sm mb-2">
                        {formatChangedText(change)}
                      </div>
                      <p className="text-xs text-gray-600">{change.explanation}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* 右侧内容显示 */}
            <div className="flex-1 pl-4">
              {selectedChangeId ? (
                (() => {
                  const selectedChange = allChanges.find(change => change.id === selectedChangeId);
                  const selectedParagraph = selectedChange 
                    ? reviewedParagraphs[selectedChange.paragraphIndex] 
                    : null;
                  
                  if (!selectedChange || !selectedParagraph) {
                    return <div className="text-gray-500">请选择一个修改建议</div>;
                  }
                  
                  return (
                    <div className="h-full flex flex-col">
                      {/* 操作区 */}
                      <div className="mb-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">修改详情</h3>
                          <p className="text-sm text-gray-500">段落 {selectedChange.paragraphIndex + 1}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleRejectChange(selectedParagraph.id, selectedChange.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            <span>拒绝</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleAcceptChange(selectedParagraph.id, selectedChange.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            <span>接受</span>
                          </Button>
                        </div>
                      </div>
                      
                      {/* 内容显示区 */}
                      <Tabs defaultValue="original" className="flex-1">
                        <TabsList>
                          <TabsTrigger value="original">原始内容</TabsTrigger>
                          <TabsTrigger value="changed">修改后</TabsTrigger>
                          <TabsTrigger value="explanation">修改说明</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="original" className="flex-1 mt-4">
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <p className="text-sm">{selectedParagraph.text}</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="changed" className="flex-1 mt-4">
                          <div className="border rounded-lg p-4 bg-gray-50">
                            {selectedChange.type === 'replace' ? (
                              <p className="text-sm">
                                {selectedParagraph.text.replace(
                                  selectedChange.original || "", 
                                  selectedChange.new || ""
                                )}
                              </p>
                            ) : selectedChange.type === 'deletion' ? (
                              <p className="text-sm">
                                {selectedParagraph.text.replace(selectedChange.original || "", "")}
                              </p>
                            ) : (
                              <p className="text-sm">
                                {selectedParagraph.text} {selectedChange.new}
                              </p>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="explanation" className="flex-1 mt-4">
                          <div className="border rounded-lg p-4">
                            <div className={`inline-block px-2 py-0.5 rounded-full text-xs mb-2 ${getSeverityClass(selectedChange.severity)}`}>
                              {selectedChange.severity === 'error' ? '错误' : 
                               selectedChange.severity === 'warning' ? '警告' : '建议'}
                            </div>
                            <p className="text-sm mb-4">{selectedChange.explanation}</p>
                            
                            <div className="bg-gray-50 p-3 rounded-lg border">
                              <h4 className="text-xs text-gray-500 mb-1">修改详情</h4>
                              {selectedChange.type === 'replace' ? (
                                <>
                                  <p className="text-sm mb-2">
                                    <span className="text-gray-500">原文: </span>
                                    <span className="deleted-text">{selectedChange.original}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-gray-500">修改为: </span>
                                    <span className="added-text">{selectedChange.new}</span>
                                  </p>
                                </>
                              ) : selectedChange.type === 'deletion' ? (
                                <p className="text-sm">
                                  <span className="text-gray-500">删除: </span>
                                  <span className="deleted-text">{selectedChange.original}</span>
                                </p>
                              ) : (
                                <p className="text-sm">
                                  <span className="text-gray-500">添加: </span>
                                  <span className="added-text">{selectedChange.new}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">请从左侧选择一个修改建议</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}