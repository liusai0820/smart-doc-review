import { Document, Paragraph, ChangeType, ChangeSeverity } from "./mock-data";
import { generateEnhancedReviewPrompt } from "./prompts/enhanced-review-prompt";

/**
 * 更健壮的JSON解析函数，处理LLM返回的可能格式不正确的JSON
 */
function parseRobustJSON(jsonString: string): ReviewResult {
  try {
    // 预处理 JSON 字符串
    const processedString = jsonString
      // 移除可能的 markdown 代码块标记
      .replace(/```json\s*|\s*```/g, '')
      // 移除注释
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
      // 修复缺少的引号
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
      // 修复多余的逗号
      .replace(/,(\s*[}\]])/g, '$1')
      // 修复缺少的逗号
      .replace(/}(\s*){/g, '},{')
      .replace(/](\s*)\[/g, '],[')
      .replace(/"([^"]+)"\s*"([^"]+)"/g, '"$1","$2"')
      // 修复布尔值和数字
      .replace(/"(true|false|null|\d+)"/g, '$1')
      // 修复未闭合的对象或数组
      .replace(/([^}])\s*$/, '$1}')
      .replace(/([^\]])\s*$/, '$1]');

    // 尝试解析处理后的字符串
    try {
      const parsed = JSON.parse(processedString);
      const result = normalizeResult(parsed);
      
      if (validateResult(result)) {
        return result;
      }
    } catch (parseError) {
      console.warn('处理后的JSON解析失败，尝试其他方法:', parseError);
    }

    // 如果上述方法失败，尝试提取最外层的 JSON 对象
    const jsonMatch = jsonString.match(/{[\s\S]*}/);
    if (jsonMatch) {
      try {
        const extracted = jsonMatch[0];
        const parsed = JSON.parse(extracted);
        const result = normalizeResult(parsed);
        
        if (validateResult(result)) {
          return result;
        }
      } catch (extractError) {
        console.warn('提取JSON对象失败:', extractError);
      }
    }

    // 如果所有尝试都失败，返回默认结果
    console.error('所有JSON解析尝试都失败');
    return createDefaultResult();
  } catch (error) {
    console.error('JSON处理过程中发生错误:', error);
    return createDefaultResult();
  }
}

/**
 * 规范化解析结果
 */
function normalizeResult(parsed: unknown): ReviewResult {
  const safeParsed = parsed as Partial<ReviewResult>;
  
  // 确保基本结构存在
  const result: ReviewResult = {
    documentInfo: {
      title: typeof safeParsed?.documentInfo?.title === 'string' 
        ? safeParsed.documentInfo.title 
        : '未知标题',
      overview: typeof safeParsed?.documentInfo?.overview === 'string'
        ? safeParsed.documentInfo.overview
        : '无概述',
      totalIssues: {
        errors: Number(safeParsed?.documentInfo?.totalIssues?.errors) || 0,
        warnings: Number(safeParsed?.documentInfo?.totalIssues?.warnings) || 0,
        suggestions: Number(safeParsed?.documentInfo?.totalIssues?.suggestions) || 0
      }
    },
    reviewContent: []
  };

  // 处理审阅内容
  if (Array.isArray(safeParsed?.reviewContent)) {
    result.reviewContent = safeParsed.reviewContent.map((item) => ({
      id: String(item?.id || ''),
      originalText: String(item?.originalText || ''),
      changes: Array.isArray(item?.changes) 
        ? item.changes.map((change) => {
            // 确保 type 是有效的值
            let type: "replace" | "insert" | "delete" = "replace";
            if (change?.type === "insert") type = "insert";
            if (change?.type === "delete") type = "delete";

            // 确保 severity 是有效的值
            let severity: "error" | "warning" | "suggestion" = "suggestion";
            if (change?.severity === "error") severity = "error";
            if (change?.severity === "warning") severity = "warning";

            return {
              type,
              position: {
                start: Number(change?.position?.start) || 0,
                end: Number(change?.position?.end) || 0
              },
              originalText: String(change?.originalText || ''),
              newText: String(change?.newText || ''),
              explanation: String(change?.explanation || ''),
              severity,
              category: String(change?.category || '')
            };
          })
        : []
    }));
  }

  return result;
}

/**
 * 验证解析结果是否符合预期结构
 */
function validateResult(result: unknown): result is ReviewResult {
  if (!result || typeof result !== 'object' || result === null) {
    return false;
  }

  const typedResult = result as Record<string, unknown>;
  
  return (
    'documentInfo' in typedResult &&
    'reviewContent' in typedResult &&
    Array.isArray(typedResult.reviewContent)
  );
}

/**
 * 创建默认的审阅结果
 */
function createDefaultResult(): ReviewResult {
  return {
    documentInfo: {
      title: "解析失败",
      overview: "无法解析LLM返回的结果",
      totalIssues: {
        errors: 0,
        warnings: 0,
        suggestions: 0
      }
    },
    reviewContent: []
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

    // 选择模型 - 根据配置确定
    const modelName = process.env.NEXT_PUBLIC_LLM_MODEL || "anthropic/claude-3-haiku:latest";
    
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
        model: modelName,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        response_format: { type: "json" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API调用失败:', errorData);
      throw new Error(`API调用失败: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('API返回错误:', data.error);
      throw new Error(`API返回错误: ${data.error.message}`);
    }

    // 获取API返回的内容
    const jsonContent = data.choices[0].message.content;
    
    // 使用parseRobustJSON来解析返回的内容
    return parseRobustJSON(jsonContent);
  } catch (error) {
    console.error("LLM审阅失败:", error);
    return createDefaultResult();
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