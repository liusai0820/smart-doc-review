import { useState, useEffect, useRef, useLayoutEffect } from 'react';
// mammoth库目前未使用，但保留以便将来可能的扩展功能
import { renderAsync } from 'docx-preview';

interface DocViewerProps {
  fileUrl?: string;
  content?: ArrayBuffer;
}

const DocViewer: React.FC<DocViewerProps> = ({ fileUrl, content }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<ArrayBuffer | null>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(false);
  const renderAttemptsRef = useRef(0);
  const maxRenderAttempts = 3;

  // 清理函数
  const cleanup = () => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
      renderTimeoutRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    renderAttemptsRef.current = 0;
  };

  // 确保组件卸载时清理
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []);

  // 渲染文档
  const renderDocument = async (buffer: ArrayBuffer): Promise<boolean> => {
    if (!containerRef.current || !mountedRef.current) {
      console.log('渲染条件不满足:', {
        hasContainer: !!containerRef.current,
        isMounted: mountedRef.current,
        attempt: renderAttemptsRef.current + 1
      });
      return false;
    }

    try {
      console.log('准备渲染文档:', {
        hasContainer: !!containerRef.current,
        containerSize: {
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        },
        bufferSize: buffer.byteLength,
        attempt: renderAttemptsRef.current + 1
      });

      // 确保容器是空的
      containerRef.current.innerHTML = '';

      // 等待一帧以确保容器已经准备好
      await new Promise(resolve => requestAnimationFrame(resolve));

      if (!mountedRef.current) return false;

      // 渲染文档
      await renderAsync(buffer, containerRef.current, containerRef.current, {
        className: 'docx-viewer',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        useBase64URL: true,
        debug: true
      });

      console.log('文档渲染完成:', {
        attempt: renderAttemptsRef.current + 1,
        containerSize: {
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        }
      });
      return true;
    } catch (error) {
      console.error('渲染文档失败:', error, {
        attempt: renderAttemptsRef.current + 1
      });
      return false;
    }
  };

  // 使用 useLayoutEffect 确保在浏览器绘制之前进行DOM操作
  useLayoutEffect(() => {
    const initializeViewer = async () => {
      if (!mountedRef.current) return;

      try {
        setIsLoading(true);
        setError(null);
        cleanup();

        console.log('初始化查看器:', {
          hasContent: !!content,
          hasFileUrl: !!fileUrl,
          attempt: renderAttemptsRef.current + 1
        });

        // 如果没有内容，尝试从URL加载
        if (!content && fileUrl) {
          try {
            const response = await fetch(fileUrl);
            if (!response.ok) {
              throw new Error(`无法获取文档: ${response.statusText}`);
            }
            const blob = await response.blob();
            contentRef.current = await blob.arrayBuffer();
          } catch (error) {
            console.error('加载文档失败:', error);
            if (mountedRef.current) {
              setError('加载文档失败');
              setIsLoading(false);
            }
            return;
          }
        } else if (content) {
          contentRef.current = content;
        }

        if (!contentRef.current) {
          if (mountedRef.current) {
            setError('未提供文档内容');
            setIsLoading(false);
          }
          return;
        }

        const attemptRender = async () => {
          if (!mountedRef.current || renderAttemptsRef.current >= maxRenderAttempts) return;

          renderAttemptsRef.current++;
          console.log(`尝试渲染 (${renderAttemptsRef.current}/${maxRenderAttempts})`);

          const success = await renderDocument(contentRef.current!);
          
          if (mountedRef.current) {
            if (!success && renderAttemptsRef.current < maxRenderAttempts) {
              // 如果渲染失败且未达到最大尝试次数，则延迟后重试
              renderTimeoutRef.current = setTimeout(attemptRender, 1000);
            } else {
              if (!success) {
                setError(`渲染文档失败 (已尝试 ${renderAttemptsRef.current} 次)`);
              }
              setIsLoading(false);
            }
          }
        };

        // 开始首次渲染尝试
        attemptRender();

      } catch (error) {
        console.error('处理文档失败:', error);
        if (mountedRef.current) {
          setError('处理文档失败');
          setIsLoading(false);
        }
      }
    };

    initializeViewer();
  }, [content, fileUrl]);

  // 监听容器大小变化
  useLayoutEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mountedRef.current && contentRef.current) {
        renderDocument(contentRef.current);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-300px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 mt-2">正在加载文档...</span>
        {renderAttemptsRef.current > 0 && (
          <span className="text-sm text-gray-500 mt-1">
            渲染尝试: {renderAttemptsRef.current}/{maxRenderAttempts}
          </span>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">加载文档时出错:</div>
        <div>{error}</div>
        <div className="mt-4 text-sm text-gray-500">
          文件大小: {contentRef.current?.byteLength || '未知'}
        </div>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            if (contentRef.current) {
              renderAttemptsRef.current = 0;
              setIsLoading(true);
              setError(null);
              renderDocument(contentRef.current);
              setIsLoading(false);
            }
          }}
        >
          重试
        </button>
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