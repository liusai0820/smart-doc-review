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
  // === 通用类 ===
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
  
  // === 公文类 ===
  {
    id: "official-document",
    name: "公文通用审阅",
    description: "适用于各类公文的基础审阅",
    category: "公文",
    instructions: `
      审阅此公文，重点关注以下方面：
      1. 是否符合公文格式规范（标题、主送机关、发文字号、正文、落款等）
      2. 语言是否符合公文要求（庄重、简明、准确）
      3. 内容是否符合政策规定
      4. 行文是否规范（对上称"请"，对下称"命令"等）
      5. 公文层级、称谓是否准确
    `,
    focusAreas: ["格式规范", "语言风格", "政策符合性", "行文规范"]
  },
  {
    id: "official-notice",
    name: "通知/通报审阅",
    description: "适用于行政机关发布的通知、通报类公文",
    category: "公文",
    instructions: `
      审阅此通知/通报，重点关注以下方面：
      1. 标题是否准确反映通知/通报内容
      2. 是否明确说明通知事项或通报内容
      3. 是否明确了执行时间、范围和要求
      4. 是否存在逻辑矛盾或表述不清
      5. 结尾是否有明确的要求或希望表述
    `,
    focusAreas: ["内容完整性", "表述准确性", "时效性", "可操作性"]
  },
  {
    id: "official-request",
    name: "请示文审阅",
    description: "适用于向上级机关请求指示或批准的请示公文",
    category: "公文",
    instructions: `
      审阅此请示文，重点关注以下方面：
      1. 是否明确表明请示事项
      2. 是否有充分理由说明请示必要性
      3. 是否阐述了前期工作和已有成果
      4. 是否明确提出具体请求
      5. 语气是否恰当（请示应使用商洽语气）
    `,
    focusAreas: ["请示事项明确性", "理由充分性", "表述精准性", "语气适当性"]
  },
  {
    id: "official-reply",
    name: "批复文审阅",
    description: "适用于对请示事项作出答复的批复公文",
    category: "公文",
    instructions: `
      审阅此批复文，重点关注以下方面：
      1. 是否明确说明批复依据（对应的请示文）
      2. 是否明确表明同意或不同意的态度
      3. 是否给出具体的意见和理由
      4. 语气是否得当（批复应使用指示性语气）
      5. 是否有明确的执行要求
    `,
    focusAreas: ["批复依据", "态度明确性", "理由充分性", "语气适当性"]
  },
  {
    id: "meeting-minutes",
    name: "会议纪要审阅",
    description: "适用于记录会议内容和决定的会议纪要",
    category: "公文",
    instructions: `
      审阅此会议纪要，重点关注以下方面：
      1. 是否完整记录会议基本信息（时间、地点、主持人、参会人员）
      2. 是否明确会议议程和内容
      3. 是否准确记录会议决定和分工
      4. 是否明确后续工作安排和时间要求
      5. 是否使用客观、准确的语言记录
    `,
    focusAreas: ["信息完整性", "决定准确性", "分工明确性", "后续安排"]
  },
  {
    id: "work-plan",
    name: "工作计划审阅",
    description: "适用于政府部门的工作计划文件",
    category: "公文",
    instructions: `
      审阅此工作计划，重点关注以下方面：
      1. 是否明确工作目标和任务
      2. 是否有具体的工作措施和方法
      3. 是否有明确的时间节点和进度安排
      4. 任务分工是否明确
      5. 是否考虑了可能的困难和应对措施
    `,
    focusAreas: ["目标明确性", "措施具体性", "时间进度", "任务分工", "风险评估"]
  },
  {
    id: "work-summary",
    name: "工作总结审阅",
    description: "适用于政府部门的工作总结报告",
    category: "公文",
    instructions: `
      审阅此工作总结，重点关注以下方面：
      1. 是否客观反映工作成果和存在问题
      2. 数据和事实是否准确
      3. 是否分析了经验教训
      4. 是否提出了今后工作建议
      5. 是否有针对性地提出意见和建议
    `,
    focusAreas: ["客观性", "数据准确性", "经验总结", "问题分析", "建议可行性"]
  },
  
  // === 商业/项目类 ===
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
  
  // === 法律/学术类 ===
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
      5. 结论是否有充分证据支持
      6. 引用格式是否规范
    `,
    focusAreas: ["研究问题", "方法论", "数据分析", "论证逻辑", "引用规范"]
  },
  
  // === 党政机关专用 ===
  {
    id: "party-document",
    name: "党内文件审阅",
    description: "适用于党内各类文件的审阅",
    category: "党政文件",
    instructions: `
      审阅此党内文件，重点关注以下方面：
      1. 是否符合党内文件格式规范
      2. 政治立场是否正确
      3. 表述是否符合党的路线方针政策
      4. 引用上级文件、讲话是否准确
      5. 是否存在敏感或不当表述
    `,
    focusAreas: ["政治正确性", "路线方针符合性", "表述规范性", "引用准确性"]
  },
  {
    id: "policy-document",
    name: "政策文件审阅",
    description: "适用于政府政策文件的审阅",
    category: "党政文件",
    instructions: `
      审阅此政策文件，重点关注以下方面：
      1. 政策依据是否明确
      2. 政策内容是否清晰、具体
      3. 是否符合上位法规定
      4. 政策执行主体和对象是否明确
      5. 政策措施是否具有可操作性
    `,
    focusAreas: ["政策依据", "内容具体性", "合法性", "可操作性"]
  },
  {
    id: "speech-script",
    name: "领导讲话稿审阅",
    description: "适用于各级领导讲话稿的审阅",
    category: "党政文件",
    instructions: `
      审阅此讲话稿，重点关注以下方面：
      1. 政治立场是否正确
      2. 语言风格是否符合身份
      3. 内容是否紧扣主题
      4. 数据引用是否准确
      5. 是否有针对性的工作部署或要求
    `,
    focusAreas: ["政治立场", "语言风格", "主题契合度", "数据准确性", "工作部署"]
  },
  {
    id: "emergency-plan",
    name: "应急预案审阅",
    description: "适用于各类突发事件应急预案的审阅",
    category: "党政文件",
    instructions: `
      审阅此应急预案，重点关注以下方面：
      1. 预案启动条件是否明确
      2. 应急组织架构和职责是否清晰
      3. 应急响应程序是否完整
      4. 保障措施是否充分
      5. 各部门协调机制是否健全
    `,
    focusAreas: ["启动条件", "组织架构", "响应程序", "保障措施", "协调机制"]
  }
];

/**
 * 根据文档内容自动推荐最合适的模板
 * @param documentTitle 文档标题
 * @param documentContent 文档内容
 * @returns 推荐的模板ID
 */
export function recommendTemplate(documentTitle: string, documentContent: string): string {
  // 处理标题和内容，转为小写便于匹配
  const titleAndContent = (documentTitle + " " + documentContent).toLowerCase();
  
  // === 公文类识别 ===
  // 通知/通报类
  if (/关于|通知|通报|公告|函|文件/i.test(titleAndContent)) {
    return "official-notice";
  }
  
  // 请示类
  if (/请示|申请|请批|请审批|请予批准/i.test(titleAndContent)) {
    return "official-request";
  }
  
  // 批复类
  if (/批复|答复|复函|关于.*的回复/i.test(titleAndContent)) {
    return "official-reply";
  }
  
  // 会议纪要
  if (/会议纪要|纪要|会议记录|会议决定|会议决议/i.test(titleAndContent)) {
    return "meeting-minutes";
  }
  
  // 工作计划
  if (/工作计划|年度计划|工作方案|实施方案|行动计划/i.test(titleAndContent)) {
    return "work-plan";
  }
  
  // 工作总结
  if (/工作总结|年度总结|工作报告|总结报告/i.test(titleAndContent)) {
    return "work-summary";
  }
  
  // 党内文件
  if (/党|党委|党组|党支部|中共|政治|思想|意识形态/i.test(titleAndContent)) {
    return "party-document";
  }
  
  // 政策文件
  if (/政策|条例|条款|规定|规划|办法|细则|实施意见/i.test(titleAndContent)) {
    return "policy-document";
  }
  
  // 领导讲话
  if (/讲话|发言|致辞|报告|演讲/i.test(titleAndContent)) {
    return "speech-script";
  }
  
  // 应急预案
  if (/应急|预案|突发|处置|应对|防范|响应/i.test(titleAndContent)) {
    return "emergency-plan";
  }
  
  // === 商业/项目类识别 ===
  // 财务类
  if (/财务|收入|利润|预算|成本|财报|balance|income|profit|budget/i.test(titleAndContent)) {
    return "financial-report";
  }
  
  // 技术类
  if (/技术|架构|api|接口|服务器|数据库|framework|技术选型|系统设计/i.test(titleAndContent)) {
    return "technical-spec";
  }
  
  // 项目类
  if (/项目|提案|proposal|可行性|立项|项目计划|project plan|milestone/i.test(titleAndContent)) {
    return "project-proposal";
  }
  
  // 市场类
  if (/市场|用户|竞品|调研|分析|market|competitor|user research|用户群/i.test(titleAndContent)) {
    return "market-research";
  }
  
  // === 法律/学术类识别 ===
  // 法律类
  if (/合同|协议|法律|条款|授权|合规|legal|contract|agreement|compliance/i.test(titleAndContent)) {
    return "legal-doc";
  }
  
  // 学术类
  if (/研究|论文|实验|methodology|literature|研究方法|文献|引用|citation/i.test(titleAndContent)) {
    return "academic-paper";
  }
  
  // 如果没有匹配到专门的类型，先判断是否可能是公文
  if (/[\(（].*?[\)）]|发文字号|主送|抄送|印发|批准|签发人/i.test(titleAndContent)) {
    return "official-document";
  }
  
  // 默认返回通用模板
  return "general-report";
}

/**
 * 获取指定ID的模板，如果不存在则返回通用模板
 */
export function getTemplateById(templateId: string): ReviewTemplate {
  const template = reviewTemplates.find(t => t.id === templateId);
  return template || reviewTemplates[0]; // 默认返回第一个（通用模板）
}

/**
 * 根据模板ID生成审阅提示词
 */
export function generatePromptFromTemplate(templateId: string, documentTitle: string, documentContent: string): string {
  const template = getTemplateById(templateId);
  
  // 根据模板类型组装特定的审阅要求
  let specificRequirements = "";
  
  // 判断是否为公文类模板
  if (template.category === "公文" || template.category === "党政文件") {
    specificRequirements = `
    ### 公文审阅特别要求
    1. 严格审查公文格式是否符合《党政机关公文处理工作条例》要求
    2. 检查行文规范，上行文、下行文、平行文的语气和措辞是否恰当
    3. 检查称谓使用，是否正确使用全称或规范简称
    4. 检查公文结构是否完整，包括标题、主送机关、正文、结尾、落款等
    5. 检查文件密级、紧急程度、印发份数等要素是否规范
    6. 特别注意政治敏感性，确保表述符合当前政策导向
    7. 关注公文表述的规范性和准确性，避免模糊不清的表达
    
    ${template.instructions}
    `;
  } else if (template.category === "财务") {
    specificRequirements = `
    ### 财务文档审阅特别要求
    1. 严格核对所有数字和计算结果的准确性
    2. 确保财务术语使用正确，符合会计准则
    3. 检查财务数据的一致性，不同部分的数据是否匹配
    4. 审核财务比率和指标的计算方法是否正确
    5. 关注财务预测的合理性和依据
    
    ${template.instructions}
    `;
  } else if (template.category === "技术") {
    specificRequirements = `
    ### 技术文档审阅特别要求
    1. 确保技术术语使用准确，概念解释清晰
    2. 检查技术方案的可行性和合理性
    3. 审核技术规格和参数的准确性
    4. 关注安全性、可扩展性、性能等关键技术指标
    5. 检查代码示例（如有）的正确性和规范性
    
    ${template.instructions}
    `;
  } else if (template.category === "法律") {
    specificRequirements = `
    ### 法律文件审阅特别要求
    1. 严格审查法律术语使用的准确性和一致性
    2. 检查条款之间是否存在矛盾或冲突
    3. 关注权利义务规定是否明确、具体
    4. 审核是否符合现行法律法规
    5. 识别潜在的法律风险点和漏洞
    
    ${template.instructions}
    `;
  } else if (template.category === "学术") {
    specificRequirements = `
    ### 学术文档审阅特别要求
    1. 检查研究方法的科学性和合理性
    2. 审核数据分析的准确性和有效性
    3. 确保引用和参考文献的规范性和完整性
    4. 关注论证逻辑的严密性
    5. 检查研究结论是否有充分的数据支持
    
    ${template.instructions}
    `;
  } else {
    specificRequirements = template.instructions;
  }
  
  return `
您是一位经验丰富的专业文档审阅专家，现在需要帮助审阅一份文档。请严格按照指定的JSON格式返回审阅结果。

文档类型: ${template.name}
文档标题: ${documentTitle}

审阅重点领域:
${template.focusAreas.map(area => `- ${area}`).join('\n')}

审阅指南:
${specificRequirements}

请分析以下文档内容，指出需要修改、完善或提升的地方。请特别注意以下文档类型的专业要求和规范。

文档内容:
---
${documentContent}
---

请严格按照以下JSON格式返回审阅结果：

{
  "documentInfo": {
    "title": "文档标题",
    "documentType": "${template.name}",
    "overview": "文档总体评价",
    "totalIssues": {
      "errors": 0,
      "warnings": 0,
      "suggestions": 0
    }
  },
  "reviewContent": [
    {
      "id": "段落ID",
      "originalText": "原文内容",
      "changes": [
        {
          "type": "replace|insert|delete",
          "position": {
            "start": 0,
            "end": 0
          },
          "originalText": "需要修改的原文",
          "newText": "建议修改为",
          "explanation": "修改原因说明",
          "severity": "error|warning|suggestion",
          "category": "format|content|logic|language|policy|utility"
        }
      ]
    }
  ]
}

注意事项：
1. 严格遵守JSON格式，确保所有字符串都用双引号
2. 所有字段都必须提供，不要省略任何字段
3. severity只能是"error"、"warning"或"suggestion"之一
4. type只能是"replace"、"insert"或"delete"之一
5. category只能是"format"、"content"、"logic"、"language"、"policy"、"utility"之一
6. position中的start和end必须是数字
7. 数组可以为空，但不能省略
8. 不要在JSON中添加注释或其他非JSON内容
9. 确保所有文本内容使用中文，但JSON结构本身必须使用标准ASCII字符
`;
}

export function getTemplatesByCategory(): Record<string, ReviewTemplate[]> {
  return reviewTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, ReviewTemplate[]>);
}