import { Document } from "./mock-data";
import { generateInsightsPrompt } from "./prompts/insights-prompt";

// 文档洞察结果接口
export interface DocumentInsightsResult {
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

// 默认的洞察结果（用于错误情况）
const defaultInsightsResult: DocumentInsightsResult = {
  summary: {
    title: "",
    documentType: "未知",
    mainPurpose: "无法确定",
    keyPoints: ["无法分析文档内容"],
    overallQuality: 0,
    overallComment: "分析过程中发生错误，无法生成洞察报告"
  },
  detailedAnalysis: {
    structure: {
      rating: 0,
      analysis: "无法分析",
      recommendations: "无法提供建议"
    },
    content: {
      rating: 0,
      strengths: ["无法分析"],
      weaknesses: ["无法分析"],
      recommendations: "无法提供建议"
    },
    dataUsage: {
      rating: 0,
      analysis: "无法分析",
      recommendations: "无法提供建议"
    },
    expression: {
      rating: 0,
      analysis: "无法分析",
      recommendations: "无法提供建议"
    }
  },
  approvalSuggestion: {
    status: "needsRevision",
    reason: "无法完成分析",
    revisionFocus: ["请重试或手动检查文档"]
  }
};

/**
 * 使用LLM生成文档洞察
 * @param document 文档对象
 * @returns 文档洞察结果
 */
export async function generateDocumentInsights(document: Document): Promise<DocumentInsightsResult> {
  try {
    // 构建发送给LLM的文档内容
    const paragraphTexts = document.paragraphs.map(p => p.text).join('\n\n');
    
    console.log('开始生成文档洞察:', {
      title: document.title,
      paragraphCount: document.paragraphs.length
    });

    // 生成洞察提示词
    const prompt = generateInsightsPrompt(document.title, paragraphTexts);
    
    // 调用OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ''}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Smart Doc Review - Insights"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet", // 可以使用不同的模型
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: "json" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('洞察API调用失败:', errorData);
      throw new Error(`API调用失败: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('API返回错误:', data.error);
      throw new Error(`API返回错误: ${data.error.message}`);
    }

    // 解析返回的JSON结果
    const jsonString = data.choices[0].message.content;

    try {
      // 提取JSON部分（防止模型返回额外的文本）
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('无法从响应中提取JSON');
        throw new Error("无法从响应中提取JSON");
      }
      
      // 清理JSON字符串
      let cleanJson = jsonMatch[0]
        .replace(/[\u0000-\u001F]+/g, '') // 移除不可见字符
        .replace(/[""]/g, '"')  // 替换中文引号
        .replace(/['']/g, "'")  // 替换中文单引号
        .replace(/\\n/g, ' ')   // 替换换行符
        .replace(/\\r/g, ' ')   // 替换回车符
        .replace(/\s+/g, ' ');  // 压缩空白字符
        
      // 处理HTML标签
      cleanJson = cleanJson
        .replace(/<[^>]*>/g, '')  // 移除HTML标签
        .replace(/&quot;/g, '"')  // 转换HTML实体
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      
      // 解析JSON
      let result: DocumentInsightsResult;
      
      try {
        result = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('第一次解析失败，尝试进一步清理:', parseError);
        // 如果第一次解析失败，尝试更激进的清理
        cleanJson = cleanJson
          .replace(/[^\x20-\x7E]/g, '') // 只保留基本ASCII字符
          .replace(/\\/g, '\\\\')        // 转义反斜杠
          .replace(/(?<!\\)"/g, '\\"');  // 转义未转义的引号
        
        result = JSON.parse(cleanJson);
      }
      
      return result;
    } catch (e) {
      console.error("解析JSON失败:", e);
      throw new Error("解析模型返回的JSON结果失败");
    }
  } catch (error) {
    console.error("生成文档洞察失败:", error);
    return defaultInsightsResult;
  }
}