import { Document, Paragraph, ChangeType, ChangeSeverity } from "./mock-data";
import { generateReviewPrompt } from "./prompts/review-prompt";

// OpenRouter API 接口
interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
  };
}

// 审阅结果接口
export interface ReviewResult {
  documentInfo: {
    title: string;
    overview: string;
    totalIssues: {
      errors: number;
      warnings: number;
      suggestions: number;
    };
  };
  reviewContent: {
    id: string;
    originalText: string;
    changes: {
      type: "replace" | "insert" | "delete";
      position: {
        start: number;
        end: number;
      };
      originalText?: string;
      newText?: string;
      explanation: string;
      severity: "error" | "warning" | "suggestion";
      category: "grammar" | "data" | "style" | "format" | "logic";
    }[];
  }[];
}

// 将LLM严重程度映射到应用严重程度
function mapSeverity(severity: "error" | "warning" | "suggestion"): ChangeSeverity {
  switch (severity) {
    case "error": return "error";
    case "warning": return "warning";
    case "suggestion": return "info"; // 将suggestion映射到info
    default: return "info";
  }
}

// 将LLM类型映射到应用类型
function mapChangeType(type: "replace" | "insert" | "delete"): ChangeType {
  switch (type) {
    case "replace": return "replace";
    case "insert": return "addition";
    case "delete": return "deletion";
    default: return "addition";
  }
}

export async function reviewDocumentWithLLM(document: Document): Promise<ReviewResult> {
  try {
    // 构建发送给LLM的文档内容
    const paragraphTexts = document.paragraphs.map(p => p.text).join('\n\n');
    
    console.log('开始调用LLM审阅文档:', {
      title: document.title,
      paragraphCount: document.paragraphs.length
    });

    // 生成审阅提示词
    const prompt = generateReviewPrompt(document.title, paragraphTexts);
    console.log('生成的提示词:', prompt);

    // 调用OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ''}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Smart Doc Review"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-pro-exp-02-05:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        response_format: { type: "json" }
      })
    });

    console.log('API响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API调用失败:', errorData);
      throw new Error(`API调用失败: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('API原始响应:', data);
    
    if (data.error) {
      console.error('API返回错误:', data.error);
      throw new Error(`API返回错误: ${data.error.message}`);
    }

    // 解析返回的JSON结果
    const jsonString = data.choices[0].message.content;
    console.log('LLM返回的内容:', jsonString);

    let result: ReviewResult;
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
      
      console.log('清理后的JSON字符串:', cleanJson);
      
      try {
        result = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('第一次解析失败，尝试进一步清理:', parseError);
        // 如果第一次解析失败，尝试更激进的清理
        cleanJson = cleanJson
          .replace(/[^\x20-\x7E]/g, '') // 只保留基本ASCII字符
          .replace(/\\/g, '\\\\')        // 转义反斜杠
          .replace(/(?<!\\)"/g, '\\"');  // 转义未转义的引号
        
        console.log('进一步清理后的JSON字符串:', cleanJson);
        result = JSON.parse(cleanJson);
      }
      
      console.log('解析后的结果:', result);
    } catch (e) {
      console.error("解析JSON失败:", e);
      throw new Error("解析模型返回的JSON结果失败");
    }

    return result;
  } catch (error) {
    console.error("LLM审阅失败:", error);
    // 返回一个错误状态的结果
    return {
      documentInfo: {
        title: document.title,
        overview: "审阅过程中发生错误",
        totalIssues: {
          errors: 0,
          warnings: 0,
          suggestions: 0
        }
      },
      reviewContent: []
    };
  }
}

// 将LLM审阅结果转换为应用内部的变更格式
export function convertReviewToChanges(review: ReviewResult): Paragraph[] {
  return review.reviewContent.map((content, index) => {
    return {
      id: index + 1,
      text: content.originalText,
      changes: content.changes.map((change, changeIndex) => {
        return {
          id: `llm-change-${index}-${changeIndex}`,
          type: mapChangeType(change.type),
          original: change.originalText || "",
          new: change.newText || "",
          explanation: change.explanation,
          severity: change.severity as ChangeSeverity
        };
      })
    };
  });
} 