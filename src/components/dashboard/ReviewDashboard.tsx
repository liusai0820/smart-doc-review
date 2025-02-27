import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Document } from "@/lib/mock-data";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { AlertCircle, AlertTriangle, Info, FileCheck, FileWarning, File } from "lucide-react";

interface ReviewDashboardProps {
  documents: Document[];
}

interface DashboardStats {
  totalDocuments: number;
  reviewedDocuments: number;
  pendingDocuments: number;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  reviewCompletionRate: number;
  topErrorCategories: Array<{ name: string; count: number }>;
  statusDistribution: Array<{ name: string; value: number }>;
  issuesByDocument: Array<{ name: string; errors: number; warnings: number; suggestions: number }>;
}

export default function ReviewDashboard({ documents }: ReviewDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    reviewedDocuments: 0,
    pendingDocuments: 0,
    totalIssues: 0,
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    reviewCompletionRate: 0,
    topErrorCategories: [],
    statusDistribution: [],
    issuesByDocument: []
  });

  // 颜色配置
  const COLORS = {
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    completed: "#10b981",
    inProgress: "#6366f1",
    pending: "#94a3b8",
  };

  // 计算统计数据
  useEffect(() => {
    if (!documents || documents.length === 0) return;

    const reviewedDocs = documents.filter(doc => doc.status === "completed").length;
    const inProgressDocs = documents.filter(doc => doc.status === "in_progress").length;
    const pendingDocs = documents.filter(doc => doc.status === "pending").length;
    
    // 统计各种问题
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalInfo = 0;
    
    const issuesByDoc = documents.map(doc => {
      const errors = doc.paragraphs.flatMap(p => p.changes).filter(c => c.severity === 'error').length;
      const warnings = doc.paragraphs.flatMap(p => p.changes).filter(c => c.severity === 'warning').length;
      const infos = doc.paragraphs.flatMap(p => p.changes).filter(c => c.severity === 'info').length;
      
      totalErrors += errors;
      totalWarnings += warnings;
      totalInfo += infos;
      
      return {
        name: doc.title.length > 15 ? doc.title.substring(0, 15) + '...' : doc.title,
        errors,
        warnings: warnings,
        suggestions: infos
      };
    });
    
    const topIssueDocuments = [...issuesByDoc]
      .sort((a, b) => (b.errors + b.warnings + b.suggestions) - (a.errors + a.warnings + a.suggestions))
      .slice(0, 5);
    
    setStats({
      totalDocuments: documents.length,
      reviewedDocuments: reviewedDocs,
      pendingDocuments: pendingDocs,
      totalIssues: totalErrors + totalWarnings + totalInfo,
      errorCount: totalErrors,
      warningCount: totalWarnings,
      infoCount: totalInfo,
      reviewCompletionRate: documents.length > 0 ? (reviewedDocs / documents.length) * 100 : 0,
      topErrorCategories: [
        { name: "逻辑错误", count: Math.floor(totalErrors * 0.35) },
        { name: "数据错误", count: Math.floor(totalErrors * 0.25) },
        { name: "表述不清", count: Math.floor(totalErrors * 0.20) },
        { name: "格式问题", count: Math.floor(totalErrors * 0.15) },
        { name: "其他问题", count: Math.floor(totalErrors * 0.05) }
      ],
      statusDistribution: [
        { name: "已完成", value: reviewedDocs },
        { name: "进行中", value: inProgressDocs },
        { name: "待审阅", value: pendingDocs }
      ],
      issuesByDocument: topIssueDocuments
    });
  }, [documents]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {/* 文档统计卡片 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">总文档数</p>
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
              </div>
              <File className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">已审阅文档</p>
                <p className="text-2xl font-bold">{stats.reviewedDocuments}</p>
              </div>
              <FileCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">待审阅文档</p>
                <p className="text-2xl font-bold">{stats.pendingDocuments}</p>
              </div>
              <FileWarning className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">发现问题总数</p>
                <p className="text-2xl font-bold">{stats.totalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* 文档状态分布 */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">文档状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="completed" fill={COLORS.completed} />
                    <Cell key="inProgress" fill={COLORS.inProgress} />
                    <Cell key="pending" fill={COLORS.pending} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">已完成</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                <span className="text-sm">进行中</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-slate-400 mr-2"></div>
                <span className="text-sm">待审阅</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 问题类型分布 */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">问题类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "错误", value: stats.errorCount },
                      { name: "警告", value: stats.warningCount },
                      { name: "建议", value: stats.infoCount }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="error" fill={COLORS.error} />
                    <Cell key="warning" fill={COLORS.warning} />
                    <Cell key="info" fill={COLORS.info} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm">错误 ({stats.errorCount})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm">警告 ({stats.warningCount})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm">建议 ({stats.infoCount})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 按文档统计的问题数量 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">文档问题分布 (Top 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.issuesByDocument}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="errors" stackId="a" fill={COLORS.error} name="错误" />
                <Bar dataKey="warnings" stackId="a" fill={COLORS.warning} name="警告" />
                <Bar dataKey="suggestions" stackId="a" fill={COLORS.info} name="建议" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-6">
        {/* 常见错误类型 */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">常见错误类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topErrorCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{category.name}</span>
                    <span className="text-sm font-medium">{category.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(category.count / stats.topErrorCategories[0].count) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* 快速统计 */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">审阅统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">审阅完成率</span>
                  <span className="text-sm font-medium">{stats.reviewCompletionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.reviewCompletionRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col p-3 border rounded-lg">
                    <span className="text-muted-foreground text-xs">每文档平均问题数</span>
                    <span className="text-xl font-bold mt-1">
                      {stats.totalDocuments > 0 
                        ? (stats.totalIssues / stats.totalDocuments).toFixed(1) 
                        : "0"}
                    </span>
                  </div>
                  <div className="flex flex-col p-3 border rounded-lg">
                    <span className="text-muted-foreground text-xs">错误密度</span>
                    <span className="text-xl font-bold mt-1">
                      {stats.totalDocuments > 0 
                        ? (stats.errorCount / stats.totalDocuments).toFixed(1) 
                        : "0"}
                      <span className="text-xs text-muted-foreground ml-1">/ 文档</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}