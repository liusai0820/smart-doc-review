export const insightsPromptTemplate = `
你是一位资深的文档分析专家，擅长提取文档的关键信息，分析文档的结构，评估内容质量，并提供改进建议。请对给定的文档进行深入分析，生成全面而深刻的洞察报告。

请注意：你的回复必须是一个有效的 JSON 字符串。所有字符串值都必须用双引号包裹，不能使用单引号。所有字段必须完全按照下面的格式提供，不能添加或省略任何字段。数字字段必须是数值而不是字符串。

请严格按照以下 JSON 结构输出分析结果（注意：这是一个 JSON 模板，你需要将 <> 中的内容替换为实际值）：

{
  "summary": {
    "title": "<文档标题>",
    "documentType": "<文档类型>",
    "mainPurpose": "<文档主要目的>",
    "keyPoints": [
      "<关键点1>",
      "<关键点2>",
      "<关键点3>"
    ],
    "overallQuality": 7,
    "overallComment": "<总体评价>"
  },
  "detailedAnalysis": {
    "structure": {
      "rating": 7,
      "analysis": "<结构分析>",
      "recommendations": "<改进建议>"
    },
    "content": {
      "rating": 7,
      "strengths": [
        "<优势1>",
        "<优势2>"
      ],
      "weaknesses": [
        "<不足1>",
        "<不足2>"
      ],
      "recommendations": "<改进建议>"
    },
    "dataUsage": {
      "rating": 7,
      "analysis": "<数据使用分析>",
      "recommendations": "<改进建议>"
    },
    "expression": {
      "rating": 7,
      "analysis": "<表达分析>",
      "recommendations": "<改进建议>"
    }
  },
  "approvalSuggestion": {
    "status": "needsRevision",
    "reason": "<原因说明>",
    "revisionFocus": [
      "<重点1>",
      "<重点2>"
    ]
  }
}

请基于以下分析重点进行评估：

1. 文档主题与目的
   - 明确文档的核心主题和写作目的
   - 评估主题的重要性和相关性
   - 分析目标受众的适配度

2. 核心观点与关键信息
   - 提取文档中的主要论点和关键信息
   - 评估论点的创新性和价值
   - 分析信息的完整性和准确性

3. 逻辑结构评估
   - 分析文档的整体框架
   - 评估段落间的逻辑连贯性
   - 检查论证过程的完整性

4. 论证质量分析
   - 评估论据的充分性和相关性
   - 分析推理过程的严密性
   - 检查结论的可靠性

5. 数据使用评估
   - 评估数据的准确性和时效性
   - 分析数据的展示方式
   - 检查数据解释的合理性

6. 表达风格分析
   - 评估语言的专业性和规范性
   - 分析表达的清晰度和简洁性
   - 检查术语使用的一致性

评分标准：
- 9-10分：卓越，内容完整、逻辑严密、论证充分、表达规范
- 7-8分：良好，整体质量好，个别方面需要小幅改进
- 5-6分：一般，基本要素齐全，但多个方面需要改进
- 3-4分：较差，存在明显缺陷，需要大幅改进
- 1-2分：极差，基本要素缺失，需要彻底重做

审批状态说明：
- "approved"：文档质量达到要求，可以直接使用
- "needsRevision"：存在可修改的问题，修改后可用
- "rejected"：存在根本性问题，需要重新撰写

### 分析对象
文档标题：{{title}}

文档内容：
<document_content>
{{content}}
</document_content>

请确保：
1. 所有文本内容使用中文（除专业术语外）
2. 所有分析要有理有据，避免主观臆测
3. 所有建议要具体可行，便于作者改进
4. JSON 格式必须完全正确，所有字符串值使用双引号，不能使用单引号
5. 数字必须是数值类型，不能用字符串表示
6. status 字段必须是 "approved"、"needsRevision" 或 "rejected" 之一`;

export function generateInsightsPrompt(title: string, content: string): string {
  // 验证输入
  if (!content || content.trim() === '') {
    console.error('文档内容为空，无法生成分析提示词');
    throw new Error('文档内容不能为空');
  }

  // 记录输入信息
  console.log('生成文档分析提示词:', {
    title,
    contentLength: content.length,
    contentPreview: content.substring(0, 100)
  });

  // 替换模板中的占位符
  const prompt = insightsPromptTemplate
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