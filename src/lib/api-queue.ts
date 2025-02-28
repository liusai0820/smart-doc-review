// src/lib/api-queue.ts
import { Document } from "./mock-data";
import { toast } from "sonner";

// 队列状态
interface QueueItem {
  id: string;
  document: Document;
  prompt: string;
  apiKey?: string;
  modelName?: string;
  resolve: (result: Record<string, unknown>) => void;
  reject: (error: Error) => void;
  retryCount: number;
}

// 队列配置
const MAX_RETRIES = 2;
const RETRY_DELAY = 3000;
const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet";
const DEFAULT_TEMPERATURE = 0.3;

// 请求队列
const queue: QueueItem[] = [];
let isProcessing = false;

/**
 * 添加API请求到队列
 */
export async function enqueueApiRequest(
  document: Document,
  apiKey?: string,
  modelName?: string,
  prompt?: string
): Promise<Record<string, unknown>> {
  // 创建一个唯一的请求ID
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // 确保有有效的提示词
  if (!prompt) {
    throw new Error("必须提供审阅提示词");
  }
  
  console.log(`将请求添加到队列: ${requestId}`, {
    documentTitle: document.title,
    hasApiKey: !!apiKey,
    modelName: modelName || DEFAULT_MODEL
  });
  
  // 使用Promise来处理异步队列
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    // 添加请求到队列
    queue.push({
      id: requestId,
      document,
      prompt,
      apiKey,
      modelName,
      resolve,
      reject,
      retryCount: 0
    });
    
    // 如果队列没有在处理，开始处理
    if (!isProcessing) {
      void processQueue();
    }
  });
}

/**
 * 处理队列中的请求
 */
async function processQueue(): Promise<void> {
  // 如果队列为空或已经在处理中，直接返回
  if (queue.length === 0 || isProcessing) {
    return;
  }
  
  isProcessing = true;
  const item = queue.shift();
  
  if (!item) {
    isProcessing = false;
    return;
  }
  
  console.log(`开始处理队列请求: ${item.id}`, {
    documentTitle: item.document.title,
    queueRemaining: queue.length
  });
  
  try {
    // 执行API请求
    const result = await callOpenRouterApi(
      item.document,
      item.prompt,
      item.apiKey,
      item.modelName
    );
    
    console.log(`请求成功: ${item.id}`);
    item.resolve(result);
  } catch (error) {
    console.error(`处理请求失败: ${item.id}`, error);
    
    // 处理重试逻辑
    if (item.retryCount < MAX_RETRIES) {
      console.log(`重试请求 (${item.retryCount + 1}/${MAX_RETRIES}): ${item.id}`);
      
      item.retryCount++;
      // 添加回队列但稍后重试
      setTimeout(() => {
        queue.unshift(item);
        if (!isProcessing) {
          void processQueue();
        }
      }, RETRY_DELAY);
    } else {
      console.error(`请求达到最大重试次数: ${item.id}`);
      item.reject(error instanceof Error ? error : new Error(String(error)));
    }
  } finally {
    isProcessing = false;
    
    // 继续处理队列中的下一个请求
    if (queue.length > 0) {
      void processQueue();
    }
  }
}

/**
 * 调用OpenRouter API
 */
async function callOpenRouterApi(
  document: Document,
  prompt: string,
  apiKey?: string,
  modelName?: string
): Promise<Record<string, unknown>> {
  try {
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
                             DEFAULT_MODEL;
    
    console.log(`调用OpenRouter API:`, {
      model: effectiveModelName,
      promptLength: prompt.length
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
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      })
    });
    
    // 处理HTTP错误
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API错误响应:', errorData);
      
      // 创建更具描述性的错误消息
      const statusText = response.statusText || '未知错误';
      const errorMessage = errorData.error?.message || 
                          (errorData as Record<string, unknown>).message || 
                          `API请求失败: ${statusText}`;
      
      throw new Error(typeof errorMessage === 'string' ? errorMessage : 'API请求失败');
    }
    
    // 解析API响应
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`API错误: ${
        typeof data.error.message === 'string' ? 
        data.error.message : JSON.stringify(data.error)
      }`);
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('API返回了无效的响应格式');
    }
    
    // 提取JSON响应
    const jsonContent = data.choices[0].message.content;
    
    if (typeof jsonContent !== 'string') {
      throw new Error('API返回了无效的响应内容格式');
    }
    
    // 尝试解析JSON
    try {
      // 提取可能嵌入在Markdown代码块中的JSON
      const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                         jsonContent.match(/\{[\s\S]*\}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : jsonContent;
      
      // 清理JSON字符串
      const cleanJson = jsonString
        .replace(/[\u0000-\u001F]+/g, '') // 移除控制字符
        .replace(/[""]/g, '"')  // 替换中文引号
        .replace(/['']/g, "'")  // 替换中文单引号
        .replace(/\\n/g, ' ')   // 替换换行符
        .replace(/\\r/g, ' ');  // 替换回车符
      
      return JSON.parse(cleanJson) as Record<string, unknown>;
    } catch (parseError) {
      console.error('解析JSON失败:', parseError);
      console.log('原始内容:', jsonContent);
      
      // 尝试简单清理后返回原始内容 - 后续处理函数应能够处理这种情况
      return { 
        rawContent: jsonContent,
        parseError: true
      };
    }
  } catch (error) {
    console.error('API调用失败:', error);
    
    // 显示友好的错误提示
    if (typeof window !== 'undefined') {
      toast.error(error instanceof Error ? error.message : '审阅请求失败，请重试');
    }
    
    throw error;
  }
}