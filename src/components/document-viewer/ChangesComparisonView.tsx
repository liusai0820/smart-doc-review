import { Document, Paragraph } from "@/lib/mock-data";

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
                    <div>
                      {change.type === 'replace' && (
                        <>
                          <p className="text-gray-500 line-through mb-1">{change.original}</p>
                          <p className="text-green-600">{change.new}</p>
                        </>
                      )}
                      {change.type === 'deletion' && (
                        <p className="text-gray-500 line-through">{change.original}</p>
                      )}
                      {change.type === 'addition' && (
                        <p className="text-green-600">{change.new}</p>
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