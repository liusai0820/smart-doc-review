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
                             "anthropic/claude-3.5-sonnet";
    
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
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API请求失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`API请求失败: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
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
      const result = parseRobustJSON(jsonString);

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

      return result;
    } catch (error) {
      console.error('处理API响应失败:', error);
      console.error('问题JSON字符串:', jsonString);
      throw new Error(`解析API响应失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  } catch (error) {
    console.error("审阅文档失败:", error);
    throw error;
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