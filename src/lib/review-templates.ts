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
        5. 结论是否有充分证据支持
        6. 引用格式是否规范
      `,
      focusAreas: ["研究问题", "方法论", "数据分析", "论证逻辑", "引用规范"]
    }
  ];
  
  /**
   * 根据文档内容自动推荐最合适的模板
   * @param documentTitle 文档标题
   * @param documentContent 文档内容
   * @returns 推荐的模板ID
   */
  export function recommendTemplate(documentTitle: string, documentContent: string): string {
    const titleAndContent = (documentTitle + " " + documentContent).toLowerCase();
    
    // 为每个模板计算匹配得分
    const templateScores = reviewTemplates.map(template => {
      let score = 0;
      
      // 1. 标题匹配权重 (最高优先级)
      if (documentTitle.toLowerCase().includes(template.name.toLowerCase())) {
        score += 10;
      }
      
      // 2. 关键领域匹配
      template.focusAreas.forEach(area => {
        const regex = new RegExp(area, 'i');
        if (regex.test(titleAndContent)) {
          score += 3;
        }
      });
      
      // 3. 类别特定关键词匹配
      const categoryKeywords: Record<string, string[]> = {
        "财务": ["财务", "收入", "利润", "预算", "成本", "财报", "balance", "income", "profit", "budget", "revenue", "expense"],
        "技术": ["技术", "架构", "api", "接口", "服务器", "数据库", "framework", "系统设计", "algorithm", "code", "开发", "测试"],
        "项目": ["项目", "提案", "proposal", "可行性", "立项", "项目计划", "project", "milestone", "进度", "风险", "资源"],
        "市场": ["市场", "用户", "竞品", "调研", "分析", "market", "competitor", "research", "用户群", "营销", "销售"],
        "法律": ["合同", "协议", "法律", "条款", "授权", "合规", "legal", "contract", "agreement", "compliance", "rights"],
        "学术": ["研究", "论文", "实验", "methodology", "literature", "研究方法", "文献", "引用", "citation", "实验", "数据"]
      };
      
      const categoryWords = categoryKeywords[template.category];
      if (categoryWords) {
        categoryWords.forEach(word => {
          const regex = new RegExp(word, 'i');
          if (regex.test(titleAndContent)) {
            score += 2;
          }
        });
      }
      
      // 4. 内容长度和复杂度分析
      const contentWords = documentContent.split(/\s+/).length;
      if (template.id === "academic-paper" && contentWords > 2000) {
        score += 2; // 长文档更可能是学术论文
      }
      
      // 5. 文档结构特征分析
      if (template.id === "technical-spec" && /```|\{|\}|function|class|interface/i.test(documentContent)) {
        score += 2; // 包含代码块或技术术语的更可能是技术文档
      }
      
      // 6. 数值密度分析
      const numberDensity = (documentContent.match(/\d+(\.\d+)?/g) || []).length / contentWords;
      if (template.id === "financial-report" && numberDensity > 0.1) {
        score += 2; // 高数值密度更可能是财务报告
      }
      
      return { id: template.id, score };
    });
    
    // 按得分排序并返回最佳匹配
    const bestMatch = templateScores.sort((a, b) => b.score - a.score)[0];
    
    // 如果最高得分过低，返回通用模板
    return bestMatch.score >= 3 ? bestMatch.id : "general-report";
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
    
    console.log('生成提示词:', {
      templateId,
      documentTitle,
      contentLength: documentContent?.length || 0,
      contentPreview: documentContent?.substring(0, 50)
    });
    
    // 验证输入
    if (!documentContent || documentContent.trim().length === 0) {
      console.error('文档内容为空');
      throw new Error('文档内容不能为空');
    }

    const prompt = `
您是一位专业的文档审阅专家，现在需要帮助审阅一份文档。请严格按照指定的JSON格式返回审阅结果。

文档类型: ${template.name}
文档标题: ${documentTitle}

审阅指南:
${template.instructions}

重点关注领域:
${template.focusAreas.map(area => `- ${area}`).join('\n')}

请分析以下文档内容，指出需要修改、完善或提升的地方。

----------------
文档内容:
${documentContent}
----------------

请严格按照以下JSON格式返回审阅结果：

{
  "documentInfo": {
    "title": "文档标题",
    "overview": "文档总体评价（300字以内）",
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
          "originalText": "需要修改的文本",
          "newText": "建议修改为的文本",
          "explanation": "修改理由",
          "severity": "error|warning|suggestion",
          "category": "修改类别"
        }
      ]
    }
  ]
}`;

    // 验证生成的提示词
    console.log('提示词生成结果:', {
      promptLength: prompt.length,
      contentIncluded: prompt.includes(documentContent.substring(0, 50)),
      contentPosition: prompt.indexOf(documentContent)
    });

    return prompt;
  }
  
  /**
   * 获取按类别分组的模板
   */
  export function getTemplatesByCategory(): Record<string, ReviewTemplate[]> {
    return reviewTemplates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as Record<string, ReviewTemplate[]>);
  }