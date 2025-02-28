import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { parseRobustJSON } from '@/lib/improved-json-parser';
import { reviewDocumentWithLLM } from '@/lib/openrouter-api';
import { Document } from '@/lib/mock-data';
import { extractDocumentContent } from '@/lib/document-content-extraction'; // 导入内容提取工具

interface DebugToolsProps {
  isOpen: boolean;
  onClose: () => void;
  document?: Document | null;
  documentContent?: string | null; // 从父组件传入的文档内容
}

const DebugTools: React.FC<DebugToolsProps> = ({ 
  isOpen, 
  onClose, 
  document, 
  documentContent 
}) => {
  const [apiResponse, setApiResponse] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '');
  const [extractedContent, setExtractedContent] = useState<string>(documentContent || '');
  const [modelName, setModelName] = useState(() => {
    // 优先从localStorage获取，如果没有则使用默认值
    if (typeof window !== 'undefined') {
      return localStorage.getItem('llm_model') || 'google/gemini-2.0-pro-exp-02-05:free';
    }
    return 'google/gemini-2.0-pro-exp-02-05:free';
  });

  // 如果调试功能被禁用，直接返回null
  if (process.env.NEXT_PUBLIC_ENABLE_DEBUG !== 'true') {
    return null;
  }

  // 处理模型变更
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setModelName(newModel);
    // 立即更新localStorage
    localStorage.setItem('llm_model', newModel);
  };

  // 测试API连接
  const testApiConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        }
      });
      
      if (response.ok) {
        setApiResponse('API连接测试成功!');
      } else {
        const errorData = await response.json();
        setError(`API连接测试失败: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      setError(`API连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 提取文档内容
  const extractContent = async () => {
    if (!document) {
      setError('没有文档可供提取内容');
      return;
    }
    
    try {
      const content = await extractDocumentContent(document);
      setExtractedContent(content);
      
      if (!content || content.length < 10) {
        setError('警告：提取的文档内容为空或太短');
      } else {
        setApiResponse(`成功提取文档内容: ${content.length}字符\n\n预览:\n${content.substring(0, 500)}...`);
      }
    } catch (error) {
      setError(`提取文档内容失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 测试审阅API
  const testReviewApi = async () => {
    if (!document) {
      setError('没有文档可供测试');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 优先使用extractedContent，其次是传入的documentContent
      const contentToUse = extractedContent || documentContent || await extractDocumentContent(document);
      
      if (!contentToUse || contentToUse.length < 10) {
        throw new Error('文档内容为空或太短，无法进行审阅');
      }
      
      // 生成测试提示词 - 仅使用简短的指令
      const testPrompt = `
您是一位专业的文档审阅专家。请审阅以下文档，提供总体评价和改进建议。
请以JSON格式返回结果，包含documentInfo和reviewContent字段。

文档标题: ${document.title}

文档内容:
---
${contentToUse}
---
      `;
      
      setApiResponse(`使用的文档内容: ${contentToUse.length}字符\n提示词长度: ${testPrompt.length}字符`);
      
      const result = await reviewDocumentWithLLM(document, apiKey, modelName, testPrompt);
      setApiResponse(JSON.stringify(result, null, 2));
      setParsedResult('API调用成功，解析结果已显示');
    } catch (error) {
      setError(`API审阅测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 测试JSON解析
  const testJsonParsing = () => {
    try {
      if (!apiResponse) {
        setError('没有JSON内容可供解析');
        return;
      }
      
      const result = parseRobustJSON(apiResponse);
      setParsedResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setError(`JSON解析测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex justify-between items-center">
            <CardTitle>调试工具</CardTitle>
            <Button variant="outline" onClick={onClose}>关闭</Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="document">
            <TabsList className="mb-4">
              <TabsTrigger value="document">文档内容</TabsTrigger>
              <TabsTrigger value="api">API测试</TabsTrigger>
              <TabsTrigger value="json">JSON解析测试</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
            </TabsList>
            
            <TabsContent value="document" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={extractContent}>
                  提取文档内容
                </Button>
                <span className="text-gray-500 text-sm my-auto">
                  {extractedContent ? `已提取 ${extractedContent.length} 字符` : '未提取内容'}
                </span>
              </div>
              
              {error && <div className="text-red-500 p-2 border border-red-300 rounded bg-red-50">{error}</div>}
              
              <div className="grid gap-4">
                <div>
                  <h3 className="font-medium mb-2">文档内容:</h3>
                  <div className="border rounded p-4 bg-gray-50 h-80 overflow-auto">
                    <pre className="text-xs whitespace-pre-wrap">
                      {extractedContent || '点击"提取文档内容"按钮获取内容'}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">文档信息:</h3>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    <div><strong>标题:</strong> {document?.title}</div>
                    <div><strong>段落数:</strong> {document?.paragraphs?.length || 0}</div>
                    <div><strong>状态:</strong> {document?.status}</div>
                    <div><strong>日期:</strong> {document?.date}</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testApiConnection} disabled={isLoading}>
                  测试API连接
                </Button>
                <Button onClick={testReviewApi} disabled={isLoading || !document}>
                  测试文档审阅API
                </Button>
                <span className="text-sm text-gray-500 my-auto">
                  {isLoading ? '请求中...' : ''}
                </span>
              </div>
              
              {error && <div className="text-red-500 p-2 border border-red-300 rounded bg-red-50">{error}</div>}
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">API响应:</h3>
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-80">
                  <pre className="text-xs whitespace-pre-wrap">{apiResponse || '无响应数据'}</pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="json" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testJsonParsing} disabled={!apiResponse}>
                  测试JSON解析
                </Button>
              </div>
              
              {error && <div className="text-red-500 p-2 border border-red-300 rounded bg-red-50">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">JSON输入:</h3>
                  <textarea
                    className="w-full h-80 p-2 border rounded font-mono text-xs"
                    value={apiResponse}
                    onChange={(e) => setApiResponse(e.target.value)}
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2">解析结果:</h3>
                  <div className="bg-gray-100 p-4 rounded overflow-auto h-80">
                    <pre className="text-xs whitespace-pre-wrap">{parsedResult || '无解析数据'}</pre>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">API密钥:</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="输入OpenRouter API密钥"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">模型名称:</label>
                <select 
                  value={modelName}
                  onChange={handleModelChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="google/gemini-2.0-pro-exp-02-05:free">Google Gemini 2.0 Pro</option>
                  <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
                </select>
              </div>
              
              <div className="mt-4">
                <Button onClick={() => {
                  // 使用localStorage存储设置
                  localStorage.setItem('openrouter_api_key', apiKey);
                  // 不需要再次存储modelName，因为在选择时已经存储
                  alert('设置已更新！');
                }}>
                  应用设置
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default DebugTools;