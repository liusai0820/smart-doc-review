import { Document, Paragraph } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChangesComparisonViewProps {
  document: Document;
  reviewedParagraphs: Paragraph[];
  onClose: () => void;
  onAcceptChange: (paragraphId: number, changeId: string) => void;
  onRejectChange: (paragraphId: number, changeId: string) => void;
}

export default function ChangesComparisonView({ 
  document, 
  reviewedParagraphs, 
  onClose,
  onAcceptChange,
  onRejectChange 
}: ChangesComparisonViewProps) {
  // 获取当前段落的最终文本
  const getFinalText = (paragraph: Paragraph): string => {
    let text = paragraph.text;
    
    if (paragraph.changes && paragraph.changes.length > 0) {
      // 按位置排序变更
      const sortedChanges = [...paragraph.changes].sort((a, b) => {
        const posA = a.original ? text.indexOf(a.original) : text.length;
        const posB = b.original ? text.indexOf(b.original) : text.length;
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
    }
    
    return text;
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{document.title}</h2>
          <button 
            onClick={onClose}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            关闭
          </button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {reviewedParagraphs.map((paragraph) => (
              <div key={paragraph.id} className="border rounded-lg p-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">原文</h3>
                  <p className="text-gray-700">{paragraph.text}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium mb-2">修改后</h3>
                  <p className="text-gray-700">{getFinalText(paragraph)}</p>
                </div>

                {paragraph.changes && paragraph.changes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium mb-2">修改建议</h3>
                    {paragraph.changes.map(change => (
                      <div key={change.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">{change.explanation}</p>
                          <p className="text-xs text-gray-500">
                            严重程度: <span className={
                              change.severity === 'error' ? 'text-red-500' :
                              change.severity === 'warning' ? 'text-orange-500' :
                              change.severity === 'suggestion' ? 'text-blue-500' : 'text-green-500'
                            }>{change.severity}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onAcceptChange(paragraph.id, change.id)}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                          >
                            接受
                          </button>
                          <button
                            onClick={() => onRejectChange(paragraph.id, change.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                          >
                            拒绝
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}