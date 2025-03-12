import { useState, useEffect } from "react";
import { X, BookOpen, Tag, CheckCircle2, HelpCircle } from "lucide-react";
import { ReviewTemplate, getTemplatesByCategory, recommendTemplate } from "@/lib/review-templates";
import { Document } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getFormatGuideByType } from "@/lib/document-format-guide"; // 导入格式指南函数

interface TemplateSelectionDialogProps {
  isOpen: boolean;
  document: Document | null;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export default function TemplateSelectionDialog({
  isOpen,
  document,
  onClose,
  onSelectTemplate
}: TemplateSelectionDialogProps) {
  const [activeTab, setActiveTab] = useState("recommended");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [categorizedTemplates, setCategorizedTemplates] = useState<Record<string, ReviewTemplate[]>>({});
  const [recommendedTemplateId, setRecommendedTemplateId] = useState<string>("");
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [formatGuide, setFormatGuide] = useState<any>(null);

  useEffect(() => {
    if (document && isOpen) {
      // 获取按类别分组的模板
      setCategorizedTemplates(getTemplatesByCategory());
      
      // 根据文档内容推荐模板
      const docContent = document.paragraphs.map(p => p.text).join(" ");
      const recommended = recommendTemplate(document.title, docContent);
      setRecommendedTemplateId(recommended);
      setSelectedTemplateId(recommended);
      
      // 获取对应的格式指南
      const template = categorizedTemplates[recommendTemplate(document.title, docContent)];
      if (template) {
        const guide = getFormatGuideByType(template.name);
        setFormatGuide(guide);
      }
    }
  }, [document, isOpen]);

  // 当选择的模板改变时，更新格式指南
  useEffect(() => {
    if (selectedTemplateId && Object.keys(categorizedTemplates).length > 0) {
      // 查找选择的模板
      const selectedTemplate = Object.values(categorizedTemplates)
        .flat()
        .find(template => template.id === selectedTemplateId);
      
      if (selectedTemplate) {
        const guide = getFormatGuideByType(selectedTemplate.name);
        setFormatGuide(guide);
      }
    }
  }, [selectedTemplateId, categorizedTemplates]);

  if (!isOpen || !document) return null;

  const handleConfirm = () => {
    if (selectedTemplateId) {
      onSelectTemplate(selectedTemplateId);
      onClose();
    }
  };

  // 渲染格式指南
  const renderFormatGuide = () => {
    if (!formatGuide) return <p>没有找到对应的格式指南</p>;

    if (formatGuide.commonElements) {
      // 公文格式指南
      return (
        <div className="p-4 bg-gray-50 rounded-lg border max-h-96 overflow-y-auto">
          <h3 className="font-medium text-lg mb-3">公文格式指南</h3>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-gray-700">公文通用格式要素</h4>
            <div className="space-y-2">
              {formatGuide.commonElements.slice(0, 5).map((element: any, index: number) => (
                <div key={index} className="p-2 bg-white rounded border">
                  <div className="flex justify-between">
                    <span className="font-medium">{element.name}</span>
                    {element.required && <span className="text-red-500 text-xs">必需</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{element.description}</p>
                  {element.example && (
                    <p className="text-xs text-gray-500 mt-1">示例: {element.example}</p>
                  )}
                </div>
              ))}
              {formatGuide.commonElements.length > 5 && (
                <p className="text-xs text-gray-500 text-center mt-1">
                  +还有{formatGuide.commonElements.length - 5}个要素 (点击查看格式指南查看更多)
                </p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-gray-700">公文语言要求</h4>
            <div className="space-y-2">
              {formatGuide.languageRequirements && formatGuide.languageRequirements.slice(0, 3).map((req: any, index: number) => (
                <div key={index} className="p-2 bg-white rounded border">
                  <span className="font-medium">{req.requirement}</span>
                  <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (formatGuide.basicStructure) {
      // 学术论文格式指南
      return (
        <div className="p-4 bg-gray-50 rounded-lg border max-h-96 overflow-y-auto">
          <h3 className="font-medium text-lg mb-3">学术论文格式指南</h3>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-gray-700">论文基本结构</h4>
            <div className="space-y-2">
              {formatGuide.basicStructure.slice(0, 5).map((section: any, index: number) => (
                <div key={index} className="p-2 bg-white rounded border">
                  <span className="font-medium">{section.section}</span>
                  <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (formatGuide.proposalFormat) {
      // 项目文档格式指南
      return (
        <div className="p-4 bg-gray-50 rounded-lg border max-h-96 overflow-y-auto">
          <h3 className="font-medium text-lg mb-3">项目文档格式指南</h3>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-gray-700">项目立项书格式</h4>
            <div className="space-y-2">
              {formatGuide.proposalFormat.slice(0, 3).map((section: any, index: number) => (
                <div key={index} className="p-2 bg-white rounded border">
                  <span className="font-medium">{section.section}</span>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {section.contents.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    return <p>无法识别的格式指南类型</p>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            选择审阅模板
          </h2>
          <button onClick={onClose} className="hover:bg-gray-100 rounded p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-medium mb-1">当前文档</h3>
            <div className="bg-gray-50 p-3 rounded-md border">
              <p className="font-medium">{document.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                共 {document.paragraphs.length} 个段落 · {document.date}
              </p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="recommended">推荐模板</TabsTrigger>
              <TabsTrigger value="all">所有模板</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommended" className="space-y-4">
              {recommendedTemplateId && categorizedTemplates && 
               Object.values(categorizedTemplates).flat().map(template => {
                if (template.id === recommendedTemplateId) {
                  return (
                    <div 
                      key={template.id}
                      className="border border-blue-200 bg-blue-50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{template.name}</h3>
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              推荐
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                        <CheckCircle2 className="text-blue-500 h-5 w-5" />
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1 flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          重点审阅领域
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.focusAreas.map(area => (
                            <span 
                              key={area} 
                              className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-blue-600"
                        onClick={() => setShowFormatGuide(!showFormatGuide)}
                      >
                        <HelpCircle className="h-4 w-4 mr-1" />
                        {showFormatGuide ? "隐藏格式指南" : "查看格式指南"}
                      </Button>
                      
                      {showFormatGuide && (
                        <div className="mt-3">
                          {renderFormatGuide()}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
              
              <p className="text-sm text-gray-500">
                根据文档内容，我们推荐使用上述模板进行审阅。您也可以切换到&quot;所有模板&quot;选择其他模板。
              </p>
            </TabsContent>
            
            <TabsContent value="all">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                <RadioGroup 
                  value={selectedTemplateId} 
                  onValueChange={setSelectedTemplateId}
                >
                  {Object.entries(categorizedTemplates).map(([category, templates]) => (
                    <div key={category} className="mb-4">
                      <h3 className="font-medium text-sm text-gray-500 mb-2">{category}</h3>
                      <div className="space-y-2">
                        {templates.map(template => (
                          <div 
                            key={template.id}
                            className={`border rounded-lg p-3 ${
                              selectedTemplateId === template.id 
                                ? 'border-blue-200 bg-blue-50' 
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <RadioGroupItem 
                              value={template.id} 
                              id={template.id}
                              className="sr-only"
                            />
                            <Label 
                              htmlFor={template.id}
                              className="flex items-start cursor-pointer"
                            >
                              <div className="h-5 w-5 mt-0.5 mr-2">
                                {selectedTemplateId === template.id ? (
                                  <CheckCircle2 className="text-blue-500 h-5 w-5" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border border-gray-300"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">
                                  {template.name}
                                  {template.id === recommendedTemplateId && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                      推荐
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {template.focusAreas.slice(0, 3).map(area => (
                                    <span 
                                      key={area} 
                                      className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-full"
                                    >
                                      {area}
                                    </span>
                                  ))}
                                  {template.focusAreas.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{template.focusAreas.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {selectedTemplateId && (
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600"
                    onClick={() => setShowFormatGuide(!showFormatGuide)}
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    {showFormatGuide ? "隐藏格式指南" : "查看格式指南"}
                  </Button>
                  
                  {showFormatGuide && (
                    <div className="mt-3">
                      {renderFormatGuide()}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="border-t p-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTemplateId}
          >
            使用此模板
          </Button>
        </div>
      </div>
    </div>
  );
}