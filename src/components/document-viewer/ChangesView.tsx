import { Paragraph } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChangesViewProps {
  paragraphs: Paragraph[];
  onAcceptChange: (paragraphId: number, changeId: string) => void;
  onRejectChange: (paragraphId: number, changeId: string) => void;
}

export default function ChangesView({
  paragraphs,
  onAcceptChange,
  onRejectChange
}: ChangesViewProps) {
  // 获取变更的严重程度对应的样式
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'suggestion':
      case 'info':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  // 获取变更的严重程度对应的图标
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'suggestion':
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 py-4">
      {paragraphs.map((paragraph) => (
        <div key={paragraph.id} className="relative group">
          <div className="text-gray-700 leading-7">
            {paragraph.changes && paragraph.changes.length > 0 ? (
              <div className="space-y-4">
                {/* 原文与修改建议的对比视图 */}
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-2">原文：</div>
                  <div className="text-gray-700">{paragraph.text}</div>
                </div>
                
                {/* 变更列表 */}
                <div className="space-y-3">
                  {paragraph.changes.map((change) => (
                    <div
                      key={change.id}
                      className={cn(
                        "border rounded-lg p-4 transition-colors",
                        getSeverityStyle(change.severity)
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getSeverityIcon(change.severity)}
                            <span className="text-sm font-medium">
                              {change.type === 'replace' ? '建议修改' :
                               change.type === 'deletion' ? '建议删除' :
                               change.type === 'addition' ? '建议添加' : '修改建议'}
                            </span>
                          </div>
                          
                          {change.type === 'replace' && (
                            <>
                              <div className="text-sm text-gray-500 line-through mb-1">
                                {change.original}
                              </div>
                              <div className="text-sm text-green-600">
                                {change.new}
                              </div>
                            </>
                          )}
                          
                          {change.type === 'deletion' && (
                            <div className="text-sm text-gray-500 line-through">
                              {change.original}
                            </div>
                          )}
                          
                          {change.type === 'addition' && (
                            <div className="text-sm text-green-600">
                              {change.new}
                            </div>
                          )}
                          
                          {change.comment && (
                            <div className="mt-2 text-sm text-gray-600">
                              {change.comment}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => onAcceptChange(paragraph.id, change.id)}
                          >
                            <Check className="h-4 w-4" />
                            接受
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onRejectChange(paragraph.id, change.id)}
                          >
                            <X className="h-4 w-4" />
                            拒绝
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-700">{paragraph.text}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 