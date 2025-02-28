// 文档相关类型定义
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
  severity?: number;
}

export interface Document {
  id: string;
  title: string;
  date: string;
  status: "pending" | "in_progress" | "completed";
  paragraphs: Paragraph[];
  fileUrl?: string;
  content?: ArrayBuffer;
}

// 审阅结果接口
export interface ReviewResult {
  documentInfo: {
    title: string;
    overview: string;
    totalIssues: {
      errors: number;
      warnings: number;
      suggestions: number;
    };
  };
  reviewContent: Array<{
    id: string;
    originalText: string;
    changes: Array<{
      type: ChangeType;
      position: {
        start: number;
        end: number;
      };
      originalText?: string;
      newText?: string;
      explanation: string;
      severity: ChangeSeverity;
      category: string;
    }>;
  }>;
}

// 文档洞察结果接口
export interface DocumentInsightsResult {
  summary: {
    title: string;
    documentType: string;
    mainPurpose: string;
    keyPoints: string[];
    overallQuality: number;
    overallComment: string;
  };
  detailedAnalysis: {
    structure: {
      rating: number;
      analysis: string;
      recommendations: string;
    };
    content: {
      rating: number;
      strengths: string[];
      weaknesses: string[];
      recommendations: string;
    };
    dataUsage: {
      rating: number;
      analysis: string;
      recommendations: string;
    };
    expression: {
      rating: number;
      analysis: string;
      recommendations: string;
    };
  };
  approvalSuggestion: {
    status: "approved" | "needsRevision" | "rejected";
    reason: string;
    revisionFocus: string[];
  };
} 