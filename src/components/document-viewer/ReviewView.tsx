import React, { useState, useRef } from "react";
import type { JSX } from "react";
import { Paragraph, Change, ChangeSeverity } from "@/lib/mock-data";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import WordStyleReviewBubble from "./WordStyleReviewBubble";

interface EnhancedReviewViewProps {
  paragraphs: Paragraph[];
  onAcceptChange?: (paragraphId: number, changeId: string) => void;
  onRejectChange?: (paragraphId: number, changeId: string) => void;
}

interface HighlightedChange {
  paragraphId: number;
  change: Change;
  position: { top: number; left: number };
}

const EnhancedReviewView: React.FC<EnhancedReviewViewProps> = ({
  paragraphs,
  onAcceptChange,
  onRejectChange
}) => {
  const [selectedChange, setSelectedChange] = useState<HighlightedChange | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理接受修改
  const handleAcceptChange = () => {
    if (!selectedChange || !onAcceptChange) return;
    onAcceptChange(selectedChange.paragraphId, selectedChange.change.id);
    setSelectedChange(null);
  };

  // 处理拒绝修改
  const handleRejectChange = () => {
    if (!selectedChange || !onRejectChange) return;
    onRejectChange(selectedChange.paragraphId, selectedChange.change.id);
    setSelectedChange(null);
  };

  // 渲染修改建议的高亮文本
  const renderChangeHighlight = (
    text: string, 
    change: Change, 
    paragraphId: number
  ) => {
    // 获取不同修改类型的样式
    const getTypeClass = () => {
      switch (change.type) {
        case "deletion":
          return "deleted-text";
        case "addition":
          return "added-text";
        case "replace":
          return "modified-text";
        default:
          return "";
      }
    };

    // 获取不同严重性的图标
    const getSeverityIcon = (severity: ChangeSeverity) => {
      const className = "inline-block ml-1";
      const size = 14;
      
      switch (severity) {
        case 'error':
          return <AlertCircle className={`${className} text-red-500`} size={size} />;
        case 'warning':
          return <AlertTriangle className={`${className} text-yellow-500`} size={size} />;
        default:
          return <Info className={`${className} text-blue-500`} size={size} />;
      }
    };

    // 获取背景色
    const getBgColor = (severity: ChangeSeverity) => {
      switch (severity) {
        case 'error':
          return 'bg-red-100';
        case 'warning':
          return 'bg-yellow-100';
        default:
          return 'bg-blue-100';
      }
    };

    // 处理点击高亮区域
    const handleHighlightClick = (event: React.MouseEvent<HTMLSpanElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      
      setSelectedChange({
        paragraphId,
        change,
        position: {
          top: rect.top,
          left: rect.left + rect.width / 2
        }
      });
    };

    return (
      <span
        key={change.id}
        className={`${getTypeClass()} ${getBgColor(change.severity)} rounded px-1 cursor-pointer relative group`}
        onClick={handleHighlightClick}
      >
        {text}
        {getSeverityIcon(change.severity)}
      </span>
    );
  };

  // 渲染段落内容
  const renderParagraphContent = (paragraph: Paragraph) => {
    if (!paragraph.changes || paragraph.changes.length === 0) {
      // 如果没有修改，直接渲染原文
      return paragraph.isHtml ? (
        <div dangerouslySetInnerHTML={{ __html: paragraph.text }} />
      ) : (
        <div>{paragraph.text}</div>
      );
    }

    // 处理有修改的段落
    let content = paragraph.text;
    const elements: JSX.Element[] = [];
    let lastIndex = 0;
    
    // 排序修改，确保按文本位置顺序处理
    const sortedChanges = [...paragraph.changes].sort((a, b) => {
      const posA = a.original ? content.indexOf(a.original) : content.length;
      const posB = b.original ? content.indexOf(b.original) : content.length;
      return posA - posB;
    });

    // 处理每个修改
    sortedChanges.forEach((change, index) => {
      // 如果是添加类型并且没有原始文本，添加到末尾
      if (change.type === 'addition' && !change.original) {
        if (lastIndex < content.length) {
          // 添加最后一段未修改的文本
          if (paragraph.isHtml) {
            elements.push(
              <span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: content.substring(lastIndex) }} />
            );
          } else {
            elements.push(<span key={`text-${index}`}>{content.substring(lastIndex)}</span>);
          }
        }
        
        // 添加新增内容
        elements.push(renderChangeHighlight(change.new || '', change, paragraph.id));
        lastIndex = content.length;
        return;
      }

      // 对于其他类型的修改
      if (!change.original) return;
      
      const changeIndex = content.indexOf(change.original, lastIndex);
      if (changeIndex === -1) return;

      // 添加修改前的文本
      if (changeIndex > lastIndex) {
        const beforeText = content.substring(lastIndex, changeIndex);
        if (paragraph.isHtml) {
          elements.push(
            <span key={`text-before-${index}`} dangerouslySetInnerHTML={{ __html: beforeText }} />
          );
        } else {
          elements.push(<span key={`text-before-${index}`}>{beforeText}</span>);
        }
      }

      // 添加修改部分
      elements.push(renderChangeHighlight(change.original, change, paragraph.id));

      // 更新处理位置
      lastIndex = changeIndex + change.original.length;
    });

    // 添加最后剩余的文本
    if (lastIndex < content.length) {
      const afterText = content.substring(lastIndex);
      if (paragraph.isHtml) {
        elements.push(
          <span key="text-end" dangerouslySetInnerHTML={{ __html: afterText }} />
        );
      } else {
        elements.push(<span key="text-end">{afterText}</span>);
      }
    }

    return <div>{elements}</div>;
  };

  return (
    <div ref={containerRef} className="relative">
      <ScrollArea className="h-[calc(100vh-260px)]">
        <div className="space-y-4 p-4">
          {paragraphs.map((paragraph, index) => (
            <div 
              key={index} 
              className={paragraph.isTable ? "prose max-w-none overflow-x-auto" : "prose max-w-none"}
            >
              {renderParagraphContent(paragraph)}
            </div>
          ))}
        </div>
      </ScrollArea>

      {selectedChange && (
        <WordStyleReviewBubble
          change={selectedChange.change}
          onAccept={handleAcceptChange}
          onReject={handleRejectChange}
          position={selectedChange.position}
          isVisible={!!selectedChange}
        />
      )}
    </div>
  );
};

export default EnhancedReviewView;