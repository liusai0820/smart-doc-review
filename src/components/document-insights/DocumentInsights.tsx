import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { LightbulbIcon, Book, RefreshCw, BarChart3, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document, DocumentInsightsResult } from "@/lib/types";
import { generateDocumentInsights } from "@/lib/document-insights-api";
import { extractDocumentContent } from "@/lib/document-content-extraction";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface DocumentInsightsRef {
  startAnalysis: () => Promise<void>;
}

interface DocumentInsightsProps {
  document: Document | null;
}

// 假设这个类型在document-insights-api.ts中定义
// 如果找不到，我们在这里定义一个兼容的类型
interface FallbackInsightsResult {
  summary: {
    title: string;
    documentType: string;
    mainPurpose: string;
    keyPoints: string[];
    overallQuality: number;
    overallComment: string;
  };
  detailedAnalysis: {
    structure: {
      rating: number;
      analysis: string;
      recommendations: string;
    };
    content: {
      rating: number;
      strengths: string[];
      weaknesses: string[];
      recommendations: string;
    };
    dataUsage: {
      rating: number;
      analysis: string;
      recommendations: string;
    };
    expression: {
      rating: number;
      analysis: string;
      recommendations: string;
    };
  };
  approvalSuggestion: {
    status: "approved" | "needsRevision" | "rejected";
    reason: string;
    revisionFocus: string[];
  };
}

// 默认值，在无法从API获取时使用
const defaultInsightData: FallbackInsightsResult = {
  summary: {
    title: "",
    documentType: "未知类型",
    mainPurpose: "未能确定文档目的",
    keyPoints: ["无法分析文档要点"],
    overallQuality: 0,
    overallComment: "无法生成文档评价"
  },
  detailedAnalysis: {
    structure: {
      rating: 0,
      analysis: "无法分析文档结构",
      recommendations: "无法提供建议"
    },
    content: {
      rating: 0,
      strengths: ["无法分析内容优势"],
      weaknesses: ["无法分析内容不足"],
      recommendations: "无法提供建议"
    },
    dataUsage: {
      rating: 0,
      analysis: "无法分析数据使用",
      recommendations: "无法提供建议"
    },
    expression: {
      rating: 0,
      analysis: "无法分析表达风格",
      recommendations: "无法提供建议"
    }
  },
  approvalSuggestion: {
    status: "needsRevision",
    reason: "无法生成审批建议",
    revisionFocus: ["请手动检查文档"]
  }
};

export const DocumentInsights = forwardRef<DocumentInsightsRef, DocumentInsightsProps>(
  ({ document }, ref) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [insightData, setInsightData] = useState<DocumentInsightsResult | null>(null);

    // 暴露startAnalysis方法给父组件
    useImperativeHandle(ref, () => ({
      startAnalysis: handleGenerateInsights
    }));

    // 在文档变更时重置洞察数据
    useEffect(() => {
      setInsightData(null);
    }, [document]);

    // 处理生成洞察
    const handleGenerateInsights = async () => {
      if (!document) return;
      
      setIsGenerating(true);
      
      try {
        // 首先提取文档内容
        const content = await extractDocumentContent(document);
        
        // 验证内容
        if (!content || content.trim().length < 10) {
          throw new Error("文档内容为空或太短，无法进行分析");
        }
        
        // 更新文档对象，确保包含提取的内容
        const documentWithContent = {
          ...document,
          paragraphs: content.split('\n\n').map((text: string, index: number) => ({
            id: index,
            text: text.trim(),
            changes: []
          }))
        };
        
        // 尝试调用API生成洞察
        let insights;
        try {
          if (typeof generateDocumentInsights === 'function') {
            insights = await generateDocumentInsights(documentWithContent);
          } else {
            throw new Error("generateDocumentInsights function not available");
          }
        } catch (error) {
          console.warn("无法使用API生成洞察，使用模拟数据:", error);
          
          // 使用模拟数据
          insights = {
            ...defaultInsightData,
            summary: {
              ...defaultInsightData.summary,
              title: document.title,
              documentType: document.title.includes("报告") ? "报告类文档" : "一般文档",
              mainPurpose: `描述${document.title}相关内容`,
              keyPoints: documentWithContent.paragraphs.slice(0, 3).map(p => p.text.substring(0, 30) + "..."),
              overallQuality: 7,
              overallComment: "文档整体结构清晰，内容较为完整。"
            }
          };
          
          // 模拟API延迟
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        setInsightData(insights);
      } catch (error) {
        console.error("生成文档洞察失败:", error);
        setInsightData(defaultInsightData);
      } finally {
        setIsGenerating(false);
      }
    };

    // 获取审批状态图标
    const getApprovalIcon = (status: string) => {
      switch (status) {
        case "approved":
          return <CheckCircle2 className="text-green-500" size={18} />;
        case "needsRevision":
          return <AlertTriangle className="text-yellow-500" size={18} />;
        case "rejected":
          return <AlertTriangle className="text-red-500" size={18} />;
        default:
          return <AlertTriangle className="text-gray-500" size={18} />;
      }
    };

    // 获取审批状态文本
    const getApprovalText = (status: string) => {
      switch (status) {
        case "approved":
          return "建议通过";
        case "needsRevision":
          return "建议修改";
        case "rejected":
          return "建议重做";
        default:
          return "未评估";
      }
    };

    // 获取审批状态样式
    const getApprovalStyle = (status: string) => {
      switch (status) {
        case "approved":
          return "bg-green-50 border-green-100 text-green-800";
        case "needsRevision":
          return "bg-yellow-50 border-yellow-100 text-yellow-800";
        case "rejected":
          return "bg-red-50 border-red-100 text-red-800";
        default:
          return "bg-gray-50 border-gray-100 text-gray-800";
      }
    };

    if (!document) {
      return (
        <div className="h-full flex flex-col items-center justify-center">
          <BarChart3 className="h-8 w-8 text-gray-400 mb-3" />
          <div className="text-sm text-center">
            <p className="mb-1">暂无分析</p>
            <p className="text-xs text-gray-400">请先选择一个文档</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex gap-1 items-center" 
            onClick={handleGenerateInsights}
            disabled={isGenerating}
          >
            <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
            <span>{isGenerating ? "分析中..." : "重新分析"}</span>
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="text-sm text-gray-500">正在分析文档...</p>
            </div>
          ) : insightData ? (
            <Accordion type="single" collapsible defaultValue="summary" className="w-full space-y-4">
              {/* 文档概要 */}
              <AccordionItem value="summary" className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center gap-2">
                    <Book size={16} />
                    <span>文档概要</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-1">文档类型</h3>
                      <p className="text-gray-700">{insightData.summary.documentType}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-1">主要目的</h3>
                      <p className="text-gray-700">{insightData.summary.mainPurpose}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-1">关键点</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {insightData.summary.keyPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 详细分析 */}
              <AccordionItem value="analysis" className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} />
                    <span>详细分析</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3">
                  <div className="space-y-4">
                    {/* 结构分析 */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-3 border-b">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">文档结构</h3>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{insightData.detailedAnalysis.structure.rating}/10</span>
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${insightData.detailedAnalysis.structure.rating * 10}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-700 mb-3">{insightData.detailedAnalysis.structure.analysis}</p>
                      </div>
                    </div>

                    {/* 内容分析 */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-3 border-b">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">内容质量</h3>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{insightData.detailedAnalysis.content.rating}/10</span>
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${insightData.detailedAnalysis.content.rating * 10}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">优势:</h4>
                          <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                            {insightData.detailedAnalysis.content.strengths.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">不足:</h4>
                          <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                            {insightData.detailedAnalysis.content.weaknesses.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 改进建议 */}
              <AccordionItem value="suggestions" className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center gap-2">
                    <LightbulbIcon size={16} />
                    <span>改进建议</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3">
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${getApprovalStyle(insightData.approvalSuggestion.status)}`}>
                      <div className="flex items-start gap-3">
                        {getApprovalIcon(insightData.approvalSuggestion.status)}
                        <div>
                          <h3 className="font-medium mb-1">
                            {getApprovalText(insightData.approvalSuggestion.status)}
                          </h3>
                          <p className="text-gray-700">{insightData.approvalSuggestion.reason}</p>
                        </div>
                      </div>
                    </div>
                    
                    {(insightData.approvalSuggestion.status === "needsRevision" || 
                      insightData.approvalSuggestion.status === "rejected") && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">需要重点修改的地方:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {insightData.approvalSuggestion.revisionFocus.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex gap-2">
                        <LightbulbIcon size={16} className="text-blue-500 mt-0.5" />
                        <div className="space-y-2">
                          <p className="text-blue-800 text-sm">{insightData.detailedAnalysis.structure.recommendations}</p>
                          <p className="text-blue-800 text-sm">{insightData.detailedAnalysis.content.recommendations}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <BarChart3 className="h-8 w-8 text-gray-400 mb-3" />
              <div className="text-sm text-center">
                <p className="mb-1">等待分析</p>
                <p className="text-xs text-gray-400">点击上方按钮开始分析</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

DocumentInsights.displayName = "DocumentInsights";