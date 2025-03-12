import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFormatGuideByType } from '@/lib/document-format-guide';
import { Document } from '@/lib/mock-data';

interface FormatGuideButtonProps {
  document: Document | null;
}

const FormatGuideButton: React.FC<FormatGuideButtonProps> = ({ document }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  if (!document) return null;

  // 简单推断文档类型
  const getDocumentType = () => {
    const title = document.title.toLowerCase();

    if (title.includes('报告') || title.includes('总结')) return '工作报告';
    if (title.includes('通知') || title.includes('通报')) return '通知/通报';
    if (title.includes('请示')) return '请示文';
    if (title.includes('批复')) return '批复文';
    if (title.includes('纪要')) return '会议纪要';
    if (title.includes('项目') || title.includes('计划')) return '项目计划';
    if (title.includes('论文')) return '学术论文';
    
    return '公文通用';
  };

  // 获取格式指南
  const formatGuide = getFormatGuideByType(getDocumentType());

  // 渲染格式指南对话框
  const renderFormatGuideDialog = () => {
    if (!isGuideOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              {getDocumentType()}格式规范指南
            </h2>
            <Button variant="outline" onClick={() => setIsGuideOpen(false)}>
              关闭
            </Button>
          </div>
          
          <div className="p-6">
            {/* 公文格式指南 */}
            {formatGuide.commonElements && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-800">公文通用格式要素</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formatGuide.commonElements.map((element: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{element.name}</h4>
                          {element.required && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">必需</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{element.description}</p>
                        <div className="mt-2 text-xs">
                          <span className="text-gray-500">格式: </span>
                          <span className="text-gray-700">{element.format}</span>
                        </div>
                        {element.example && (
                          <div className="mt-1 text-xs">
                            <span className="text-gray-500">示例: </span>
                            <span className="text-gray-700">{element.example}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-800">公文类型及特点</h3>
                  <div className="space-y-3">
                    {formatGuide.documentTypes.slice(0, 5).map((type: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium">{type.type}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-gray-500">用途: </span>
                            <span className="text-gray-700">{type.purpose}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">行文方向: </span>
                            <span className="text-gray-700">{type.direction}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">格式特点: </span>
                          <span className="text-gray-700">{type.format}</span>
                        </div>
                      </div>
                    ))}
                    {formatGuide.documentTypes.length > 5 && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        (显示了5种公文类型，共{formatGuide.documentTypes.length}种)
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-800">公文行文规则</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {formatGuide.writingRules.map((rule: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium">{rule.rule}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                        <div className="mt-2">
                          <div className="text-xs text-gray-500">示例表述:</div>
                          <ul className="list-disc list-inside mt-1 text-xs text-gray-700">
                            {rule.examples.slice(0, 2).map((example: string, i: number) => (
                              <li key={i}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-800">公文语言要求</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formatGuide.languageRequirements.map((req: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium">{req.requirement}</h4>
                        <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                        {req.examples && (
                          <div className="mt-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-green-500">✓ </span>
                                <span className="text-gray-700">{req.examples.correct}</span>
                              </div>
                              <div>
                                <span className="text-red-500">✗ </span>
                                <span className="text-gray-700">{req.examples.incorrect}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* 项目文档格式指南 */}
            {formatGuide.proposalFormat && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-800">项目立项书格式规范</h3>
                  <div className="space-y-3">
                    {formatGuide.proposalFormat.map((section: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium">{section.section}</h4>
                        <div className="mt-2">
                          <div className="text-sm text-gray-500">包含内容:</div>
                          <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
                            {section.contents.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-800">项目总结报告格式规范</h3>
                  <div className="space-y-3">
                    {formatGuide.summaryReportFormat.map((section: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium">{section.section}</h4>
                        <div className="mt-2">
                          <div className="text-sm text-gray-500">包含内容:</div>
                          <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
                            {section.contents.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* 学术论文格式指南 */}
            {formatGuide.basicStructure && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-800">论文基本结构</h3>
                  <div className="space-y-3">
                    {formatGuide.basicStructure.map((section: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium">{section.section}</h4>
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-800">引用格式</h3>
                  <div className="space-y-3">
                    {formatGuide.citationFormats.map((format: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium">{format.format}</h4>
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">格式示例: </span>
                          <span className="text-gray-700 italic">{format.example}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => setIsGuideOpen(true)}
      >
        <BookOpen size={16} />
        <span>格式指南</span>
      </Button>
      
      {renderFormatGuideDialog()}
    </>
  );
}

export default FormatGuideButton;
      