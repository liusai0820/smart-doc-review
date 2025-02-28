import { useState, useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';

interface DocViewerProps {
  fileUrl?: string;
  content?: ArrayBuffer;
}

const DocViewer: React.FC<DocViewerProps> = ({ fileUrl, content }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let arrayBuffer: ArrayBuffer;

        if (content) {
          arrayBuffer = content;
        } else if (fileUrl) {
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error(`无法获取文档: ${response.statusText}`);
          }
          arrayBuffer = await response.arrayBuffer();
        } else {
          throw new Error('未提供文档内容或URL');
        }

        if (containerRef.current) {
          // 使用 docx-preview 渲染文档
          await renderAsync(arrayBuffer, containerRef.current, containerRef.current, {
            className: 'docx-viewer',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            useBase64URL: true,
          });
        }
      } catch (err) {
        console.error('文档加载错误:', err);
        setError(err instanceof Error ? err.message : '加载文档时出错');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [fileUrl, content]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-300px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2">正在加载文档...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">加载文档时出错:</div>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="document-viewer">
      <div 
        ref={containerRef} 
        className="doc-container p-4 bg-white rounded overflow-y-auto h-[calc(100vh-280px)]"
      />
    </div>
  );
};

export default DocViewer; 