import React, { useState, useRef, useEffect } from 'react';
import { Paragraph, Change, ChangeSeverity } from '@/lib/types';
import WordStyleReviewBubble from './WordStyleReviewBubble';

interface EnhancedReviewViewProps {
  paragraphs: Paragraph[];
  onAcceptChange: (paragraphId: number, changeId: string) => void;
  onRejectChange: (paragraphId: number, changeId: string) => void;
}

interface HighlightedChange {
  paragraphId: number;
  change: Change;
  position: {
    top: number;
    left: number;
  };
}

const EnhancedReviewView: React.FC<EnhancedReviewViewProps> = ({
  paragraphs,
  onAcceptChange,
  onRejectChange
}) => {
  const [selectedChange, setSelectedChange] = useState<HighlightedChange | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollPosition({
        top: container.scrollTop,
        left: container.scrollLeft
      });
      // 关闭当前打开的气泡
      setSelectedChange(null);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 处理接受修改
  const handleAcceptChange = () => {
    if (!selectedChange) return;
    onAcceptChange(selectedChange.paragraphId, selectedChange.change.id);
    setSelectedChange(null);
  };

  // 处理拒绝修改
  const handleRejectChange = () => {
    if (!selectedChange) return;
    onRejectChange(selectedChange.paragraphId, selectedChange.change.id);
    setSelectedChange(null);
  };

  // 获取不同严重性的样式
  const getSeverityStyle = (severity: ChangeSeverity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 hover:bg-red-200 border-red-300';
      case 'warning':
        return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300';
      default:
        return 'bg-blue-100 hover:bg-blue-200 border-blue-300';
    }
  };

  // 处理点击高亮区域
  const handleHighlightClick = (event: React.MouseEvent<HTMLSpanElement>, change: Change, paragraphId: number) => {
    event.stopPropagation(); // 阻止事件冒泡
    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      const relativeTop = rect.top - containerRect.top + scrollPosition.top;
      const relativeLeft = rect.left - containerRect.left + scrollPosition.left;
      
      setSelectedChange({
        paragraphId,
        change,
        position: {
          top: relativeTop,
          left: relativeLeft + rect.width / 2
        }
      });
    }
  };

  // 渲染段落内容
  const renderParagraphContent = (paragraph: Paragraph) => {
    if (!paragraph.changes || paragraph.changes.length === 0) {
      return paragraph.isHtml ? (
        <div dangerouslySetInnerHTML={{ __html: paragraph.text }} />
      ) : (
        <div>{paragraph.text}</div>
      );
    }

    const content = paragraph.text;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // 按位置排序变更
    const sortedChanges = [...paragraph.changes].sort((a, b) => {
      const posA = a.position?.start ?? 0;
      const posB = b.position?.start ?? 0;
      return posA - posB;
    });

    sortedChanges.forEach((change, index) => {
      const start = change.position?.start ?? 0;
      const end = change.position?.end ?? 0;

      // 添加未修改的文本
      if (start > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {content.slice(lastIndex, start)}
          </span>
        );
      }

      // 添加高亮的修改文本
      elements.push(
        <span
          key={`change-${index}`}
          className={`cursor-pointer px-0.5 rounded border ${getSeverityStyle(change.severity)}`}
          onClick={(e) => handleHighlightClick(e, change, paragraph.id)}
        >
          {content.slice(start, end)}
        </span>
      );

      lastIndex = end;
    });

    // 添加剩余的未修改文本
    if (lastIndex < content.length) {
      elements.push(
        <span key="text-end">
          {content.slice(lastIndex)}
        </span>
      );
    }

    return <div className="relative">{elements}</div>;
  };

  // 点击空白区域关闭气泡
  const handleContainerClick = () => {
    setSelectedChange(null);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative h-full overflow-auto"
      onClick={handleContainerClick}
    >
      <div className="p-4 space-y-4">
        {paragraphs.map((paragraph, index) => (
          <div key={index} className="prose max-w-none">
            {renderParagraphContent(paragraph)}
          </div>
        ))}
      </div>

      {selectedChange && (
        <div 
          className="absolute pointer-events-none"
          style={{ 
            top: 0,
            left: 0,
            transform: `translate3d(${selectedChange.position.left}px, ${selectedChange.position.top}px, 0)`,
            zIndex: 50
          }}
        >
          <div className="pointer-events-auto">
            <WordStyleReviewBubble
              change={selectedChange.change}
              onAccept={handleAcceptChange}
              onReject={handleRejectChange}
              position={selectedChange.position}
              isVisible={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedReviewView; 