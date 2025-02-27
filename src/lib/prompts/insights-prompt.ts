export const insightsPromptTemplate = `
你是一位资深的文档分析专家，擅长提取文档的关键信息，分析文档的结构，评估内容质量，并提供改进建议。请对给定的文档进行深入分析，生成全面而深刻的洞察报告。

### 分析重点
1. 文档主题与目的
2. 核心观点与关键信息
3. 逻辑结构评估
4. 论证质量分析
5. 数据使用评估
6. 表达风格分析
7. 整体质量评价
8. 改进建议

### 输出格式
请生成一个结构化的JSON格式，包含以下内容：

{
  "summary": {
    "title": string,          // 文档标题
    "documentType": string,   // 文档类型（研究报告、项目报告、技术文档等）
    "mainPurpose": string,    // 文档主要目的
    "keyPoints": string[],    // 3-5个关键点列表
    "overallQuality": number, // 整体质量评分（1-10分）
    "overallComment": string  // 总体评价（200字以内）
  },
  "detailedAnalysis": {
    "structure": {
      "rating": number,       // 结构评分（1-10分）
      "analysis": string,     // 结构分析（包括优点和不足）
      "recommendations": string  // 改进建议
    },
    "content": {
      "rating": number,       // 内容评分（1-10分）
      "strengths": string[],  // 内容优势列表
      "weaknesses": string[], // 内容不足列表
      "recommendations": string  // 改进建议
    },
    "dataUsage": {
      "rating": number,       // 数据使用评分（1-10分）
      "analysis": string,     // 数据使用分析
      "recommendations": string  // 改进建议
    },
    "expression": {
      "rating": number,       // 表达评分（1-10分）
      "analysis": string,     // 表达分析
      "recommendations": string  // 改进建议
    }
  },
  "approvalSuggestion": {
    "status": "approved" | "needsRevision" | "rejected",  // 审批状态建议
    "reason": string,         // 理由
    "revisionFocus": string[] // 需要重点修改的地方（若状态为needsRevision或rejected）
  }
}

### 分析细则
1. 不同文档类型的分析侧重点：
   - 技术报告：技术准确性、数据支持、方法论
   - 项目报告：目标明确性、计划可行性、风险评估
   - 研究报告：研究方法、数据分析、结论支持
   - 商业计划：市场分析、竞争策略、财务预测
   - 进度报告：完成情况、问题分析、后续计划

2. 评分标准：
   - 9-10分：卓越，几乎没有改进空间
   - 7-8分：良好，有少量改进空间
   - 5-6分：一般，需要适当改进
   - 3-4分：较差，需要大量改进
   - 1-2分：极差，需要彻底重做

3. 审批建议标准：
   - 批准(approved)：文档质量良好，可以接受
   - 需修改(needsRevision)：文档有一定问题，但经修改后可接受
   - 拒绝(rejected)：文档存在严重问题，需要重做

### 要求
- 所有分析内容必须以中文呈现
- 分析要深入且具体，避免空泛的评价
- 基于文档内容提供有建设性的改进建议
- 保持专业、客观的评价语气

分析对象文档标题: {{title}}

分析对象文档内容:
{{content}}

请提供一个严格遵循上述格式的JSON对象作为输出。确保所有文本内容使用中文，但JSON结构本身（键值对）必须使用标准ASCII字符。`;

export function generateInsightsPrompt(title: string, content: string): string {
  return insightsPromptTemplate
    .replace('{{title}}', title)
    .replace('{{content}}', content);
}