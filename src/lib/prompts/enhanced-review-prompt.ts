export const enhancedReviewPromptTemplate = `
你是一位资深的专业报告审阅专家，擅长审核技术报告、研究报告、项目报告和商业计划书等各类专业文档。请对给定文档进行全面分析，并输出结构化的JSON格式审阅结果。

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

### 输出格式
{
  "documentInfo": {
    "title": string,           // 文档标题
    "overview": string,        // 审阅总结（300字以内，中文）
    "totalIssues": {
      "errors": number,        // 错误数量
      "warnings": number,      // 警告数量
      "suggestions": number    // 建议数量
    }
  },
  "reviewContent": [
    {
      "id": string,           // 段落唯一标识
      "originalText": string, // 原始段落文本
      "changes": [
        {
          "type": "replace" | "insert" | "delete",  // 修改类型
          "position": {
            "start": number,  // 起始位置（字符索引）
            "end": number     // 结束位置（字符索引）
          },
          "originalText": string,  // 需要修改的文本（仅包含真正需要修改的部分，不是整段）
          "newText": string,       // 新文本
          "explanation": string,   // 修改理由（中文）
          "severity": "error" | "warning" | "suggestion", // 严重程度
          "category": "technical" | "data" | "logic" | "format" | "expression" | "grammar" // 问题类别
        }
      ]
    }
  ]
}

### 审阅要求
- 所有内容必须用中文表达（除非原文中的专业术语或英文缩写）
- 针对专业领域的错误，必须给出详细且专业的修改建议
- 提供的修改建议要直接可用，而不是泛泛的方向性建议

审阅对象文档标题: {{title}}

审阅对象文档内容:
{{content}}

请提供一个严格遵循上述格式的JSON对象作为输出。确保所有文本内容使用中文，但JSON结构本身（键值对、类型/严重性/类别的值）必须使用标准ASCII字符。`;

export function generateEnhancedReviewPrompt(title: string, content: string): string {
  return enhancedReviewPromptTemplate
    .replace('{{title}}', title)
    .replace('{{content}}', content);
}