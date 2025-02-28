import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Bug, ArrowDown } from 'lucide-react';

/**
 * API调试辅助工具，用于在开发时监控API请求和响应
 * 在生产环境中可以隐藏
 */
const ApiDebugHelper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<{
    type: 'info' | 'error' | 'request' | 'response';
    message: string;
    details?: string;
    timestamp: Date;
  }[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);

  // 默认仅在开发环境中启用
  const isDev = process.env.NODE_ENV === 'development' || 
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

  // 是否启用调试
  const isEnabled = isDev || sessionStorage.getItem('enableApiDebug') === 'true';

  if (!isEnabled) {
    return null;
  }

  // 捕获所有控制台日志和错误
  useEffect(() => {
    if (!isEnabled) return;

    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // 覆盖console.log
    console.log = (...args: any[]) => {
      originalConsoleLog(...args);
      
      const message = args.map(arg => 
        typeof arg === 'object' 
          ? JSON.stringify(arg, null, 2) 
          : String(arg)
      ).join(' ');
      
      // 只捕获API相关日志
      if (message.includes('API') || 
          message.includes('审阅') || 
          message.includes('OpenRouter')) {
        setLogs(prev => [...prev, {
          type: 'info',
          message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          details: message,
          timestamp: new Date()
        }].slice(-50)); // 只保留最新的50条
      }
    };

    // 覆盖console.error
    console.error = (...args: any[]) => {
      originalConsoleError(...args);
      
      const message = args.map(arg => 
        typeof arg === 'object' 
          ? JSON.stringify(arg, null, 2) 
          : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, {
        type: 'error',
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        details: message,
        timestamp: new Date()
      }].slice(-50));
    };

    // 覆盖console.warn
    console.warn = (...args: any[]) => {
      originalConsoleWarn(...args);
      
      const message = args.map(arg => 
        typeof arg === 'object' 
          ? JSON.stringify(arg, null, 2) 
          : String(arg)
      ).join(' ');
      
      // 只捕获API相关警告
      if (message.includes('API') || 
          message.includes('审阅') || 
          message.includes('OpenRouter')) {
        setLogs(prev => [...prev, {
          type: 'info',
          message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          details: message,
          timestamp: new Date()
        }].slice(-50));
      }
    };

    // 捕获全局错误
    const handleGlobalError = (event: ErrorEvent) => {
      setLogs(prev => [...prev, {
        type: 'error',
        message: `全局错误: ${event.message}`,
        details: `${event.message}\n${event.filename}:${event.lineno}:${event.colno}`,
        timestamp: new Date()
      }].slice(-50));
    };

    // 捕获未处理的Promise错误
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setLogs(prev => [...prev, {
        type: 'error',
        message: `未处理的Promise错误: ${event.reason}`,
        details: String(event.reason),
        timestamp: new Date()
      }].slice(-50));
    };

    // 捕获fetch请求
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      // 只监控API请求
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input instanceof Request ? input.url : String(input);
      
      if (url.includes('openrouter.ai')) {
        try {
          const requestBody = init?.body ? JSON.parse(init.body as string) : undefined;
          
          setLogs(prev => [...prev, {
            type: 'request',
            message: `请求: ${url}`,
            details: JSON.stringify(requestBody, null, 2),
            timestamp: new Date()
          }].slice(-50));
          
          const response = await originalFetch(input, init);
          const clonedResponse = response.clone();
          
          try {
            const responseData = await clonedResponse.json();
            setLogs(prev => [...prev, {
              type: 'response',
              message: `响应: ${url} (${response.status})`,
              details: JSON.stringify(responseData, null, 2),
              timestamp: new Date()
            }].slice(-50));
          } catch (e) {
            setLogs(prev => [...prev, {
              type: 'response',
              message: `响应: ${url} (${response.status}) - 无法解析JSON`,
              details: String(e),
              timestamp: new Date()
            }].slice(-50));
          }
          
          return response;
        } catch (error) {
          setLogs(prev => [...prev, {
            type: 'error',
            message: `请求错误: ${url}`,
            details: String(error),
            timestamp: new Date()
          }].slice(-50));
          throw error;
        }
      }
      
      return originalFetch(input, init);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // 清理函数
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.fetch = originalFetch;
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isEnabled]);

  // 在启动时添加初始日志
  useEffect(() => {
    if (isEnabled) {
      setLogs([{
        type: 'info',
        message: '调试工具已启动',
        timestamp: new Date()
      }]);
      setIsOpen(true);
    }
  }, [isEnabled]);

  // 获取日志类型对应的样式
  const getLogStyle = (type: 'info' | 'error' | 'request' | 'response') => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'request':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'response':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // 获取时间戳字符串
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // 调试面板最小化时的浮动按钮
  if (isMinimized) {
    return (
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50 hover:bg-blue-600"
        onClick={() => setIsMinimized(false)}
        title="打开API调试面板"
      >
        <Bug size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-center bg-blue-500 text-white px-3 py-2 rounded-t-lg">
        <h3 className="text-sm font-medium flex items-center">
          <Bug size={16} className="mr-1" />
          API调试面板
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-blue-600 p-1 rounded"
            title="最小化"
          >
            <ArrowDown size={14} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-600 p-1 rounded"
            title="关闭"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50 max-h-80">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-4 text-sm">
            无API活动日志
          </div>
        ) : (
          logs.map((log, index) => (
            <div 
              key={index} 
              className={`text-xs p-2 rounded border ${getLogStyle(log.type)}`}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium flex items-center">
                  {log.type === 'error' && <AlertCircle size={12} className="mr-1 text-red-500" />}
                  {log.message}
                </div>
                <span className="text-gray-500 text-xxs ml-1">
                  {formatTime(log.timestamp)}
                </span>
              </div>
              {log.details && log.details !== log.message && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-xxs text-gray-500">详情</summary>
                  <pre className="mt-1 whitespace-pre-wrap text-xxs overflow-x-auto max-h-32 bg-white p-1 rounded">
                    {log.details}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="p-2 border-t border-gray-200 bg-gray-50 flex justify-between text-xs">
        <span className="text-gray-500">{logs.length} 条日志</span>
        <button 
          className="text-blue-500 hover:text-blue-700"
          onClick={() => setLogs([])}
        >
          清除日志
        </button>
      </div>
    </div>
  );
};

export default ApiDebugHelper;