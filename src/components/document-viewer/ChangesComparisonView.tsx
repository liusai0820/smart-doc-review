import { Document, Paragraph } from "@/lib/mock-data";
import { diffWords, Change } from 'diff';

interface ChangesComparisonViewProps {
  document: Document;
  reviewedParagraphs: Paragraph[];
  onAcceptChange: (paragraphId: number, changeId: string) => void;
  onRejectChange: (paragraphId: number, changeId: string) => void;
}

export default function ChangesComparisonView({
  document,
  reviewedParagraphs,
  onAcceptChange,
  onRejectChange
}: ChangesComparisonViewProps) {
  // 渲染文字差异
  const renderDiff = (original: string, modified: string) => {
    if (!original || !modified) return null;
    
    const differences = diffWords(original, modified);
    
    return (
      <div>
        {differences.map((part: Change, index: number) => (
          <span 
            key={index}
            className={
              part.added ? "bg-green-100 text-green-800" :
              part.removed ? "bg-red-100 text-red-800 line-through" :
              "text-gray-700"
            }
          >
            {part.value}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {reviewedParagraphs.map((paragraph, index) => (
        <div key={paragraph.id} className="border rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">原文：</h3>
            <div className="text-gray-700">{document.paragraphs[index].text}</div>
          </div>
          
          {paragraph.changes && paragraph.changes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500">修改建议：</h3>
              {paragraph.changes.map(change => (
                <div 
                  key={change.id}
                  className="bg-gray-50 rounded-lg p-3 border"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {change.type === 'replace' && (
                        <>
                          <div className="mb-2">
                            {renderDiff(change.original || '', change.new || '')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {change.explanation}
                          </div>
                        </>
                      )}
                      {change.type === 'deletion' && (
                        <>
                          <div className="text-red-600 line-through">
                            {change.original}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {change.explanation}
                          </div>
                        </>
                      )}
                      {change.type === 'addition' && (
                        <>
                          <div className="text-green-600">
                            {change.new}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {change.explanation}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                        onClick={() => onAcceptChange(paragraph.id, change.id)}
                      >
                        接受
                      </button>
                      <button
                        className="px-2 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        onClick={() => onRejectChange(paragraph.id, change.id)}
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}