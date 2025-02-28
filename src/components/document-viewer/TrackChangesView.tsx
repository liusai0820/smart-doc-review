import React from "react";
import { Paragraph } from "@/lib/mock-data";
import { Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TrackChangesViewProps {
  paragraphs: Paragraph[];
  onAcceptChange?: (paragraphId: number, changeId: string) => void;
  onRejectChange?: (paragraphId: number, changeId: string) => void;
}

const TrackChangesView: React.FC<TrackChangesViewProps> = ({
  paragraphs,
  onAcceptChange,
  onRejectChange
}) => {
  // 渲染段落的修改
  const renderParagraphChanges = (paragraph: Paragraph) => {
    if (!paragraph.changes || paragraph.changes.length === 0) {
      return <div className="text-gray-400">无修改</div>;
    }

    return (
      <div className="space-y-2">
        {paragraph.changes.map((change) => (
          <div key={change.id} className="border rounded-lg p-2 bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {change.type === 'replace' && (
                  <>
                    <div className="text-xs text-gray-500 mb-1">替换:</div>
                    <div className="text-sm mb-1">
                      <span className="line-through text-red-500">{change.original}</span>
                      <span className="mx-1">→</span>
                      <span className="text-green-600">{change.new}</span>
                    </div>
                  </>
                )}
                {change.type === 'deletion' && (
                  <>
                    <div className="text-xs text-gray-500 mb-1">删除:</div>
                    <div className="text-sm line-through text-red-500 mb-1">{change.original}</div>
                  </>
                )}
                {change.type === 'addition' && (
                  <>
                    <div className="text-xs text-gray-500 mb-1">添加:</div>
                    <div className="text-sm text-green-600 mb-1">{change.new}</div>
                  </>
                )}
                <div className="text-xs text-gray-600">{change.explanation}</div>
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => onRejectChange?.(paragraph.id, change.id)}
                  className="p-1 rounded-full text-red-500 hover:bg-red-50"
                  title="拒绝修改"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => onAcceptChange?.(paragraph.id, change.id)}
                  className="p-1 rounded-full text-green-500 hover:bg-green-50"
                  title="接受修改"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 获取段落应用所有修改后的文本
  const getFinalText = (paragraph: Paragraph): string => {
    let text = paragraph.text;
    
    // 排序变更以确保按位置应用
    const sortedChanges = [...paragraph.changes].sort((a, b) => {
      const posA = a.original ? text.indexOf(a.original) : 0;
      const posB = b.original ? text.indexOf(b.original) : 0;
      return posB - posA; // 从后向前应用变更
    });
    
    // 应用变更
    sortedChanges.forEach(change => {
      if (change.type === 'replace' && change.original && change.new) {
        text = text.replace(change.original, change.new);
      } else if (change.type === 'deletion' && change.original) {
        text = text.replace(change.original, '');
      } else if (change.type === 'addition' && change.new) {
        text += ' ' + change.new;
      }
    });
    
    return text;
  };

  return (
    <ScrollArea className="h-[calc(100vh-260px)]">
      <div className="space-y-6 p-4">
        {paragraphs.map((paragraph, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-2 border-b text-sm font-medium">
              段落 {index + 1}
            </div>
            
            <div className="grid grid-cols-2 divide-x">
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-2">原文:</div>
                <div className="text-sm prose max-w-none">
                  {paragraph.isHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: paragraph.text }} />
                  ) : (
                    paragraph.text
                  )}
                </div>
              </div>
              
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-500">修改后:</div>
                  {paragraph.changes.length > 0 && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => paragraph.changes.forEach(c => onRejectChange?.(paragraph.id, c.id))}
                        className="px-2 py-1 text-xs rounded text-red-500 hover:bg-red-50"
                        title="拒绝所有修改"
                      >
                        拒绝全部
                      </button>
                      <button
                        onClick={() => paragraph.changes.forEach(c => onAcceptChange?.(paragraph.id, c.id))}
                        className="px-2 py-1 text-xs rounded text-green-500 hover:bg-green-50"
                        title="接受所有修改"
                      >
                        接受全部
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="text-sm prose max-w-none">
                  {paragraph.isHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: getFinalText(paragraph) }} />
                  ) : (
                    getFinalText(paragraph)
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 border-t">
              <div className="text-xs text-gray-500 mb-2">修改建议 ({paragraph.changes.length}):</div>
              {renderParagraphChanges(paragraph)}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default TrackChangesView;