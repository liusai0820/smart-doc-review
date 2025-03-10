// src/lib/prompts/enhanced-review-prompt.ts

/**
 * 生成增强的审阅提示词模板
 * 修复：确保文档内容被正确包含
 */
export const enhancedReviewPromptTemplate = `
你是一位资深的专业报告审阅专家，擅长审核技术报告、研究报告、项目报告和商业计划书等各类专业文档。请对给定文档进行全面分析，并输出结构化的JSON格式审阅结果。

### 输出格式要求（极其重要）
你必须严格按照以下JSON格式返回结果。这是一个强制性要求，任何格式错误都会导致解析失败：

1. 必须使用标准JSON格式
2. 所有属性名和字符串值必须使用英文双引号("")，禁止使用单引号(')
3. 数值类型不能带引号
4. 布尔值必须是 true 或 false（不带引号）
5. null 值必须是 null（不带引号）
6. 对象内的属性必须用逗号分隔
7. 最后一个属性后不能有逗号
8. 不允许使用任何注释
9. 不允许使用任何特殊字符（如制表符、换行符等）
10. 所有字符串值中的引号必须正确转义

### 示例JSON格式（请严格遵循）：
{
  "documentInfo": {
    "title": "文档标题",
    "overview": "文档总体评价",
    "totalIssues": {
      "errors": 0,
      "warnings": 0,
      "suggestions": 0
    }
  },
  "reviewContent": [
    {
      "id": "1",
      "originalText": "原文内容",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 0
          },
          "originalText": "需要修改的文本",
          "newText": "建议修改为的文本",
          "explanation": "修改理由",
          "severity": "error",
          "category": "修改类别"
        }
      ]
    }
  ]
}

### 严格的字段要求
- severity 字段只能是以下三个值之一：
  * "error"
  * "warning"
  * "suggestion"
- type 字段只能是以下三个值之一：
  * "replace"
  * "insert"
  * "delete"
- position 中的 start 和 end 必须是非负整数
- 所有必需字段都不能省略
- 不允许添加示例中未列出的字段

### 审阅重点
1. 技术准确性：技术术语使用是否准确，数据引用是否正确，分析方法是否恰当
2. 数据一致性：报告中的数据、百分比、金额是否前后一致，是否存在错误计算
3. 逻辑结构：论证过程是否合理，分析框架是否完整，结论是否有力支持
4. 格式规范：标题层级是否清晰，引用格式是否统一，图表编号是否规范
5. 表达精确性：是否存在模糊表述，是否有违背事实的表达，是否有过度夸张的陈述
6. 语法和拼写：中英文混排格式是否规范，特殊名词大小写是否正确，标点符号使用是否恰当

### 审阅标准
- 错误(error)：必须修改的严重问题，包括数据错误、重大逻辑缺陷、严重格式问题
- 警告(warning)：应当修改的问题，包括不精确的表述、次要逻辑问题、格式不一致
- 建议(suggestion)：可以改进的地方，包括表达优化、结构调整建议

### 精确定位要求（非常重要）
在标识需要修改的内容时，请务必：
1. 仅标记真正需要修改的特定词语、短语或句子，不要标记整段内容
2. 提供精确的position对象，包含需修改内容在原文中的确切起始位置(start)和结束位置(end)
3. 每处修改必须附带明确解释，说明为什么需要修改及如何改进

### 审阅要求
- 所有内容必须用中文表达（除非原文中的专业术语或英文缩写）
- 针对专业领域的错误，必须给出详细且专业的修改建议
- 提供的修改建议要直接可用，而不是泛泛的方向性建议

### 审阅对象信息
文档标题：{{title}}

### 审阅对象内容
<document_content>
{{content}}
</document_content>

### JSON格式检查清单（必须遵守）
在返回结果前，请检查以下几点：
1. 返回的必须是一个有效的JSON字符串，不包含任何其他文本
2. 所有属性名和字符串值必须使用双引号，不能使用单引号
3. 所有对象内的属性之间必须用逗号分隔，最后一个属性后不能有逗号
4. 所有数组元素之间必须用逗号分隔，最后一个元素后不能有逗号
5. position对象中的start和end必须是数值类型，不能是字符串或带引号
6. severity字段必须是"error"、"warning"或"suggestion"之一
7. 不要在JSON中包含任何注释、解释或额外的说明文字
8. 确保所有花括号和方括号正确配对闭合

请直接返回符合上述要求的JSON，不要添加任何前缀说明或后缀解释。`;

/**
 * 生成增强的审阅提示词
 * @param title 文档标题
 * @param content 文档内容
 * @returns 替换了标题和内容的完整提示词
 */
export function generateEnhancedReviewPrompt(title: string, content: string): string {
  // 验证输入
  if (!content || content.trim() === '') {
    console.error('文档内容为空，无法生成有效提示词');
    throw new Error('文档内容不能为空');
  }

  // 记录输入信息
  console.log('生成增强提示词:', {
    title,
    contentLength: content.length,
    contentPreview: content.substring(0, 50)
  });

  // 替换模板中的占位符
  const prompt = enhancedReviewPromptTemplate
    .replace('{{title}}', title)
    .replace('{{content}}', content);

  // 验证生成的提示词
  console.log('提示词生成结果:', {
    promptLength: prompt.length,
    contentIncluded: prompt.includes(content.substring(0, 50)),
    contentPosition: prompt.indexOf(content)
  });

  return prompt;
}