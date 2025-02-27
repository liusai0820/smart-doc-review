import { Document, Paragraph, ChangeType, ChangeSeverity } from "./mock-data";
import { generateEnhancedReviewPrompt } from "./prompts/enhanced-review-prompt";

/**
 * 更健壮的JSON解析函数，处理LLM返回的可能格式不正确的JSON
 */
function parseRobustJSON(jsonString: string): ReviewResult {
  // 打印原始输入以便调试
  console.log('待解析的JSON字符串:', jsonString);

  // 如果输入为空，返回默认结果
  if (!jsonString) {
    console.error('输入的JSON字符串为空');
    return createDefaultResult();
  }

  try {
    // 预处理 - 处理转义字符
    let processedString = jsonString;
    
    // 如果整个字符串被引号包围，去除外层引号
    if (processedString.startsWith('"') && processedString.endsWith('"')) {
      try {
        // 先解析外层字符串
        processedString = JSON.parse(processedString);
      } catch (e) {
        console.error('解析外层字符串失败:', e);
      }
    }

    // 查找第一个 { 和最后一个 } 的位置
    let startIdx = processedString.indexOf('{');
    let endIdx = processedString.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
      console.error('JSON字符串中没有找到有效的对象标记');
      return createDefaultResult();
    }

    // 提取JSON对象部分
    processedString = processedString.substring(startIdx, endIdx + 1);

    // 第一阶段：修复转义字符
    processedString = processedString
      // 处理错误的转义
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      // 处理Unicode转义
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => 
        String.fromCharCode(parseInt(code, 16))
      );

    // 第二阶段：标准化JSON格式
    processedString = processedString
      // 处理引号
      .replace(/[""]/g, '"')
      .replace(/['']/g, '"')
      // 处理空白字符
      .replace(/[\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      // 确保属性名有引号
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

    // 第三阶段：修复值格式
    processedString = processedString
      // 处理未加引号的字符串值
      .replace(/:\s*([^",\s\][{}][^,}]*[^",\s\][{}])/g, ':"$1"')
      // 处理数字
      .replace(/:(\s*-?\d+\.?\d*\s*)([,}])/g, ':$1$2')
      // 处理布尔值和null
      .replace(/:\s*true\b/gi, ':true')
      .replace(/:\s*false\b/gi, ':false')
      .replace(/:\s*null\b/gi, ':null');

    // 第四阶段：修复结构问题
    processedString = processedString
      // 修复多余的逗号
      .replace(/,\s*([}\]])/g, '$1')
      // 修复缺少的逗号
      .replace(/}(\s*){/g, '},{')
      .replace(/](\s*)\[/g, '],[')
      .replace(/"([^"]+)"\s*"([^"]+)"/g, '"$1","$2"');

    console.log('清理后的JSON字符串:', processedString);

    try {
      // 尝试解析
      const parsed = JSON.parse(processedString);
      console.log('初步解析结果:', parsed);
      
      // 验证并规范化结果
      const result = normalizeResult(parsed);
      
      if (!validateResult(result)) {
        console.error('解析结果不符合预期结构');
        return createDefaultResult();
      }

      return result;
    } catch (parseError) {
      console.error('JSON解析失败，错误信息:', parseError);
      
      // 最后尝试：直接解析原始字符串
      try {
        const parsed = JSON.parse(jsonString);
        const result = normalizeResult(parsed);
        
        if (!validateResult(result)) {
          return createDefaultResult();
        }
        
        return result;
      } catch (finalError) {
        console.error('最终解析尝试失败:', finalError);
        return createDefaultResult();
      }
    }
  } catch (error) {
    console.error('JSON处理失败:', error);
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

  console.log('规范化后的结果:', result);
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

export async function reviewDocumentWithLLM(document: Document): Promise<ReviewResult> {
  try {
    // 构建发送给LLM的文档内容
    const paragraphTexts = document.paragraphs.map(p => p.text).join('\n\n');
    
    console.log('开始调用LLM审阅文档:', {
      title: document.title,
      paragraphCount: document.paragraphs.length
    });

    // 生成审阅提示词
    const prompt = generateEnhancedReviewPrompt(document.title, paragraphTexts);
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
    let jsonContent = data.choices[0].message.content;
    console.log('API返回的原始内容:', jsonContent);

    // 预处理返回的内容
    try {
      // 如果返回的是字符串形式的JSON，先解析一次
      if (typeof jsonContent === 'string') {
        // 移除可能的 markdown 代码块标记
        jsonContent = jsonContent.replace(/```json\n?|\n?```/g, '');
        
        // 尝试解析JSON字符串
        try {
          const parsedContent = JSON.parse(jsonContent);
          console.log('成功解析返回的JSON');
          
          // 验证并规范化结果
          const result = normalizeResult(parsedContent);
          if (validateResult(result)) {
            return result;
          }
        } catch (parseError) {
          console.error('解析返回的JSON失败:', parseError);
        }
      }
      
      // 如果上面的方法失败，返回一个基本的结果结构
      return {
        documentInfo: {
          title: document.title,
          overview: "解析API返回结果时出错，请重试。",
          totalIssues: {
            errors: 0,
            warnings: 0,
            suggestions: 0
          }
        },
        reviewContent: document.paragraphs.map((para, index) => ({
          id: `error-${index}`,
          originalText: para.text,
          changes: []
        }))
      };
    } catch (error) {
      console.error('处理API返回内容时出错:', error);
      return createDefaultResult();
    }
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
        // 映射类型
        let type: ChangeType;
        switch (change.type) {
          case "insert":
            type = "addition";
            break;
          case "delete":
            type = "deletion";
            break;
          default:
            type = "replace";
        }

        // 映射严重程度
        let severity: ChangeSeverity;
        switch (change.severity) {
          case "error":
            severity = "error";
            break;
          case "warning":
            severity = "warning";
            break;
          default:
            severity = "info";
        }

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