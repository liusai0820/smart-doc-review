import { Document, Paragraph, ChangeType, ChangeSeverity } from "./mock-data";
import { generateEnhancedReviewPrompt } from "./prompts/enhanced-review-prompt";
import { parseRobustJSON } from "./improved-json-parser";

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
      category: string;
    }[];
  }[];
}

// 将LLM严重程度映射到应用严重程度
function mapSeverity(severity: string): ChangeSeverity {
  switch (severity) {
    case "error": return "error";
    case "warning": return "warning";
    case "suggestion": return "info"; // 将suggestion映射到info
    default: return "info";
  }
}

// 将LLM类型映射到应用类型
function mapChangeType(type: string): ChangeType {
  switch (type) {
    case "replace": return "replace";
    case "insert": return "addition";
    case "delete": return "deletion";
    default: return "addition";
  }
}

export async function reviewDocumentWithLLM(
  document: Document,
  apiKey?: string,
  modelName?: string,
  customPrompt?: string
): Promise<ReviewResult> {
  try {
    // 构建发送给LLM的文档内容
    const paragraphTexts = document.paragraphs.map(p => p.text).join('\n\n');
    
    console.log('开始调用LLM审阅文档:', {
      title: document.title,
      paragraphCount: document.paragraphs.length,
      usingCustomPrompt: !!customPrompt
    });

    // 生成审阅提示词
    const prompt = customPrompt || generateEnhancedReviewPrompt(document.title, paragraphTexts);
    console.log('生成的提示词长度:', prompt.length);

    // 使用传入的API密钥和模型名称，如果没有则使用环境变量
    const effectiveApiKey = apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
    
    // 获取模型名称的优先级：
    // 1. 传入的modelName参数
    // 2. localStorage中存储的值
    // 3. 环境变量
    // 4. 默认值
    let effectiveModelName = modelName;
    if (!effectiveModelName && typeof window !== 'undefined') {
      effectiveModelName = localStorage.getItem('llm_model') || '';
    }
    if (!effectiveModelName) {
      effectiveModelName = process.env.NEXT_PUBLIC_LLM_MODEL || "google/gemini-2.0-pro-exp-02-05:free";
    }
    
    // 添加更多日志信息以便调试
    console.log('模型选择过程:', {
      passedModel: modelName,
      localStorageModel: typeof window !== 'undefined' ? localStorage.getItem('llm_model') : null,
      envModel: process.env.NEXT_PUBLIC_LLM_MODEL,
      finalModel: effectiveModelName
    });
    
    // 调用OpenRouter API
    try {
      console.log('准备发送请求到OpenRouter API:', {
        model: effectiveModelName,
        promptLength: prompt.length,
        hasApiKey: !!effectiveApiKey
      });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${effectiveApiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Smart Doc Review"
        },
        body: JSON.stringify({
          model: effectiveModelName,
          messages: [
            {
              role: "system",
              content: `你是一个专业的文档审阅助手。请以JSON格式返回审阅结果，包含文档信息和具体的修改建议。
注意：
1. 返回的JSON中不要包含任何HTML或XML标签
2. 所有文本内容应该是纯文本格式
3. 如果需要强调某些内容，请使用其他方式，而不是标签
4. 确保JSON格式严格符合规范`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API响应不成功:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: { message: errorText } };
        }
        
        throw new Error(`API调用失败: ${errorData.error?.message || response.statusText}`);
      }

      console.log('API响应成功，正在解析响应数据');
      const data = await response.json();
      
      if (data.error) {
        console.error('API返回错误对象:', data.error);
        throw new Error(`API返回错误: ${data.error.message}`);
      }

      // 获取API返回的内容并进行预处理
      let jsonContent = data.choices[0].message.content;
      
      // 清理JSON字符串中的特殊字符和HTML/XML标签
      jsonContent = jsonContent
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // 移除控制字符
        .replace(/\n/g, ' ') // 将换行符替换为空格
        .replace(/<[^>]*>/g, '') // 移除所有HTML/XML标签
        .trim(); // 移除首尾空白
      
      // 尝试找到JSON的实际开始位置
      const jsonStart = jsonContent.indexOf('{');
      if (jsonStart !== -1) {
        jsonContent = jsonContent.substring(jsonStart);
      }
      
      // 尝试找到JSON的实际结束位置
      const jsonEnd = jsonContent.lastIndexOf('}');
      if (jsonEnd !== -1) {
        jsonContent = jsonContent.substring(0, jsonEnd + 1);
      }

      console.log('清理后的JSON内容:', {
        contentLength: jsonContent.length,
        contentPreview: jsonContent.substring(0, 100) + '...'
      });
      
      try {
        // 首先尝试直接解析
        const result = JSON.parse(jsonContent);
        console.log('成功直接解析JSON');
        return result;
      } catch (parseError) {
        console.warn('直接解析JSON失败，尝试使用改进的解析器:', parseError);
        // 如果直接解析失败，使用改进的解析器
        const result = parseRobustJSON(jsonContent);
        console.log('使用改进的解析器成功解析JSON');
        return result;
      }
    } catch (apiError) {
      console.error("API调用或解析失败:", apiError);
      
      // 提供更详细的错误信息
      if (apiError instanceof Error) {
        console.error(`错误类型: ${apiError.name}, 错误消息: ${apiError.message}`);
        if (apiError.stack) {
          console.error(`错误堆栈: ${apiError.stack}`);
        }
      }
      
      throw apiError;
    }
  } catch (error) {
    console.error("LLM审阅失败:", error);
    return {
      documentInfo: {
        title: "审阅失败",
        overview: error instanceof Error ? error.message : "未知错误",
        totalIssues: { errors: 0, warnings: 0, suggestions: 0 }
      },
      reviewContent: []
    };
  }
}

// 将LLM审阅结果转换为应用内部的变更格式
export function convertReviewToChanges(review: ReviewResult): Paragraph[] {
  if (!review.reviewContent || !Array.isArray(review.reviewContent)) {
    console.error("审阅结果不包含有效的reviewContent数组");
    return [];
  }
  
  return review.reviewContent.map((content, index) => {
    if (!content.changes || !Array.isArray(content.changes)) {
      return {
        id: index + 1,
        text: content.originalText || "",
        changes: []
      };
    }
    
    return {
      id: index + 1,
      text: content.originalText || "",
      changes: content.changes.map((change, changeIndex) => {
        // 使用mapChangeType和mapSeverity来映射类型和严重程度
        const type = mapChangeType(change.type);
        const severity = mapSeverity(change.severity);

        return {
          id: `llm-change-${index}-${changeIndex}`,
          type,
          original: change.originalText || "",
          new: change.newText || "",
          explanation: change.explanation || "未提供说明",
          severity
        };
      })
    };
  });
}