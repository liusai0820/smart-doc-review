import { Paragraph, Change, ChangeSeverity } from "@/lib/mock-data";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { ReactNode } from "react";

interface ReviewViewProps {
  paragraphs: Paragraph[];
}

interface ExtendedParagraph extends Paragraph {
  isTable?: boolean;
}

export default function ReviewView({ paragraphs }: ReviewViewProps) {
  const renderChange = (text: string, changes: Change[], isHtml: boolean = true) => {
    if (!changes || changes.length === 0) {
      if (isHtml) {
        return <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: text }} />;
      }
      return <div className="text-gray-700">{text}</div>;
    }

    const elements: ReactNode[] = [];
    let lastIndex = 0;

    // 按修改位置排序
    const sortedChanges = [...changes].sort((a, b) => {
      const aIndex = text.indexOf(a.original || "");
      const bIndex = text.indexOf(b.original || "");
      return aIndex - bIndex;
    });

    sortedChanges.forEach((change, index) => {
      const changeIndex = text.indexOf(change.original || "");
      if (changeIndex === -1) return;

      // 添加修改前的普通文本
      if (changeIndex > lastIndex) {
        const beforeText = text.substring(lastIndex, changeIndex);
        elements.push(
          <span key={`text-${index}`} className="text-gray-700" dangerouslySetInnerHTML={{ __html: beforeText }} />
        );
      }

      // 添加修改部分
      const getIconWithTooltip = (severity: ChangeSeverity) => {
        const className = "inline-block ml-1";
        const size = 14;
        
        switch (severity) {
          case 'error':
            return (
              <span title="错误">
                <AlertCircle className={`${className} text-red-500`} size={size} />
              </span>
            );
          case 'warning':
            return (
              <span title="警告">
                <AlertTriangle className={`${className} text-yellow-500`} size={size} />
              </span>
            );
          default:
            return (
              <span title="建议">
                <Info className={`${className} text-blue-500`} size={size} />
              </span>
            );
        }
      };

      const icon = getIconWithTooltip(change.severity);

      const bgColor = change.severity === 'error'
        ? 'bg-red-100'
        : change.severity === 'warning'
        ? 'bg-yellow-100'
        : 'bg-blue-100';

      elements.push(
        <span
          key={`change-${index}`}
          className={`relative group cursor-help ${bgColor} rounded px-1`}
        >
          <span dangerouslySetInnerHTML={{ __html: change.original || "" }} />
          {icon}
          <div className="suggestion-tooltip">
            <div className="flex items-start gap-2">
              {icon}
              <div>
                <p className="suggestion-content">{change.explanation}</p>
                {change.type === 'replace' && (
                  <>
                    <p className="suggestion-original">原文：{change.original}</p>
                    <p className="suggestion-new">建议修改为：{change.new}</p>
                  </>
                )}
                {change.type === 'addition' && (
                  <p className="suggestion-new">建议添加：{change.new}</p>
                )}
                {change.type === 'deletion' && (
                  <p className="suggestion-original">建议删除：{change.original}</p>
                )}
              </div>
            </div>
          </div>
        </span>
      );

      lastIndex = changeIndex + (change.original?.length || 0);
    });

    // 添加剩余的文本
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex);
      elements.push(
        <span key="text-end" className="text-gray-700" dangerouslySetInnerHTML={{ __html: afterText }} />
      );
    }

    return <div className="leading-relaxed">{elements}</div>;
  };

  return (
    <div className="space-y-4 p-4">
      {paragraphs.map((paragraph, index) => {
        const extendedParagraph = paragraph as ExtendedParagraph;
        const className = extendedParagraph.isTable 
          ? "prose max-w-none overflow-x-auto" 
          : "prose max-w-none";
        
        return (
          <div key={index} className={className}>
            {renderChange(paragraph.text, paragraph.changes, paragraph.isHtml)}
          </div>
        );
      })}
    </div>
  );
}