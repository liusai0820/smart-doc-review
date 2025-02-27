// src/lib/review-templates.ts

export interface ReviewTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  instructions: string;
  focusAreas: string[];
}

// 预定义的文档审阅模板
export const reviewTemplates: ReviewTemplate[] = [
  {
    id: "general-report",
    name: "通用报告审阅",
    description: "适用于大多数一般性工作报告、总结报告等",
    category: "通用",
    instructions: `
      审阅此报告，重点关注以下方面：
      1. 逻辑结构是否清晰
      2. 数据引用是否准确
      3. 论证是否充分
      4. 表达是否准确、简洁
      5. 检查错别字、语法错误
    `,
    focusAreas: ["逻辑结构", "数据准确性", "语言表达", "格式规范"]
  },
  {
    id: "project-proposal",
    name: "项目提案审阅",
    description: "适用于项目立项、可行性分析等提案类文档",
    category: "项目",
    instructions: `
      审阅此项目提案，重点关注以下方面：
      1. 项目目标是否明确、具体、可衡量
      2. 项目背景分析是否充分
      3. 资源需求和成本估算是否合理
      4. 进度计划是否可行
      5. 风险分析是否全面
      6. ROI分析是否准确
    `,
    focusAreas: ["项目目标", "可行性", "资源规划", "风险评估", "投资回报"]
  },
  {
    id: "financial-report",
    name: "财务报告审阅",
    description: "适用于财务报表、预算报告等财务类文档",
    category: "财务",
    instructions: `
      审阅此财务报告，重点关注以下方面：
      1. 数据计算是否准确
      2. 财务指标使用是否恰当
      3. 财务分析是否深入
      4. 结论是否有数据支持
      5. 预测和假设是否合理
    `,
    focusAreas: ["数据准确性", "财务指标", "合规性", "预测合理性"]
  },
  {
    id: "technical-spec",
    name: "技术规格审阅",
    description: "适用于技术方案、API文档、架构设计等技术类文档",
    category: "技术",
    instructions: `
      审阅此技术文档，重点关注以下方面：
      1. 技术描述是否准确、完整
      2. 技术选型是否合理
      3. 架构设计是否清晰
      4. 接口定义是否规范
      5. 安全性考虑是否充分
      6. 性能需求是否明确
    `,
    focusAreas: ["技术准确性", "架构设计", "接口规范", "安全性", "性能"]
  },
  {
    id: "market-research",
    name: "市场调研审阅",
    description: "适用于市场分析、竞品分析、用户研究等市场类文档",
    category: "市场",
    instructions: `
      审阅此市场研究文档，重点关注以下方面：
      1. 研究方法是否科学
      2. 样本选择是否具有代表性
      3. 数据收集和分析是否客观
      4. 竞品分析是否全面、公正
      5. 市场趋势判断是否有依据
      6. 结论和建议是否基于数据
    `,
    focusAreas: ["研究方法", "数据可靠性", "竞品分析", "趋势判断", "actionable洞察"]
  },
  {
    id: "legal-doc",
    name: "法律文件审阅",
    description: "适用于合同、协议、法律意见书等法律类文档",
    category: "法律",
    instructions: `
      审阅此法律文件，重点关注以下方面：
      1. 条款表述是否准确、明确
      2. 权责划分是否清晰
      3. 术语使用是否一致
      4. 是否有模糊或歧义表达
      5. 法律风险点识别
    `,
    focusAreas: ["术语准确性", "权责划分", "一致性", "法律风险", "合规性"]
  },
  {
    id: "academic-paper",
    name: "学术论文审阅",
    description: "适用于研究论文、学术报告等学术类文档",
    category: "学术",
    instructions: `
      审阅此学术论文，重点关注以下方面：
      1. 研究问题是否明确
      2. 文献综述是否全面
      3. 研究方法是否合适
      4. 数据分析是否恰当
      5. 结论是否