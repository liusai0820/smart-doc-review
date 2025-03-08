import { ReviewResult } from "./types";

/**
 * 增强的 JSON 解析器，用于处理和修复不规范的 JSON 字符串
 */

/**
 * 提取JSON对象
 * 从文本中提取最外层的JSON对象
 */
function extractJsonObject(input: string): string {
  // 查找第一个 { 和最后一个 }
  const start = input.indexOf('{');
  const end = input.lastIndexOf('}');
  
  if (start === -1 || end === -1 || start > end) {
    throw new Error('未找到有效的JSON对象');
  }
  
  return input.substring(start, end + 1);
}

/**
 * 预处理JSON字符串
 * 处理常见的格式问题
 */
function preprocessJsonString(input: string): string {
  // 1. 提取JSON对象
  let jsonString = extractJsonObject(input);
  
  // 2. 替换中文标点符号
  jsonString = jsonString
    .replace(/[""]/g, '"')       // 中文引号 -> 英文引号
    .replace(/['']/g, "'")       // 中文单引号 -> 英文单引号
    .replace(/[：]/g, ":")       // 中文冒号 -> 英文冒号
    .replace(/[，]/g, ",")       // 中文逗号 -> 英文逗号
    .replace(/[（]/g, "(")       // 中文括号 -> 英文括号
    .replace(/[）]/g, ")")       // 中文括号 -> 英文括号
    .replace(/[【]/g, "[")       // 中文方括号 -> 英文方括号
    .replace(/[】]/g, "]")       // 中文方括号 -> 英文方括号
    .replace(/[｛]/g, "{")       // 中文花括号 -> 英文花括号
    .replace(/[｝]/g, "}")       // 中文花括号 -> 英文花括号
    .replace(/[\u200B-\u200D\uFEFF]/g, '');  // 移除零宽字符
  
  // 3. 处理转义问题
  jsonString = jsonString
    .replace(/\\"/g, '"')        // 处理过度转义的双引号
    .replace(/\\\\/g, '\\')      // 处理过度转义的反斜杠
    .replace(/\\n/g, ' ')        // 将换行符替换为空格
    .replace(/\\t/g, ' ');       // 将制表符替换为空格
  
  // 4. 移除控制字符和格式化空白
  jsonString = jsonString
    .replace(/[\u0000-\u001F\u007F-\u009F]+/g, '')  // 移除控制字符
    .replace(/\s+/g, ' ')                            // 规范化空白字符
    .trim();

  // 5. 修复常见的JSON格式问题
  jsonString = jsonString
    // 修复属性名格式
    .replace(/(?<=[{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '"$1":')
    // 修复属性值格式
    .replace(/:\s*'([^']*)'/g, ':"$1"')
    // 修复逗号问题
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/,\s*,/g, ',')
    // 修复引号问题
    .replace(/"([^"]*)""/g, '"$1"')
    .replace(/'([^']*)'/g, '"$1"')
    // 修复空值问题
    .replace(/:\s*,/g, ':null,')
    .replace(/:\s*}/g, ':null}')
    // 修复数组格式
    .replace(/\[\s*,/g, '[')
    .replace(/,\s*\]/g, ']')
    // 修复对象格式
    .replace(/{\s*,/g, '{')
    .replace(/,\s*}/g, '}');

  return jsonString;
}

/**
 * 创建默认的ReviewResult对象
 */
function createDefaultReviewResult(title: string = "未知文档"): ReviewResult {
  return {
    documentInfo: {
      title: title,
      overview: "无法解析文档审阅结果，请重试。",
      totalIssues: {
        errors: 0,
        warnings: 0,
        suggestions: 0
      }
    },
    reviewContent: []
  };
}

/**
 * 使用正则表达式提取关键信息
 * 当JSON解析完全失败时的备用方案
 */
function extractKeyInfoWithRegex(input: string, title: string = "未知文档"): ReviewResult {
  const result = createDefaultReviewResult(title);
  
  try {
    // 尝试提取文档标题
    const titleMatch = /"title"\s*:\s*"([^"]*)"/;
    if (titleMatch.test(input)) {
      result.documentInfo.title = input.match(titleMatch)?.[1] || title;
    }
    
    // 尝试提取概述
    const overviewMatch = /"overview"\s*:\s*"([^"]*)"/;
    if (overviewMatch.test(input)) {
      result.documentInfo.overview = input.match(overviewMatch)?.[1] || "无法完全解析审阅结果";
    }
    
    // 尝试提取问题数量
    const errorsMatch = /"errors"\s*:\s*(\d+)/;
    const warningsMatch = /"warnings"\s*:\s*(\d+)/;
    const suggestionsMatch = /"suggestions"\s*:\s*(\d+)/;
    
    if (errorsMatch.test(input)) {
      result.documentInfo.totalIssues.errors = parseInt(input.match(errorsMatch)?.[1] || "0");
    }
    
    if (warningsMatch.test(input)) {
      result.documentInfo.totalIssues.warnings = parseInt(input.match(warningsMatch)?.[1] || "0");
    }
    
    if (suggestionsMatch.test(input)) {
      result.documentInfo.totalIssues.suggestions = parseInt(input.match(suggestionsMatch)?.[1] || "0");
    }
  } catch (e) {
    console.error("正则提取信息失败:", e);
  }
  
  return result;
}

/**
 * 验证ReviewResult对象结构
 */
function validateReviewResult(obj: unknown): obj is ReviewResult {
  if (!obj || typeof obj !== 'object') return false;
  
  const typedObj = obj as Record<string, unknown>;
  
  // 检查documentInfo
  if (!typedObj.documentInfo || typeof typedObj.documentInfo !== 'object') return false;
  
  const docInfo = typedObj.documentInfo as Record<string, unknown>;
  if (typeof docInfo.title !== 'string') return false;
  if (typeof docInfo.overview !== 'string') return false;
  
  // 检查totalIssues
  if (!docInfo.totalIssues || typeof docInfo.totalIssues !== 'object') return false;
  
  const issues = docInfo.totalIssues as Record<string, unknown>;
  if (typeof issues.errors !== 'number') return false;
  if (typeof issues.warnings !== 'number') return false;
  if (typeof issues.suggestions !== 'number') return false;
  
  // 检查reviewContent
  if (!Array.isArray(typedObj.reviewContent)) return false;
  
  return true;
}

/**
 * 修复ReviewResult对象中的问题
 */
function sanitizeReviewResult(result: unknown, title: string = "未知文档"): ReviewResult {
  // 如果结果无效，返回默认对象
  if (!result || typeof result !== 'object') {
    return createDefaultReviewResult(title);
  }
  
  const typedResult = result as Record<string, unknown>;
  
  // 确保documentInfo存在
  if (!typedResult.documentInfo || typeof typedResult.documentInfo !== 'object') {
    typedResult.documentInfo = {
      title: title,
      overview: "无法完全解析审阅结果",
      totalIssues: { errors: 0, warnings: 0, suggestions: 0 }
    };
  } else {
    const docInfo = typedResult.documentInfo as Record<string, unknown>;
    // 确保documentInfo的字段存在
    docInfo.title = typeof docInfo.title === 'string' 
      ? docInfo.title : title;
    
    docInfo.overview = typeof docInfo.overview === 'string'
      ? docInfo.overview : "无法完全解析审阅结果";
    
    // 确保totalIssues存在
    if (!docInfo.totalIssues || typeof docInfo.totalIssues !== 'object') {
      docInfo.totalIssues = { errors: 0, warnings: 0, suggestions: 0 };
    } else {
      const issues = docInfo.totalIssues as Record<string, unknown>;
      // 确保totalIssues的字段是数字
      issues.errors = typeof issues.errors === 'number'
        ? issues.errors : 0;
      
      issues.warnings = typeof issues.warnings === 'number'
        ? issues.warnings : 0;
      
      issues.suggestions = typeof issues.suggestions === 'number'
        ? issues.suggestions : 0;
    }
  }
  
  // 确保reviewContent是数组
  if (!Array.isArray(typedResult.reviewContent)) {
    typedResult.reviewContent = [];
  } else {
    // 过滤并修复reviewContent中的每个项目
    typedResult.reviewContent = typedResult.reviewContent
      .filter(item => item && typeof item === 'object')
      .map((item: unknown) => {
        const typedItem = item as Record<string, unknown>;
        return {
          id: typeof typedItem.id === 'string' ? typedItem.id : String(Math.random()).slice(2),
          originalText: typeof typedItem.originalText === 'string' ? typedItem.originalText : "",
          changes: Array.isArray(typedItem.changes) 
            ? typedItem.changes
                .filter(change => change && typeof change === 'object')
                .map((change: unknown) => {
                  const typedChange = change as Record<string, unknown>;
                  const position = typedChange.position as Record<string, unknown> | undefined;
                  
                  return {
                    type: typeof typedChange.type === 'string' ? typedChange.type : 'replace',
                    position: position && typeof position === 'object'
                      ? {
                          start: typeof position.start === 'number' ? position.start : 0,
                          end: typeof position.end === 'number' ? position.end : 0
                        }
                      : { start: 0, end: 0 },
                    originalText: typeof typedChange.originalText === 'string' ? typedChange.originalText : "",
                    newText: typeof typedChange.newText === 'string' ? typedChange.newText : "",
                    explanation: typeof typedChange.explanation === 'string' ? typedChange.explanation : "未提供说明",
                    severity: typeof typedChange.severity === 'string' ? typedChange.severity : 'suggestion',
                    category: typeof typedChange.category === 'string' ? typedChange.category : "其他"
                  };
                })
            : []
        };
      });
  }
  
  return typedResult as unknown as ReviewResult;
}

/**
 * 修复JSON字符串中的常见错误
 */
function fixJsonErrors(jsonString: string): string {
  // 1. 修复属性名格式
  let fixed = jsonString
    // 处理未加引号的属性名
    .replace(/(?<=[{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '"$1":')
    // 处理单引号包裹的属性名
    .replace(/(?<=[{,]\s*)'([^']+)'\s*:/g, '"$1":')
    // 处理带空格的属性名
    .replace(/(?<=[{,]\s*)"([^"]+)"\s+:/g, '"$1":');
  
  // 2. 修复属性值格式
  fixed = fixed
    // 处理单引号包裹的字符串值
    .replace(/(?<=:\s*)'([^']*)'/g, '"$1"')
    // 处理未加引号的字符串值（非数字、布尔值、null、对象或数组）
    .replace(/(?<=:\s*)(?!(true|false|null|\d+\.?\d*|\{|\[))([\w\u4e00-\u9fa5]+)(?=\s*[,}\]])/g, '"$2"')
    // 处理数值格式
    .replace(/(?<=:\s*)(\d+\.?\d*)(?=\s*[,}\]])/g, (match) => Number(match).toString());
  
  // 3. 修复逗号问题
  fixed = fixed
    // 移除多余的逗号
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/,\s*,/g, ',')
    // 添加缺失的逗号
    .replace(/(["\d\w\]}])(\s*)"([^"]+)"\s*:/g, '$1,"$3":');
  
  // 4. 修复引号问题
  fixed = fixed
    .replace(/"([^"]*)""/g, '"$1"')
    .replace(/'([^']*)'/g, '"$1"');
  
  // 5. 修复空值问题
  fixed = fixed
    .replace(/:\s*,/g, ':null,')
    .replace(/:\s*}/g, ':null}');
  
  // 6. 修复数组和对象格式
  fixed = fixed
    .replace(/\[\s*,/g, '[')
    .replace(/,\s*\]/g, ']')
    .replace(/{\s*,/g, '{')
    .replace(/,\s*}/g, '}');
  
  return fixed;
}

/**
 * 手动解析JSON
 * 当标准解析方法失败时的最后尝试
 */
function manuallyParseJson(input: string, documentTitle: string): ReviewResult {
  try {
    // 尝试提取documentInfo部分
    const docInfoMatch = /"documentInfo"\s*:\s*{([^}]*)}/.exec(input);
    const docInfoStr = docInfoMatch ? docInfoMatch[0] : '';
    
    // 尝试提取reviewContent部分
    const reviewContentMatch = /"reviewContent"\s*:\s*\[(.*)\]/.exec(input);
    const reviewContentStr = reviewContentMatch ? reviewContentMatch[0] : '';
    
    // 构建一个有效的JSON字符串
    const validJson = `{${docInfoStr ? docInfoStr : `"documentInfo":{"title":"${documentTitle}","overview":"无法解析文档内容","totalIssues":{"errors":0,"warnings":0,"suggestions":0}}`},${reviewContentStr ? reviewContentStr : `"reviewContent":[]`}}`;
    
    try {
      // 尝试解析构建的JSON
      return JSON.parse(validJson);
    } catch {
      // 如果仍然失败，返回默认结果
      return createDefaultReviewResult(documentTitle);
    }
  } catch (error) {
    console.error("手动解析JSON失败:", error);
    return createDefaultReviewResult(documentTitle);
  }
}

/**
 * 增强的JSON解析函数
 * 使用多种策略尝试解析LLM返回的JSON
 */
export function parseRobustJSON(input: string, documentTitle: string = "未知文档"): ReviewResult {
  if (!input || typeof input !== 'string') {
    console.error("输入无效:", input);
    return createDefaultReviewResult(documentTitle);
  }
  
  try {
    console.log("开始解析JSON，输入长度:", input.length);
    
    // 1. 预处理JSON字符串
    const preprocessed = preprocessJsonString(input);
    console.log("预处理后JSON长度:", preprocessed.length);
    
    // 2. 尝试直接解析
    try {
      const parsed = JSON.parse(preprocessed);
      
      // 验证并修复结果
      if (validateReviewResult(parsed)) {
        console.log("JSON解析成功并验证通过");
        return sanitizeReviewResult(parsed, documentTitle);
      } else {
        console.log("JSON解析成功但验证失败，进行修复");
        return sanitizeReviewResult(parsed, documentTitle);
      }
    } catch (e) {
      console.error("直接解析JSON失败:", e);
      
      // 3. 尝试修复常见JSON错误
      try {
        // 应用更全面的修复策略
        const fixedJson = fixJsonErrors(preprocessed);
        
        console.log("修复后尝试再次解析");
        const parsed = JSON.parse(fixedJson);
        
        if (validateReviewResult(parsed)) {
          console.log("修复后JSON解析成功并验证通过");
          return sanitizeReviewResult(parsed, documentTitle);
        } else {
          console.log("修复后JSON解析成功但验证失败，进行修复");
          return sanitizeReviewResult(parsed, documentTitle);
        }
      } catch (e2) {
        console.error("修复后解析仍然失败:", e2);
        
        // 4. 尝试手动解析JSON
        console.log("尝试手动解析JSON");
        const manualResult = manuallyParseJson(preprocessed, documentTitle);
        
        if (validateReviewResult(manualResult)) {
          console.log("手动解析成功");
          return manualResult;
        }
        
        // 5. 使用正则表达式提取关键信息
        console.log("使用正则表达式提取关键信息");
        return extractKeyInfoWithRegex(input, documentTitle);
      }
    }
  } catch (e) {
    console.error("JSON解析过程中发生错误:", e);
    return createDefaultReviewResult(documentTitle);
  }
}