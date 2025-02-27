import { ReviewResult } from "./openrouter-api";

/**
 * 改进的健壮JSON解析函数，处理各种格式不规范的JSON字符串
 * @param jsonString 原始JSON字符串
 * @returns 解析后的ReviewResult对象
 */
export function parseRobustJSON(jsonString: string): ReviewResult {
  try {
    // 首先尝试直接解析，可能适用于格式良好的JSON
    try {
      const result = JSON.parse(jsonString);
      // 验证解析结果是否符合预期结构
      if (result && typeof result === 'object' && 'documentInfo' in result && 'reviewContent' in result) {
        return result as ReviewResult;
      }
    } catch (e) {
      console.log("直接解析JSON失败，尝试预处理");
    }
    
    // 第一阶段：基本清理，移除格式干扰项
    let cleanedJson = jsonString
      // 删除可能的Markdown代码块标记
      .replace(/```(?:json)?\s*|\s*```/g, '')
      // 删除空行和额外的空白
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // 第二阶段：提取JSON对象（处理可能的前后缀文本）
    let jsonObject = cleanedJson;
    const jsonMatch = cleanedJson.match(/{[\s\S]*}/);
    if (jsonMatch) {
      jsonObject = jsonMatch[0];
    }
    
    // 第三阶段：修复常见的JSON语法错误
    // 1. 确保属性名有引号
    jsonObject = jsonObject.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
    
    // 2. 修复不正确的逗号（缺少或多余）
    jsonObject = jsonObject
      // 修复对象和数组末尾多余的逗号
      .replace(/,(\s*[}\]])/g, '$1')
      // 修复属性之间缺少的逗号
      .replace(/}(\s*){/g, '},{')
      .replace(/](\s*)\[/g, '],[')
      // 修复属性值后面缺少逗号的情况
      .replace(/"([^"]+)"\s*"([^"]+)"/g, '"$1","$2"')
      // 修复属性名和值之间缺少冒号的情况
      .replace(/"([^"]+)"\s+(["{[])/g, '"$1": $2');
    
    // 3. 修复引号问题
    jsonObject = jsonObject
      // 修复中文引号
      .replace(/["【】「」『』]/g, '"')
      // 修复未转义的引号
      .replace(/"([^"]*?)\\?"([^"]*?)"/g, '"$1\\"$2"')
      // 修复属性名中的未转义引号
      .replace(/"([^"]*?)":/g, function(match, p1) {
        return '"' + p1.replace(/"/g, '\\"') + '":';
      });
    
    // 4. 修复特殊问题
    jsonObject = jsonObject
      // 修复布尔值和null值的引号问题
      .replace(/"(true|false|null)"/gi, '$1')
      // 修复数字的引号问题（保留小数点和负号）
      .replace(/"(-?\d+(\.\d+)?)"/g, '$1')
      // 处理可能导致解析错误的位置378附近的问题
      .replace(/(\w+)(\s*):(\s*)}/g, '$1$2: null}');
    
    // 第四阶段：尝试解析修复后的JSON
    try {
      console.log("尝试解析修复后的JSON");
      return JSON.parse(jsonObject) as ReviewResult;
    } catch (parseError) {
      console.error("修复后解析仍然失败:", parseError);
      
      // 第五阶段：最后尝试，使用更激进的修复方法
      try {
        // 修复JSON对象结构
        const fixBraces = (json: string): string => {
          // 计算左右花括号的数量
          const leftCount = (json.match(/{/g) || []).length;
          const rightCount = (json.match(/}/g) || []).length;
          
          // 添加缺少的右花括号
          if (leftCount > rightCount) {
            return json + '}'.repeat(leftCount - rightCount);
          }
          // 添加缺少的左花括号
          else if (rightCount > leftCount) {
            return '{'.repeat(rightCount - leftCount) + json;
          }
          return json;
        };
        
        // 修复JSON数组结构
        const fixBrackets = (json: string): string => {
          // 计算左右方括号的数量
          const leftCount = (json.match(/\[/g) || []).length;
          const rightCount = (json.match(/\]/g) || []).length;
          
          // 添加缺少的右方括号
          if (leftCount > rightCount) {
            return json + ']'.repeat(leftCount - rightCount);
          }
          // 添加缺少的左方括号
          else if (rightCount > leftCount) {
            return '['.repeat(rightCount - leftCount) + json;
          }
          return json;
        };
        
        // 应用更激进的修复
        let lastResortJson = fixBraces(fixBrackets(jsonObject));
        
        // 尝试修复position 378附近的问题
        if ((parseError as Error).message.includes('position 378')) {
          // 查找位置378附近的内容
          const problematicPart = jsonObject.substring(370, 390);
          console.log("问题区域内容:", problematicPart);
          
          // 尝试修复这个区域
          lastResortJson = jsonObject.substring(0, 375) + 
                         jsonObject.substring(375).replace(/[^\x20-\x7E]/g, '');
        }
        
        return JSON.parse(lastResortJson) as ReviewResult;
      } catch (lastError) {
        console.error("所有修复尝试均失败:", lastError);
        // 返回默认的空结果
        return createDefaultResult();
      }
    }
  } catch (error) {
    console.error("JSON处理过程中出现未预期的错误:", error);
    return createDefaultResult();
  }
}

/**
 * 创建默认结果
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