import { ReviewResult } from "./openrouter-api";

/**
 * 改进的健壮JSON解析函数，处理各种格式不规范的JSON字符串
 * @param jsonString 原始JSON字符串
 * @returns 解析后的ReviewResult对象
 */
export function parseRobustJSON(jsonString: string): ReviewResult {
  try {
    return JSON.parse(jsonString);
  } catch {
    // 如果直接解析失败，尝试清理和修复JSON字符串
    const cleanedJson = jsonString
      .replace(/[\u0000-\u001F]+/g, '') // 移除控制字符
      .replace(/\\n/g, ' ')   // 替换换行符
      .replace(/\\r/g, ' ')   // 替换回车符
      .replace(/\s+/g, ' ')   // 压缩空白字符
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // 给未加引号的键名加上引号
      .trim();
    
    return JSON.parse(cleanedJson);
  }
}