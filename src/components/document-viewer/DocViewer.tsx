import React, { useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';

interface DocViewerProps {
  fileUrl?: string;
  content?: ArrayBuffer;
}

const DocViewer: React.FC<DocViewerProps> = ({ fileUrl, content }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDocument = async () => {
      if (!containerRef.current) return;

      try {
        // 清空容器
        containerRef.current.innerHTML = '';

        if (content) {
          // 如果直接传入了 ArrayBuffer 内容
          await renderAsync(content, containerRef.current, containerRef.current);
        } else if (fileUrl) {
          // 如果是通过 URL 加载
          const response = await fetch(fileUrl);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          await renderAsync(arrayBuffer, containerRef.current, containerRef.current);
        }
      } catch (error) {
        console.error('文档渲染失败:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div class="error-message">文档加载失败</div>';
        }
      }
    };

    renderDocument();
  }, [fileUrl, content]);

  return (
    <div 
      ref={containerRef} 
      className="docx-viewer bg-white rounded-lg shadow p-4 min-h-[500px] overflow-auto"
      style={{ 
        maxHeight: 'calc(100vh - 300px)',
      }}
    >
      <div className="loading">加载中...</div>
    </div>
  );
};

export default DocViewer; 