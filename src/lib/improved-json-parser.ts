import { ReviewResult } from "./types";

/**
 * 增强的 JSON 解析器，用于处理和修复不规范的 JSON 字符串
 */

/**
 * 清理和规范化 JSON 字符串
 */
function sanitizeJsonString(input: string): string {
  // 1. 提取 JSON 对象
  const jsonStart = input.indexOf('{');
  const jsonEnd = input.lastIndexOf('}');
  
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('未找到有效的 JSON 对象');
  }
  
  let jsonString = input.substring(jsonStart, jsonEnd + 1);

  // 2. 基础清理
  jsonString = jsonString
    .replace(/[\u0000-\u001F]+/g, '')     // 移除控制字符
    .replace(/\s+/g, ' ')                 // 规范化空白字符
    .replace(/\n\s*\n/g, '\n')            // 移除多余的空行
    .replace(/\\\"/g, '"')                // 处理过度转义的双引号
    .replace(/\\\\/g, '\\')               // 处理过度转义的反斜杠
    .replace(/。/g, '。\n')               // 在中文句号后添加换行
    .replace(/([。！？；])\s*/g, '$1\n')   // 在标点符号后添加换行
    .trim();

  return jsonString;
}

/**
 * 修复常见的 JSON 格式问题
 */
function fixCommonJsonIssues(jsonString: string): string {
  // 1. 修复属性名格式
  jsonString = jsonString
    // 处理未加引号的属性名
    .replace(/(?<=[{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '"$1":')
    // 处理单引号包裹的属性名
    .replace(/'/g, '"');

  // 2. 修复属性值格式
  jsonString = jsonString
    // 处理未加引号的字符串值
    .replace(/(?<=[{,]\s*"[^"]+"\s*:\s*)([^",\{\[\s][^,\}\]]*?)(?=\s*[,\}\]])/g, '"$1"')
    // 处理数值和布尔值
    .replace(/(?<=[{,]\s*"[^"]+"\s*:\s*)(true|false|null|\d+\.?\d*)(?=\s*[,\}\]])/g, '$1')
    // 修复缺失的逗号 - 在字符串值后添加逗号
    .replace(/("(?:[^"\\]|\\.)*")\s*(?="[^"]*"\s*:)/g, '$1,')
    // 修复缺失的逗号 - 在数值后添加逗号
    .replace(/(\d+)\s*(?="[^"]*"\s*:)/g, '$1,')
    // 修复缺失的逗号 - 在布尔值后添加逗号
    .replace(/(true|false)\s*(?="[^"]*"\s*:)/g, '$1,')
    // 修复缺失的逗号 - 在对象或数组后添加逗号
    .replace(/([}\]])\s*(?="[^"]*"\s*:)/g, '$1,');

  // 3. 修复结构问题
  jsonString = jsonString
    // 移除多余的逗号
    .replace(/,(\s*[}\]])/g, '$1')
    // 修复缺失的逗号
    .replace(/([}\]])\s*([{\[])/g, '$1,$2')
    // 处理未闭合的括号
    .replace(/([{\[])\s*$/g, '$1}')
    .replace(/^\s*([\]}])/g, '{$1');

  // 4. 清理多余的逗号
  jsonString = jsonString
    .replace(/,\s*,/g, ',')  // 移除连续的逗号
    .replace(/,\s*}/g, '}')  // 移除对象末尾的逗号
    .replace(/,\s*]/g, ']'); // 移除数组末尾的逗号

  return jsonString;
}

/**
 * 验证 JSON 结构的完整性
 */
function validateJsonStructure(json: unknown): json is ReviewResult {
  if (typeof json !== 'object' || json === null) {
    return false;
  }

  const result = json as Partial<ReviewResult>;

  // 检查必需的顶级属性
  if (!result.documentInfo || !result.reviewContent || !Array.isArray(result.reviewContent)) {
    return false;
  }

  // 检查 documentInfo 结构
  const { documentInfo } = result;
  if (!documentInfo.title || !documentInfo.overview || !documentInfo.totalIssues) {
    return false;
  }

  // 检查 reviewContent 结构
  return result.reviewContent.every(item => {
    if (!item.id || !item.originalText || !Array.isArray(item.changes)) {
      return false;
    }

    // 检查每个 change 的结构
    return item.changes.every(change => {
      return (
        change.type &&
        change.position &&
        typeof change.position.start === 'number' &&
        typeof change.position.end === 'number' &&
        change.explanation &&
        change.severity &&
        change.category
      );
    });
  });
}

/**
 * 增强的 JSON 解析函数
 */
export function parseRobustJSON(input: string): ReviewResult {
  try {
    console.log('原始输入:', input);
    
    // 1. 清理和规范化输入
    let jsonString = sanitizeJsonString(input);
    console.log('清理后的 JSON:', {
      length: jsonString.length,
      preview: jsonString.substring(0, 200),
      position35: jsonString.substring(30, 40)  // 显示错误位置附近的内容
    });

    // 2. 第一次尝试解析
    try {
      const result = JSON.parse(jsonString);
      if (validateJsonStructure(result)) {
        return result;
      }
    } catch (e) {
      console.log('初次解析失败:', e);
    }

    // 3. 修复并重试
    jsonString = fixCommonJsonIssues(jsonString);
    console.log('修复后的 JSON:', {
      length: jsonString.length,
      preview: jsonString.substring(0, 200),
      position35: jsonString.substring(30, 40)  // 显示错误位置附近的内容
    });

    // 4. 再次尝试解析
    const result = JSON.parse(jsonString);
    if (!validateJsonStructure(result)) {
      throw new Error('JSON 结构验证失败');
    }

    return result;
  } catch (error) {
    console.error('JSON 解析失败:', error);
    console.error('最后的 JSON 字符串:', input);
    throw new Error(`JSON 解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}