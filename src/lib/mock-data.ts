export type ChangeType = 'addition' | 'deletion' | 'replace' | 'insert' | 'delete';
export type ChangeSeverity = 'error' | 'warning' | 'info' | 'suggestion';

export interface Change {
  id: string;
  type: ChangeType;
  position?: {
    start: number;
    end: number;
  };
  original?: string;
  new?: string;
  explanation: string;
  severity: ChangeSeverity;
  category?: string;
}

export interface Paragraph {
  id: number;
  text: string;
  isHtml?: boolean;
  isTable?: boolean;
  changes: Change[];
}

export interface Document {
  id: string;
  title: string;
  date: string;
  status: "pending" | "in_progress" | "completed";
  paragraphs: Paragraph[];
  fileUrl?: string;
}

export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    title: "complex-process",
    date: "2025-02-27",
    status: "pending",
    paragraphs: [
      {
        id: 1,
        text: "本报告对市场现状进行了深入分析，通过对比竞品发现，本项目在技术创新方面具有显著优势。详细数据显示，预计市场份额可达15%，投资回报周期约为2年。",
        changes: [
          {
            id: "change-001",
            type: "replace",
            original: "市场份额可达15%",
            new: "市场份额可达20%",
            explanation: "根据最新市场调研数据更新",
            severity: "info"
          },
          {
            id: "change-002",
            type: "replace",
            original: "投资回报周期约为2年",
            new: "投资回报周期约为18个月",
            explanation: "根据财务模型重新计算",
            severity: "info"
          }
        ]
      },
      {
        id: 2,
        text: "产品定位面向中高端消费群体，初期推广策略以线上社交媒体为主，同时布局线下体验店。定价策略采用阶梯式定价，基础版998元，专业版1598元。",
        changes: [
          {
            id: "change-003",
            type: "replace",
            original: "定价策略采用阶梯式定价，基础版998元，专业版1598元",
            new: "定价策略采用阶梯式定价，基础版898元，专业版1498元",
            explanation: "降低价格以提升市场竞争力",
            severity: "warning"
          }
        ]
      },
      {
        id: 3,
        text: "风险评估方面，主要面临技术开发延误、市场竞争加剧、原材料成本上涨等风险，需制定应急预案。综合评估显示，风险可控，项目可行。",
        changes: [
          {
            id: "change-004",
            type: "addition",
            new: "同时也需注意知识产权保护风险",
            explanation: "法务部门建议补充知识产权风险提示",
            severity: "error"
          }
        ]
      }
    ]
  },
  {
    id: "doc-2",
    title: "项目可行性分析报告",
    date: "2023-12-15",
    status: "completed",
    paragraphs: [
      {
        id: 1,
        text: "第一季度销售收入达1250万元，比去年同期增长15%，主要得益于新产品线的推出及营销策略调整。营业利润率提升至28%，高于行业平均水平。",
        changes: [
          {
            id: "change-005",
            type: "replace",
            original: "比去年同期增长15%",
            new: "比去年同期增长17.5%",
            explanation: "会计部门重新核算后更新",
            severity: "error"
          }
        ]
      },
      {
        id: 2,
        text: "研发投入占总收入的12%，较去年增加2个百分点，人力成本有所上升，但通过优化供应链，材料成本下降5%。",
        changes: [
          {
            id: "change-006",
            type: "deletion",
            original: "但通过优化供应链，材料成本下降5%",
            explanation: "材料成本数据尚未最终确认，建议删除",
            severity: "warning"
          }
        ]
      }
    ]
  },
  {
    id: "doc-3",
    title: "季度财务报表",
    date: "2024-01-20",
    status: "in_progress",
    paragraphs: [
      {
        id: 1,
        text: "根据用户反馈，下一版本将重点优化用户界面，提升响应速度，并新增数据分析功能。",
        changes: []
      },
      {
        id: 2,
        text: "技术架构采用微服务设计，前端使用React框架，后端采用Node.js和MongoDB。云服务选择阿里云，考虑到后期国际化需求，预留跨区域部署方案。",
        changes: [
          {
            id: "change-007",
            type: "replace",
            original: "后端采用Node.js和MongoDB",
            new: "后端采用Go语言和PostgreSQL",
            explanation: "技术团队建议变更后端技术栈以提升性能",
            severity: "warning"
          }
        ]
      }
    ]
  },
  {
    id: "doc-4",
    title: "产品开发规划",
    date: "2024-02-10",
    status: "pending",
    paragraphs: [
      {
        id: 1,
        text: "新版产品将重点提升用户体验，优化界面设计，并增加智能推荐功能。",
        changes: []
      },
      {
        id: 2,
        text: "预计开发周期为3个月，将在5月份发布测试版，7月正式上线。",
        changes: []
      }
    ],
    fileUrl: "/samples/sample-doc.txt" // 使用文本文件作为示例
  }
];