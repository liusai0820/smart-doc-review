import { AlertCircle, AlertTriangle, InfoIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Document, Change } from "@/lib/mock-data";

interface ReviewPanelProps {
  document: Document | null;
}

export default function ReviewPanel({ document }: ReviewPanelProps) {
  if (!document) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-500">请从左侧选择一个文档</p>
        </div>
      </Card>
    );
  }

  // 提取所有变更
  const allChanges = document.paragraphs.flatMap((p) => p.changes);

  // 按严重性统计变更
  const errorCount = allChanges.filter((c) => c.severity === "error").length;
  const warningCount = allChanges.filter((c) => c.severity === "warning").length;
  const infoCount = allChanges.filter((c) => c.severity === "info").length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">审阅结果</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 统计徽章 */}
        <div className="flex gap-3 mb-4">
          <div className="flex flex-col items-center">
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 mb-1">
              {errorCount}
            </Badge>
            <span className="text-xs text-gray-500">错误</span>
          </div>
          <div className="flex flex-col items-center">
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 mb-1">
              {warningCount}
            </Badge>
            <span className="text-xs text-gray-500">警告</span>
          </div>
          <div className="flex flex-col items-center">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mb-1">
              {infoCount}
            </Badge>
            <span className="text-xs text-gray-500">建议</span>
          </div>
        </div>

        {/* 变更列表 */}
        {allChanges.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-3">
              {allChanges.map((change) => (
                <div
                  key={change.id}
                  className="p-3 border rounded-lg bg-white"
                >
                  <div className="flex items-start gap-2">
                    {change.severity === "error" ? (
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : change.severity === "warning" ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-sm">
                        {change.type === "addition"
                          ? "新增内容"
                          : change.type === "deletion"
                          ? "删除内容"
                          : "内容变更"}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {change.explanation}
                      </p>
                      {change.original && (
                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-200">
                          <div className="text-gray-500 mb-1">原文:</div>
                          <div className="text-red-500 line-through">
                            {change.original}
                          </div>
                        </div>
                      )}
                      {change.new && (
                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-200">
                          <div className="text-gray-500 mb-1">修改为:</div>
                          <div className="text-green-600">{change.new}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-[calc(100vh-250px)] flex items-center justify-center">
            <p className="text-gray-500">该文档暂无变更</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}