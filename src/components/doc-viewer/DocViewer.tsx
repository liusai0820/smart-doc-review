import { useState, useEffect, useRef } from 'react';
// mammoth库目前未使用，但保留以便将来可能的扩展功能
import { renderAsync } from 'docx-preview';

interface DocViewerProps {
  fileUrl: string;
}

const DocViewer: React.FC<DocViewerProps> = ({ fileUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!fileUrl) {
          setError('未提供文档URL');
          setIsLoading(false);
          return;
        }

        // 根据文件扩展名选择渲染方法
        if (fileUrl.toLowerCase().endsWith('.docx')) {
          const response = await fetch(fileUrl);
          
          if (!response.ok) {
            throw new Error(`无法获取文档: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          
          if (containerRef.current) {
            // 使用docx-preview渲染DOCX文件
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
        } else if (fileUrl.toLowerCase().endsWith('.doc')) {
          // 对于DOC文件，可以考虑转换或使用其他方法
          setError('目前不支持旧版DOC格式，请转换为DOCX格式');
        } else {
          // 对于纯文本或其他文件类型
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error(`无法获取文档: ${response.statusText}`);
          }
          
          const text = await response.text();
          if (containerRef.current) {
            containerRef.current.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${text}</pre>`;
          }
        }
      } catch (err) {
        console.error('文档加载错误:', err);
        setError(err instanceof Error ? err.message : '加载文档时出错');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [fileUrl]);

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