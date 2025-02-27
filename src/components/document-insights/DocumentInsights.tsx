import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Document } from "@/lib/mock-data";
import { LightbulbIcon, Book, FileCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentInsightsProps {
  document: Document | null;
}

export default function DocumentInsights({ document }: DocumentInsightsProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightData, setInsightData] = useState<{
    summary: string | null;
    suggestions: Array<{
      type: "error" | "warning" | "suggestion";
      content: string;
    }> | null;
    approval: {
      status: "approved" | "rejected" | "needsRevision";
      comments: string;
    } | null;
  }>({
    summary: null,
    suggestions: null,
    approval: null
  });

  // 分析文档内容
  const analyzeDocument = (document: Document) => {
    const text = document.paragraphs.map(p => p.text).join(" ");
    const suggestions: Array<{type: "error" | "warning" | "suggestion"; content: string}> = [];
    
    // 检查文档结构
    if (!text.includes("一、") && !text.includes("1.") && !text.includes("第一")) {
      suggestions.push({
        type: "warning",
        content: "建议添加清晰的章节编号，使文档结构更加清晰"
      });
    }

    // 检查标点符号使用
    if (text.match(/[，。；：！？、]/g)?.length || 0 < text.length / 100) {
      suggestions.push({
        type: "suggestion",
        content: "建议适当增加标点符号，提高文档可读性"
      });
    }

    // 检查重复内容
    const words = text.split(/\s+/);
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 2) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });
    const repeatedWords = Array.from(wordCount.entries())
      .filter(([, count]) => count > 5)
      .map(([word]) => word);
    if (repeatedWords.length > 0) {
      suggestions.push({
        type: "warning",
        content: `发现频繁重复的词语：${repeatedWords.join("、")}，建议适当精简`
      });
    }

    // 检查文档完整性
    const requiredSections = ["目的", "范围", "职责", "流程", "要求"];
    const missingSections = requiredSections.filter(section => 
      !text.includes(section)
    );
    if (missingSections.length > 0) {
      suggestions.push({
        type: "error",
        content: `文档缺少关键章节：${missingSections.join("、")}`
      });
    }

    return {
      summary: generateSummary(text),
      suggestions,
      approval: generateApproval(suggestions)
    };
  };

  // 生成文档摘要
  const generateSummary = (text: string): string => {
    // 提取关键信息
    const keyPoints = [];
    
    // 提取文档类型和主题
    if (text.includes("流程")) {
      keyPoints.push("这是一份流程类文档");
    } else if (text.includes("规划")) {
      keyPoints.push("这是一份规划类文档");
    } else if (text.includes("报告")) {
      keyPoints.push("这是一份报告类文档");
    }

    // 提取主要内容
    const sections = text.split(/[。！？]/);
    const importantSections = sections.filter(s => 
      s.includes("主要") || s.includes("关键") || s.includes("重要")
    );

    if (importantSections.length > 0) {
      keyPoints.push(...importantSections.slice(0, 2));
    }

    return keyPoints.join("。") || "这是一份需要进一步完善的文档";
  };

  // 生成审批意见
  const generateApproval = (suggestions: Array<{type: "error" | "warning" | "suggestion"; content: string}>) => {
    const errorCount = suggestions.filter(s => s.type === "error").length;
    const warningCount = suggestions.filter(s => s.type === "warning").length;

    if (errorCount > 0) {
      return {
        status: "rejected" as const,
        comments: `文档存在 ${errorCount} 处严重问题，需要修改后重新提交。请特别注意完善文档结构和关键章节。`
      };
    } else if (warningCount > 2) {
      return {
        status: "needsRevision" as const,
        comments: `文档有 ${warningCount} 处需要改进的地方，建议修改后再次提交。重点关注文档的结构性和表达准确性。`
      };
    } else {
      return {
        status: "approved" as const,
        comments: "文档整体质量良好，建议通过。如有可能，可以参考改进建议进行优化。"
      };
    }
  };

  // 处理生成洞察
  const handleGenerateInsights = () => {
    if (!document) return;
    
    setIsGenerating(true);
    
    // 模拟AI处理延迟
    setTimeout(() => {
      const insights = analyzeDocument(document);
      setInsightData(insights);
      setIsGenerating(false);
    }, 1500);
  };

  if (!document) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-500">请从左侧选择一个文档</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">文档洞察</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex gap-1 items-center" 
            onClick={handleGenerateInsights}
            disabled={isGenerating}
          >
            <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
            <span>{isGenerating ? "分析中..." : "开始分析"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <Book size={14} />
              <span>概要</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-1">
              <LightbulbIcon size={14} />
              <span>审阅意见</span>
            </TabsTrigger>
            <TabsTrigger value="approval" className="flex items-center gap-1">
              <FileCheck size={14} />
              <span>审批建议</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 space-y-4">
            <TabsContent value="summary" className="mt-0">
              {isGenerating ? (
                <div className="h-[calc(100vh-300px)] flex justify-center items-center">
                  <p className="text-gray-500">正在生成文档概要...</p>
                </div>
              ) : insightData.summary ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{insightData.summary}</p>
                </div>
              ) : (
                <div className="h-[calc(100vh-300px)] flex justify-center items-center">
                  <p className="text-gray-500">点击&quot;开始分析&quot;按钮获取文档概要</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="suggestions" className="mt-0">
              {isGenerating ? (
                <div className="h-[calc(100vh-300px)] flex justify-center items-center">
                  <p className="text-gray-500">正在分析文档问题...</p>
                </div>
              ) : insightData.suggestions ? (
                <div className="space-y-3">
                  {insightData.suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        suggestion.type === "error" 
                          ? "bg-red-50 border-red-100" 
                          : suggestion.type === "warning"
                          ? "bg-yellow-50 border-yellow-100"
                          : "bg-blue-50 border-blue-100"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <LightbulbIcon 
                          size={18} 
                          className={
                            suggestion.type === "error" 
                              ? "text-red-500" 
                              : suggestion.type === "warning"
                              ? "text-yellow-500"
                              : "text-blue-500"
                          } 
                        />
                        <p className="text-gray-700">{suggestion.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[calc(100vh-300px)] flex justify-center items-center">
                  <p className="text-gray-500">点击&quot;开始分析&quot;按钮获取审阅意见</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approval" className="mt-0">
              {isGenerating ? (
                <div className="h-[calc(100vh-300px)] flex justify-center items-center">
                  <p className="text-gray-500">正在生成审批建议...</p>
                </div>
              ) : insightData.approval ? (
                <div className={`p-4 rounded-lg border ${
                  insightData.approval.status === "approved"
                    ? "bg-green-50 border-green-100"
                    : insightData.approval.status === "needsRevision"
                    ? "bg-yellow-50 border-yellow-100"
                    : "bg-red-50 border-red-100"
                }`}>
                  <div className="flex items-start gap-2">
                    <FileCheck 
                      size={18} 
                      className={
                        insightData.approval.status === "approved"
                          ? "text-green-500"
                          : insightData.approval.status === "needsRevision"
                          ? "text-yellow-500"
                          : "text-red-500"
                      } 
                    />
                    <div>
                      <p className={`font-medium mb-1 ${
                        insightData.approval.status === "approved"
                          ? "text-green-800"
                          : insightData.approval.status === "needsRevision"
                          ? "text-yellow-800"
                          : "text-red-800"
                      }`}>
                        {insightData.approval.status === "approved"
                          ? "建议通过"
                          : insightData.approval.status === "needsRevision"
                          ? "建议修改"
                          : "需要重做"}
                      </p>
                      <p className="text-gray-700">{insightData.approval.comments}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[calc(100vh-300px)] flex justify-center items-center">
                  <p className="text-gray-500">点击&quot;开始分析&quot;按钮获取审批建议</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
} 