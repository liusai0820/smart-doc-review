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
  
  // 获取不同修改类型的样式
  const getTypeClass = (type: string) => {
    switch (type) {
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

  // 处理点击高亮区域
  const handleHighlightClick = (event: React.MouseEvent<HTMLSpanElement>, change: Change, paragraphId: number) => {
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

  // 渲染修改建议的高亮文本 - 使用精确位置信息
  const renderPreciseChangeHighlight = (
    paragraph: Paragraph,
    change: Change, 
    paragraphId: number
  ): JSX.Element | null => {
    // 使用position信息进行精确定位
    if (change.position && 
        typeof change.position.start === 'number' && 
        typeof change.position.end === 'number') {
      
      const start = change.position.start;
      const end = change.position.end;
      
      // 确保位置在有效范围内
      if (start >= 0 && end <= paragraph.text.length && start < end) {
        const highlightText = paragraph.text.substring(start, end);
        
        return (
          <span
            key={change.id}
            className={`${getTypeClass(change.type)} ${getBgColor(change.severity)} rounded px-1 cursor-pointer relative group`}
            onClick={(event) => handleHighlightClick(event, change, paragraphId)}
          >
            {highlightText}
            {getSeverityIcon(change.severity)}
          </span>
        );
      }
    }
    
    // 如果没有有效的position信息，回退到使用original字段
    if (change.original) {
      return (
        <span
          key={change.id}
          className={`${getTypeClass(change.type)} ${getBgColor(change.severity)} rounded px-1 cursor-pointer relative group`}
          onClick={(event) => handleHighlightClick(event, change, paragraphId)}
        >
          {change.original}
          {getSeverityIcon(change.severity)}
        </span>
      );
    }
    
    return null;
  };

  // 渲染段落内容 - 使用精确位置处理
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
    const content = paragraph.text;
    const elements: JSX.Element[] = [];
    
    // 根据position对变更进行排序
    const sortedChanges = [...paragraph.changes].sort((a, b) => {
      const posA = a.position?.start ?? (a.original ? content.indexOf(a.original) : content.length);
      const posB = b.position?.start ?? (b.original ? content.indexOf(b.original) : content.length);
      return posA - posB;
    });
    
    // 跟踪上次处理的位置
    let lastEndIndex = 0;
    
    // 处理每个修改
    for (let i = 0; i < sortedChanges.length; i++) {
      const change = sortedChanges[i];
      
      // 处理"添加"类型的变更 (通常添加在段落末尾)
      if (change.type === 'addition' && !change.original && !change.position) {
        // 先添加最后一段未修改的文本
        if (lastEndIndex < content.length) {
          const normalText = content.substring(lastEndIndex);
          if (paragraph.isHtml) {
            elements.push(
              <span key={`text-end-${i}`} dangerouslySetInnerHTML={{ __html: normalText }} />
            );
          } else {
            elements.push(<span key={`text-end-${i}`}>{normalText}</span>);
          }
        }
        
        // 然后添加新增内容的高亮
        if (change.new) {
          elements.push(
            <span
              key={`addition-${change.id}`}
              className={`added-text ${getBgColor(change.severity)} rounded px-1 cursor-pointer`}
              onClick={(event) => handleHighlightClick(event, change, paragraph.id)}
            >
              {change.new}
              {getSeverityIcon(change.severity)}
            </span>
          );
        }
        
        // 更新处理位置
        lastEndIndex = content.length;
        continue;
      }
      
      // 确定变更的起始和结束位置
      let startIndex, endIndex;
      
      if (change.position && typeof change.position.start === 'number' && typeof change.position.end === 'number') {
        // 优先使用position信息
        startIndex = change.position.start;
        endIndex = change.position.end;
      } else if (change.original) {
        // 回退到使用original文本进行定位
        startIndex = content.indexOf(change.original, lastEndIndex);
        if (startIndex === -1) continue; // 如果找不到，跳过此变更
        endIndex = startIndex + change.original.length;
      } else {
        continue; // 如果没有position也没有original，无法定位，跳过
      }
      
      // 添加变更前的未修改文本
      if (startIndex > lastEndIndex) {
        const normalText = content.substring(lastEndIndex, startIndex);
        if (paragraph.isHtml) {
          elements.push(
            <span key={`text-before-${i}`} dangerouslySetInnerHTML={{ __html: normalText }} />
          );
        } else {
          elements.push(<span key={`text-before-${i}`}>{normalText}</span>);
        }
      }
      
      // 添加需要高亮的文本
      const highlightText = content.substring(startIndex, endIndex);
      elements.push(
        <span
          key={`change-${change.id}`}
          className={`${getTypeClass(change.type)} ${getBgColor(change.severity)} rounded px-1 cursor-pointer`}
          onClick={(event) => handleHighlightClick(event, change, paragraph.id)}
        >
          {highlightText}
          {getSeverityIcon(change.severity)}
        </span>
      );
      
      // 更新处理位置
      lastEndIndex = endIndex;
    }
    
    // 添加剩余未修改的文本
    if (lastEndIndex < content.length) {
      const normalText = content.substring(lastEndIndex);
      if (paragraph.isHtml) {
        elements.push(
          <span key="text-final" dangerouslySetInnerHTML={{ __html: normalText }} />
        );
      } else {
        elements.push(<span key="text-final">{normalText}</span>);
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