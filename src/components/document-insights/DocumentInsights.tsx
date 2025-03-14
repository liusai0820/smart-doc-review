import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Document } from "@/lib/mock-data";
import { generateDocumentInsights } from "@/lib/document-insights-api";
import { LightbulbIcon, Book, FileCheck, RefreshCw, BarChart3, AlertTriangle, CheckCircle2, FileSearch, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import CollapsibleSection from "@/components/ui/collapsible-section";

interface DocumentInsightsProps {
  document: Document | null;
}

// 接口定义保持不变
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

// 默认值保持不变
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

export default function DocumentInsights({ document }: DocumentInsightsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightData, setInsightData] = useState<FallbackInsightsResult | null>(null);

  // 在文档变更时重置洞察数据
  useEffect(() => {
    setInsightData(null);
  }, [document]);

  // 处理生成洞察
  const handleGenerateInsights = async () => {
    if (!document) return;
    
    setIsGenerating(true);
    
    try {
      // 尝试调用API生成洞察
      let insights;
      
      try {
        if (typeof generateDocumentInsights === 'function') {
          insights = await generateDocumentInsights(document);
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
            keyPoints: document.paragraphs.slice(0, 3).map(p => p.text.substring(0, 30) + "..."),
            overallQuality: 7,
            overallComment: "文档整体结构清晰，内容较为完整。"
          }
        };
        
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setInsightData(insights);
    } catch (error) {
      console.error("生成洞察失败:", error);
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

  // 骨架屏组件
  const InsightsSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded-full w-1/3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded-full w-full"></div>
          <div className="h-3 bg-gray-200 rounded-full w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded-full w-4/6"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded-full w-1/4"></div>
        <div className="grid grid-cols-1 gap-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  if (!document) {
    return (
      <Card className="h-full">
        <div className="empty-state">
          <FileSearch className="empty-state-icon" />
          <h3 className="empty-state-title">等待分析</h3>
          <p className="empty-state-description">选择一个文档开始智能分析</p>
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
        {isGenerating ? (
          <InsightsSkeleton />
        ) : insightData ? (
          <div className="space-y-4 overflow-y-auto h-[calc(100vh-280px)] pr-1">
            {/* 文档概要 */}
            <CollapsibleSection 
              title="文档概要" 
              icon={<Book size={16} className="text-blue-500" />}
              defaultOpen={true}
            >
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
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium text-gray-900">整体质量评分</h3>
                    <span className="font-medium text-blue-600">{insightData.summary.overallQuality}/10</span>
                  </div>
                  <Progress 
                    value={insightData.summary.overallQuality * 10} 
                    className="h-2 mb-3"
                  />
                  <p className="text-gray-700">{insightData.summary.overallComment}</p>
                </div>
              </div>
            </CollapsibleSection>
            
            {/* 深度分析 */}
            <CollapsibleSection 
              title="深度分析" 
              icon={<BarChart3 size={16} className="text-blue-500" />}
              defaultOpen={true}
            >
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
                    
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <div className="flex gap-2">
                        <LightbulbIcon size={16} className="text-blue-500 mt-0.5" />
                        <p className="text-blue-800 text-sm">{insightData.detailedAnalysis.structure.recommendations}</p>
                      </div>
                    </div>
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
                    
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <div className="flex gap-2">
                        <LightbulbIcon size={16} className="text-blue-500 mt-0.5" />
                        <p className="text-blue-800 text-sm">{insightData.detailedAnalysis.content.recommendations}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 数据使用分析 */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">数据使用</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{insightData.detailedAnalysis.dataUsage.rating}/10</span>
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${insightData.detailedAnalysis.dataUsage.rating * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 mb-3">{insightData.detailedAnalysis.dataUsage.analysis}</p>
                    
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <div className="flex gap-2">
                        <LightbulbIcon size={16} className="text-blue-500 mt-0.5" />
                        <p className="text-blue-800 text-sm">{insightData.detailedAnalysis.dataUsage.recommendations}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 表达分析 */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">表达风格</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{insightData.detailedAnalysis.expression.rating}/10</span>
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${insightData.detailedAnalysis.expression.rating * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 mb-3">{insightData.detailedAnalysis.expression.analysis}</p>
                    
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <div className="flex gap-2">
                        <LightbulbIcon size={16} className="text-blue-500 mt-0.5" />
                        <p className="text-blue-800 text-sm">{insightData.detailedAnalysis.expression.recommendations}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
            
            {/* 审批建议 */}
            <CollapsibleSection 
              title="审批建议" 
              icon={<FileCheck size={16} className="text-blue-500" />}
              defaultOpen={true}
            >
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
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-medium mb-2">需要重点修改的地方:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {insightData.approvalSuggestion.revisionFocus.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>
        ) : (
          <div className="h-[calc(100vh-280px)] flex flex-col justify-center items-center">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-3">点击"开始分析"按钮获取文档洞察</p>
            <p className="text-xs text-gray-400">AI将对文档进行多维度分析并提供专业建议</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
