import { Document, Paragraph, ChangeType, ChangeSeverity } from "./mock-data";
import { generateEnhancedReviewPrompt } from "./prompts/enhanced-review-prompt";
import { enqueueApiRequest } from "./api-queue";

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

// 定义API响应的接口
interface ReviewSuggestion {
  type: 'replace' | 'insert' | 'delete';
  position: { start: number; end: number };
  originalText: string;
  newText: string;
  explanation: string;
  severity: 'error' | 'warning' | 'suggestion';
  category: string;
}

interface ReviewContent {
  id: string;
  originalText: string;
  changes: ReviewSuggestion[];
}

interface ApiResponse {
  documentInfo?: {
    title: string;
    overview: string;
    totalIssues: { errors: number; warnings: number; suggestions: number };
  };
  reviewContent?: Array<{
    id?: string;
    originalText?: string;
    changes?: Array<{
      type?: string;
      position?: { start: number; end: number };
      originalText?: string;
      newText?: string;
      explanation?: string;
      severity?: string;
      category?: string;
    }>;
  }>;
  changes?: Array<{
    type?: string;
    position?: { start: number; end: number };
    originalText?: string;
    newText?: string;
    explanation?: string;
    severity?: string;
    category?: string;
  }>;
  suggestions?: Array<{
    type?: string;
    position?: { start: number; end: number };
    originalText?: string;
    newText?: string;
    explanation?: string;
    severity?: string;
    category?: string;
  }>;
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
    
    // 使用队列系统发送请求
    console.log('发送API请求...');
    const result = await enqueueApiRequest(document, apiKey, modelName, prompt);
    
    console.log('原始API响应:', result);
    
    // 验证和规范化API响应
    const normalizedResult = normalizeApiResponse(result, document);
    
    console.log('规范化后的响应:', {
      hasDocumentInfo: !!normalizedResult.documentInfo,
      reviewContentCount: normalizedResult.reviewContent?.length || 0,
      contentDetails: normalizedResult.reviewContent?.map(content => ({
        hasOriginalText: !!content.originalText,
        changesCount: content.changes?.length || 0
      }))
    });
    
    // 增强位置信息
    console.log('开始增强位置信息...');
    const enhancedResult = enhanceChangeLocations(normalizedResult);
    console.log('位置信息增强完成:', {
      reviewContentCount: enhancedResult.reviewContent.length,
      hasChanges: enhancedResult.reviewContent.some(content => content.changes?.length > 0)
    });
    
    return enhancedResult;
    
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

/**
 * 规范化API响应，确保数据结构完整
 */
function normalizeApiResponse(result: ApiResponse, document: Document): ReviewResult {
  // 如果没有文档信息，创建默认值
  const documentInfo = {
    title: result.documentInfo?.title || document.title,
    overview: result.documentInfo?.overview || "文档审阅完成",
    totalIssues: result.documentInfo?.totalIssues || { errors: 0, warnings: 0, suggestions: 0 }
  };

  // 确保reviewContent是数组
  let normalizedContent: ReviewContent[] = [];

  if (!Array.isArray(result.reviewContent)) {
    // 如果reviewContent不是数组，尝试将整个响应转换为正确的格式
    console.warn('响应格式不规范，尝试修正...');
    
    // 创建一个新的reviewContent数组
    normalizedContent = document.paragraphs.map((paragraph, index) => {
      return {
        id: String(index + 1),
        originalText: paragraph.text,
        changes: []
      };
    });

    // 尝试从响应中提取变更信息
    try {
      if (result.changes && result.changes.length > 0) {
        // 如果响应中直接包含changes数组
        normalizedContent[0].changes = result.changes.map(change => ({
          type: (change.type as 'replace' | 'insert' | 'delete') || 'replace',
          position: change.position || { start: 0, end: 0 },
          originalText: change.originalText || '',
          newText: change.newText || '',
          explanation: change.explanation || '建议修改',
          severity: (change.severity as 'error' | 'warning' | 'suggestion') || 'suggestion',
          category: change.category || '通用'
        }));
      } else if (result.suggestions && result.suggestions.length > 0) {
        // 如果响应使用了不同的字段名
        normalizedContent[0].changes = result.suggestions.map(suggestion => ({
          type: (suggestion.type as 'replace' | 'insert' | 'delete') || 'replace',
          position: suggestion.position || { start: 0, end: 0 },
          originalText: suggestion.originalText || '',
          newText: suggestion.newText || '',
          explanation: suggestion.explanation || '建议修改',
          severity: (suggestion.severity as 'error' | 'warning' | 'suggestion') || 'suggestion',
          category: suggestion.category || '通用'
        }));
      }
    } catch (error) {
      console.error('转换变更信息时出错:', error);
    }
  } else {
    // 确保每个content都有必要的字段
    normalizedContent = result.reviewContent.map((content, index) => {
      return {
        id: content.id || String(index + 1),
        originalText: content.originalText || document.paragraphs[index]?.text || '',
        changes: Array.isArray(content.changes) ? content.changes.map(change => ({
          type: (change.type as 'replace' | 'insert' | 'delete') || 'replace',
          position: change.position || { start: 0, end: 0 },
          originalText: change.originalText || '',
          newText: change.newText || '',
          explanation: change.explanation || '建议修改',
          severity: (change.severity as 'error' | 'warning' | 'suggestion') || 'suggestion',
          category: change.category || '通用'
        })) : []
      };
    });
  }

  return {
    documentInfo,
    reviewContent: normalizedContent
  };
}

/**
 * 增强变更位置信息，确保每个变更都有精确的position
 */
function enhanceChangeLocations(reviewResult: ReviewResult): ReviewResult {
  try {
    if (!reviewResult.reviewContent) {
      console.error('无效的reviewResult:', reviewResult);
      throw new Error('reviewContent为空');
    }

    const enhanced = {
      ...reviewResult,
      reviewContent: reviewResult.reviewContent.map((content, contentIndex) => {
        console.log(`处理第 ${contentIndex + 1} 个内容块...`);
        
        if (!content.changes) {
          console.warn(`内容块 ${contentIndex + 1} 没有changes数组`);
          return { ...content, changes: [] };
        }

        return {
          ...content,
          changes: content.changes.map((change, changeIndex) => {
            try {
              // 如果API已经提供了完整的position信息，直接使用
              if (change.position && 
                  typeof change.position.start === 'number' && 
                  typeof change.position.end === 'number') {
                return change;
              }
              
              // 如果没有完整position信息但有originalText，尝试计算
              if (change.originalText && content.originalText) {
                // 清理文本，移除多余的空格
                const cleanOriginalText = change.originalText.trim().replace(/\s+/g, ' ');
                const cleanContentText = content.originalText.trim().replace(/\s+/g, ' ');
                
                const start = cleanContentText.indexOf(cleanOriginalText);
                if (start !== -1) {
                  return {
                    ...change,
                    position: {
                      start,
                      end: start + cleanOriginalText.length
                    }
                  };
                }
              }
              
              console.warn(`无法为变更 ${changeIndex + 1} 找到位置信息:`, {
                hasOriginalText: !!change.originalText,
                hasContentText: !!content.originalText
              });
              
              // 无法确定精确位置，返回带默认位置的变更
              return {
                ...change,
                position: { start: 0, end: 0 }
              };
            } catch (error) {
              console.error(`处理变更 ${changeIndex + 1} 时出错:`, error);
              return change;
            }
          })
        };
      })
    };

    console.log('位置信息增强完成');
    return enhanced;
  } catch (error) {
    console.error('增强位置信息时出错:', error);
    return reviewResult;
  }
}

// 将LLM审阅结果转换为应用内部的变更格式
export function convertReviewToChanges(review: ReviewResult): Paragraph[] {
  return review.reviewContent.map((content, index) => ({
    id: index + 1,
    text: content.originalText,
    changes: content.changes.map((change, changeIndex) => ({
      id: `change-${index}-${changeIndex}`,
      type: mapChangeType(change.type),
      position: change.position,
      original: change.originalText,
      new: change.newText,
      explanation: change.explanation,
      severity: mapSeverity(change.severity),
      category: change.category
    }))
  }));
}