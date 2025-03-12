// src/lib/document-format-guide.ts
// 文档格式规范指南，用于提供各类文档格式的参考标准

/**
 * 公文格式规范指南
 */
export const officialDocumentFormatGuide = {
  /**
   * 公文通用格式要素
   */
  commonElements: [
    {
      name: "份号",
      description: "公文印制份数的顺序号",
      format: "阿拉伯数字并用六角括号[ ]括入",
      example: "[1]",
      required: false
    },
    {
      name: "密级和保密期限",
      description: "公文的秘密等级和保密的期限",
      format: "秘密、机密、绝密",
      example: "秘密★5年",
      required: false
    },
    {
      name: "紧急程度",
      description: "公文送达和办理的时限要求",
      format: "特急、加急",
      example: "特急",
      required: false
    },
    {
      name: "发文机关标志",
      description: "署发文机关全称或规范化简称",
      format: "发文机关全称或者规范化简称",
      example: "国务院",
      required: true
    },
    {
      name: "发文字号",
      description: "由发文机关代字、年份和顺序号组成",
      format: "XXX〔YYYY〕XX号",
      example: "国发〔2020〕15号",
      required: true
    },
    {
      name: "签发人",
      description: "上行文需标注签发人姓名",
      format: "签发人: XXX",
      example: "签发人: 李明",
      required: false
    },
    {
      name: "标题",
      description: "准确概括公文的主要内容",
      format: "发文机关+事由+文种",
      example: "XX部关于加强XX工作的通知",
      required: true
    },
    {
      name: "主送机关",
      description: "公文的主要受理机关",
      format: "逐一列出全称或规范化简称",
      example: "各省、自治区、直辖市人民政府,国务院各部委、各直属机构",
      required: true
    },
    {
      name: "正文",
      description: "公文的主体部分",
      format: "标题下空一行，居左顶格书写",
      example: "现就XX工作有关事项通知如下：",
      required: true
    },
    {
      name: "附件",
      description: "公文的附加说明材料",
      format: "在正文之后",
      example: "附件：XX实施方案",
      required: false
    },
    {
      name: "发文机关署名",
      description: "署发文机关全称",
      format: "居中",
      example: "XX省人民政府",
      required: true
    },
    {
      name: "成文日期",
      description: "公文形成的日期",
      format: "YYYY年XX月XX日",
      example: "2020年6月18日",
      required: true
    },
    {
      name: "印章",
      description: "发文机关公章",
      format: "下压发文机关署名和成文日期",
      example: "",
      required: true
    },
    {
      name: "抄送机关",
      description: "除主送机关外需要执行或知晓公文的其他机关",
      format: "居左空一行顶格书写",
      example: "抄送：XX部，XX局。",
      required: false
    },
    {
      name: "印发机关和日期",
      description: "公文的送印机关和送印日期",
      format: "居左空一行顶格书写",
      example: "XX部办公厅 2020年6月20日印发",
      required: false
    }
  ],

  /**
   * 公文类型及特点
   */
  documentTypes: [
    {
      type: "命令（令）",
      purpose: "公布行政法规、规章，宣布施行重大强制性措施，批准授予和晋升勋章、称号",
      format: "标题称'命令'或'令'；结尾可用'以上命令（或令），请遵照执行'等",
      direction: "下行文"
    },
    {
      type: "决定",
      purpose: "对重要事项作出决策和部署，奖惩有关单位和人员",
      format: "开头多以'经研究，决定...'；结尾可用'特此决定''以上决定，请认真贯彻执行'等",
      direction: "下行文"
    },
    {
      type: "公告",
      purpose: "向国内外宣布重要事项或法定事项",
      format: "标题称'公告'；结尾可用'特此公告'",
      direction: "平行文"
    },
    {
      type: "通告",
      purpose: "宣布重要决定或事项",
      format: "标题称'通告'；结尾可用'特此通告'",
      direction: "平行文"
    },
    {
      type: "通知",
      purpose: "批转下级机关的公文，转发上级机关和不相隶属机关的公文，传达要求下级机关办理和需要有关单位周知或共同执行的事项",
      format: "开头可写'现通知如下...'；结尾可用'特此通知''请遵照执行'等",
      direction: "下行文"
    },
    {
      type: "通报",
      purpose: "表彰先进，批评错误，传达重要精神或情况",
      format: "开头可写'现通报如下...'；结尾可用'特此通报'",
      direction: "平行文或下行文"
    },
    {
      type: "议案",
      purpose: "向上级机关提出会议审议的事项",
      format: "标题写明提出议案的机关；结尾写明提出议案的时间",
      direction: "上行文"
    },
    {
      type: "报告",
      purpose: "向上级机关汇报工作、反映情况，回复上级机关的询问",
      format: "开头写明报告目的；结尾可用'特此报告''以上报告，请批示'等",
      direction: "上行文"
    },
    {
      type: "请示",
      purpose: "向上级机关请求指示、批准",
      format: "一文一事，开头写明请示缘由；结尾写明'请批示''妥否，请批复'等",
      direction: "上行文"
    },
    {
      type: "批复",
      purpose: "答复下级机关请示事项",
      format: "开头写明批复依据；结尾可用'此复''特此批复'等",
      direction: "下行文"
    },
    {
      type: "意见",
      purpose: "对重要问题提出见解和处理办法",
      format: "开头写明提出意见的依据和目的；结尾可用'以上意见，请参照执行'等",
      direction: "平行文"
    },
    {
      type: "函",
      purpose: "不相隶属机关之间商洽工作、询问和答复问题，向对等单位请求支持",
      format: "开头写明致函目的；结尾可用'此函''特此函告''盼复函告知'等",
      direction: "平行文"
    },
    {
      type: "纪要",
      purpose: "记载会议主要情况和议定事项",
      format: "标题写明会议名称和'纪要'二字；正文写明会议时间、地点、出席人员、议定事项等",
      direction: "下行文或平行文"
    }
  ],

  /**
   * 公文行文规则
   */
  writingRules: [
    {
      rule: "上行文",
      description: "下级机关向上级机关呈送的公文",
      format: "应当使用请示、报告、请求批复的语气",
      examples: [
        "请领导同志指示",
        "妥否，请批示",
        "恳请予以批准",
        "专此请示，当否，请批复"
      ]
    },
    {
      rule: "下行文",
      description: "上级机关向下级机关发出的公文",
      format: "应当使用命令、指示、要求的语气",
      examples: [
        "特此通知，请遵照执行",
        "望认真贯彻落实",
        "必须严格执行",
        "各地区各部门要认真组织实施"
      ]
    },
    {
      rule: "平行文",
      description: "不相隶属机关之间互相发送的公文",
      format: "应当使用商洽、请求、告知的语气",
      examples: [
        "请予协助",
        "请给予支持",
        "妥否，请函复",
        "特此函告"
      ]
    }
  ],

  /**
   * 公文语言要求
   */
  languageRequirements: [
    {
      requirement: "庄重严谨",
      description: "公文语言应当庄重、严谨，不使用网络语言、俚语、方言",
      examples: {
        correct: "切实做好疫情防控工作",
        incorrect: "加油干好疫情防控工作"
      }
    },
    {
      requirement: "简明扼要",
      description: "公文语言应当简明扼要，避免冗长",
      examples: {
        correct: "请于6月30日前完成",
        incorrect: "请你们单位务必要在今年的6月份的30号之前一定要完成"
      }
    },
    {
      requirement: "准确规范",
      description: "公文语言应当准确规范，用词恰当",
      examples: {
        correct: "决定予以通报批评",
        incorrect: "决定给予通报批评"
      }
    },
    {
      requirement: "表述一致",
      description: "同一公文中对同一事物的称谓应当一致",
      examples: {
        correct: "国务院办公厅... 国务院办公厅...",
        incorrect: "国务院办公厅... 国办..."
      }
    },
    {
      requirement: "无感情色彩",
      description: "公文应当客观陈述，避免感情色彩浓厚的词语",
      examples: {
        correct: "要加强管理，提高效率",
        incorrect: "要大力度加强管理，大幅度提高效率"
      }
    }
  ],

  /**
   * 公文标点符号规范
   */
  punctuationRules: [
    {
      mark: "标题",
      rule: "公文标题一般不用标点符号",
      exceptions: "除引用法规名称等情况外"
    },
    {
      mark: "顿号",
      rule: "并列词语之间用顿号",
      example: "各省、自治区、直辖市"
    },
    {
      mark: "逗号",
      rule: "一般句子中的停顿用逗号",
      example: "经研究，决定如下"
    },
    {
      mark: "分号",
      rule: "复合句内部并列分句之间用分号",
      example: "会议听取了工作报告；讨论了下一步工作安排"
    },
    {
      mark: "冒号",
      rule: "表示提示下文或总括上文",
      example: "会议决定：..."
    },
    {
      mark: "引号",
      rule: "引用原文或特定名称时使用",
      example: "根据《公文处理条例》规定"
    }
  ]
};

/**
 * 项目文档格式规范指南
 */
export const projectDocumentFormatGuide = {
  // 项目立项书格式规范
  proposalFormat: [
    {
      section: "项目概述",
      contents: ["项目背景", "项目目标", "项目范围", "项目干系人"]
    },
    {
      section: "可行性分析",
      contents: ["技术可行性", "经济可行性", "运营可行性", "风险分析"]
    },
    {
      section: "项目计划",
      contents: ["工作分解结构(WBS)", "进度计划", "资源需求", "成本估算"]
    },
    {
      section: "组织与管理",
      contents: ["项目组织结构", "角色与职责", "沟通管理计划"]
    },
    {
      section: "附件",
      contents: ["相关图表", "支持文档", "参考资料"]
    }
  ],
  
  // 项目总结报告格式规范
  summaryReportFormat: [
    {
      section: "项目概况",
      contents: ["项目基本信息", "目标与实际完成情况对比"]
    },
    {
      section: "项目成果",
      contents: ["主要交付物", "质量评估", "客户满意度"]
    },
    {
      section: "项目绩效",
      contents: ["进度执行情况", "成本控制情况", "资源利用情况"]
    },
    {
      section: "经验教训",
      contents: ["成功因素", "问题与挑战", "改进建议"]
    },
    {
      section: "后续工作",
      contents: ["遗留问题", "后续行动计划"]
    }
  ]
};

/**
 * 学术论文格式规范指南
 */
export const academicPaperFormatGuide = {
  // 论文基本结构
  basicStructure: [
    {
      section: "题目",
      description: "应明确、具体、简洁，能概括论文的主要内容"
    },
    {
      section: "摘要",
      description: "概括研究目的、方法、结果和结论，一般200-300字"
    },
    {
      section: "关键词",
      description: "3-8个能反映论文主题的词或词组"
    },
    {
      section: "引言/前言",
      description: "说明研究背景、目的和意义，文献回顾等"
    },
    {
      section: "研究方法",
      description: "详细描述研究设计、数据收集和分析方法"
    },
    {
      section: "研究结果",
      description: "客观呈现研究发现，可使用表格、图表等"
    },
    {
      section: "讨论",
      description: "分析结果的意义，与已有研究的比较，局限性等"
    },
    {
      section: "结论",
      description: "总结主要发现，指出理论和实践意义，未来研究方向"
    },
    {
      section: "参考文献",
      description: "列出引用的文献，按特定格式排列"
    }
  ],
  
  // 常见引用格式
  citationFormats: [
    {
      format: "APA格式(美国心理学会)",
      example: "作者. (年份). 标题. 出版物名称, 卷(期), 页码."
    },
    {
      format: "MLA格式(现代语言协会)",
      example: "作者. \"标题.\" 出版物名称, 卷期, 年份, 页码."
    },
    {
      format: "GB/T 7714(中国国家标准)",
      example: "作者. 标题[J]. 期刊名, 出版年份, 卷(期): 起止页码."
    }
  ]
};

/**
 * 根据文档类型获取对应的格式指南
 * @param documentType 文档类型
 * @returns 格式指南对象
 */
export function getFormatGuideByType(documentType: string): any {
  if (documentType.includes("公文") || documentType.includes("通知") || 
      documentType.includes("报告") || documentType.includes("请示") || 
      documentType.includes("批复") || documentType.includes("会议纪要") ||
      documentType.includes("党内文件") || documentType.includes("政策文件") ||
      documentType.includes("讲话稿") || documentType.includes("应急预案")) {
    return officialDocumentFormatGuide;
  } else if (documentType.includes("项目") || documentType.includes("计划") || 
             documentType.includes("提案") || documentType.includes("总结")) {
    return projectDocumentFormatGuide;
  } else if (documentType.includes("论文") || documentType.includes("学术")) {
    return academicPaperFormatGuide;
  }
  
  // 默认返回公文格式指南
  return officialDocumentFormatGuide;
}