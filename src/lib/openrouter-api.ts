import { Document, Paragraph, ReviewResult } from "./types";
import { generateEnhancedReviewPrompt } from "./prompts/enhanced-review-prompt";
import { parseRobustJSON } from "./improved-json-parser";

/**
 * 使用OpenRouter API审阅文档
 */
export async function reviewDocumentWithLLM(
  document: Document,
  apiKey?: string,
  modelName?: string,
  customPrompt?: string
): Promise<ReviewResult> {
  if (!document || !document.paragraphs) {
    throw new Error("无效的文档对象");
  }

  try {
    console.log('开始审阅文档:', {
      title: document.title,
      paragraphCount: document.paragraphs.length
    });

    // 构建发送给LLM的文档内容
    const paragraphTexts = document.paragraphs.map(p => p.text).join('\n\n');
    
    // 验证文档内容不为空
    if (!paragraphTexts || paragraphTexts.trim() === '') {
      console.error('警告：文档内容为空！');
      throw new Error('文档内容为空，无法进行审阅');
    }

    console.log('文档内容信息:', {
      contentLength: paragraphTexts.length,
      contentPreview: paragraphTexts.substring(0, 100) + '...',
      paragraphCount: document.paragraphs.length
    });
    
    // 使用传入的自定义提示词，或者使用默认的增强审阅提示词
    const prompt = customPrompt || generateEnhancedReviewPrompt(document.title, paragraphTexts);
    
    // 记录提示词信息
    console.log('提示词信息:', {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100) + '...',
      contentIncluded: prompt.includes(paragraphTexts.substring(0, 100)),
      contentPosition: prompt.indexOf(paragraphTexts.substring(0, 100))
    });
    
    // 从localStorage获取API密钥（如果未提供）
    const effectiveApiKey = apiKey || 
                          (typeof localStorage !== 'undefined' ? localStorage.getItem('openrouter_api_key') : null) || 
                          process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    if (!effectiveApiKey) {
      throw new Error("未找到API密钥。请在设置中配置OpenRouter API密钥。");
    }
    
    // 从localStorage获取模型名称（如果未提供）
    const effectiveModelName = modelName || 
                             (typeof localStorage !== 'undefined' ? localStorage.getItem('llm_model') : null) || 
                             "google/gemini-2.0-flash-exp:free";
    
    console.log('准备调用API:', {
      model: effectiveModelName,
      promptLength: prompt.length,
      apiKeyLength: effectiveApiKey.length
    });
    
    // 发送API请求
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${effectiveApiKey}`,
        "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        "X-Title": "Smart Doc Review"
      },
      body: JSON.stringify({
        model: effectiveModelName,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: { 
          type: "json_object",
          schema: {
            type: "object",
            required: ["documentInfo", "reviewContent"],
            additionalProperties: false,
            properties: {
              documentInfo: {
                type: "object",
                required: ["title", "overview", "totalIssues"],
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  overview: { type: "string" },
                  totalIssues: {
                    type: "object",
                    required: ["errors", "warnings", "suggestions"],
                    additionalProperties: false,
                    properties: {
                      errors: { type: "integer", minimum: 0 },
                      warnings: { type: "integer", minimum: 0 },
                      suggestions: { type: "integer", minimum: 0 }
                    }
                  }
                }
              },
              reviewContent: {
                type: "array",
                items: {
                  type: "object",
                  required: ["id", "originalText", "changes"],
                  additionalProperties: false,
                  properties: {
                    id: { type: "string" },
                    originalText: { type: "string" },
                    changes: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["type", "position", "originalText", "newText", "explanation", "severity", "category"],
                        additionalProperties: false,
                        properties: {
                          type: { type: "string", enum: ["replace", "insert", "delete"] },
                          position: {
                            type: "object",
                            required: ["start", "end"],
                            additionalProperties: false,
                            properties: {
                              start: { type: "integer", minimum: 0 },
                              end: { type: "integer", minimum: 0 }
                            }
                          },
                          originalText: { type: "string" },
                          newText: { type: "string" },
                          explanation: { type: "string" },
                          severity: { type: "string", enum: ["error", "warning", "suggestion"] },
                          category: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
      console.error('API请求失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`API请求失败: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json().catch(e => {
      console.error('解析API响应JSON失败:', e);
      throw new Error(`解析API响应失败: ${e.message}`);
    });
    
    console.log('API原始响应数据:', data);

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('API响应格式错误:', data);
      throw new Error('API响应格式错误');
    }

    const jsonString = data.choices[0].message.content;
    console.log('API返回的原始内容:', {
      length: jsonString.length,
      content: jsonString
    });

    try {
      // 使用增强的 JSON 解析器处理响应
      const result = parseRobustJSON(jsonString, document.title);

      // 验证结果是否为空
      if (!result || !result.documentInfo || !result.reviewContent) {
        console.error('解析结果验证失败:', result);
        throw new Error('解析结果验证失败，缺少必要的字段');
      }

      // 规范化结果数据
      result.reviewContent = result.reviewContent.map((item: ReviewResult['reviewContent'][0]) => ({
        id: item.id || String(Math.random()).slice(2),
        originalText: item.originalText || '',
        changes: (item.changes || []).map((change: ReviewResult['reviewContent'][0]['changes'][0]) => ({
          type: change.type || 'replace',
          position: change.position || { start: 0, end: 0 },
          originalText: change.originalText || '',
          newText: change.newText || '',
          explanation: change.explanation || '未提供说明',
          severity: change.severity || 'suggestion',
          category: change.category || '其他'
        }))
      }));

      // 确保 totalIssues 字段存在
      if (!result.documentInfo.totalIssues) {
        result.documentInfo.totalIssues = {
          errors: 0,
          warnings: 0,
          suggestions: 0
        };
      }

      return result;
    } catch (error) {
      console.error('处理API响应失败:', error);
      console.error('问题JSON字符串:', jsonString);
      
      // 尝试创建一个最小可用的结果对象
      const fallbackResult: ReviewResult = {
        documentInfo: {
          title: document.title || "未知文档",
          overview: "文档解析过程中发生错误，无法提供完整分析。",
          totalIssues: {
            errors: 0,
            warnings: 0,
            suggestions: 0
          }
        },
        reviewContent: document.paragraphs.map((p, index) => ({
          id: String(index),
          originalText: p.text,
          changes: []
        }))
      };
      
      console.log('使用备用结果:', fallbackResult);
      return fallbackResult;
    }
  } catch (error) {
    console.error("审阅文档失败:", error);
    
    // 创建一个错误结果对象
    const errorResult: ReviewResult = {
      documentInfo: {
        title: document.title || "未知文档",
        overview: `审阅失败: ${error instanceof Error ? error.message : '未知错误'}`,
        totalIssues: {
          errors: 1,
          warnings: 0,
          suggestions: 0
        }
      },
      reviewContent: document.paragraphs.map((p, index) => ({
        id: String(index),
        originalText: p.text,
        changes: []
      }))
    };
    
    // 在开发环境中抛出错误，在生产环境中返回错误结果
    if (process.env.NODE_ENV === 'development') {
      throw error;
    } else {
      console.log('返回错误结果:', errorResult);
      return errorResult;
    }
  }
}

/**
 * 将审阅结果转换为段落变更
 */
export function convertReviewToChanges(result: ReviewResult): Paragraph[] {
  if (!result.reviewContent) {
    console.error('审阅结果中缺少 reviewContent');
    return [];
  }

  return result.reviewContent.map(review => ({
    id: parseInt(review.id) || 0,
    text: review.originalText || '',
    changes: (review.changes || []).map(change => ({
      id: Math.random().toString(36).substring(2, 15),
      type: change.type === 'insert' ? 'addition' :
            change.type === 'delete' ? 'deletion' :
            'replace',
      position: change.position || { start: 0, end: 0 },
      original: change.originalText || '',
      new: change.newText || '',
      explanation: change.explanation || '未提供说明',
      severity: change.severity === 'suggestion' ? 'info' : (change.severity || 'info'),
      category: change.category || '其他'
    })),
    isHtml: false,
    isTable: false,
    severity: 0
  }));
} 