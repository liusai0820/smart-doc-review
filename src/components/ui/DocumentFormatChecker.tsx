import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document } from '@/lib/mock-data';
import { getFormatGuideByType } from '@/lib/document-format-guide';
import { Progress } from '@/components/ui/progress';

interface DocumentFormatCheckerProps {
  document: Document | null;
}

type FormatCheckResult = {
  element: string;
  found: boolean;
  text?: string;
  position?: number;
  required: boolean;
};

const DocumentFormatChecker: React.FC<DocumentFormatCheckerProps> = ({ document }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResults, setCheckResults] = useState<FormatCheckResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [score, setScore] = useState(0);

  // 推断文档类型
  const detectDocumentType = () => {
    if (!document) return '';
    
    const title = document.title.toLowerCase();
    const content = document.paragraphs.map(p => p.text).join(' ').toLowerCase();
    
    if (title.includes('通知') || content.match(/现(将)?通知如下|特此通知/)) {
      return '通知';
    }
    if (title.includes('请示') || content.match(/请批示|请批复|请审批/)) {
      return '请示';
    }
    if (title.includes('报告') || content.match(/特此报告|现将.*情况报告如下/)) {
      return '报告';
    }
    if (title.includes('批复') || content.match(/经研究，(现)?批复如下|特此批复/)) {
      return '批复';
    }
    if (title.includes('纪要') || content.match(/会议时间|参会人员|主持人|会议决定/)) {
      return '会议纪要';
    }
    if (title.includes('决定') || content.match(/经研究，(现)?决定|特此决定/)) {
      return '决定';
    }
    
    return '公文通用';
  };

  // 检查公文格式
  const checkDocumentFormat = () => {
    if (!document) return;
    
    setIsChecking(true);
    setShowResults(true);
    
    // 检测文档类型
    const type = detectDocumentType();
    setDocumentType(type);
    
    // 获取格式指南
    const formatGuide = getFormatGuideByType(type);
    if (!formatGuide || !formatGuide.commonElements) {
      setIsChecking(false);
      return;
    }
    
    // 合并所有段落文本，以便于搜索
    const fullText = document.paragraphs.map(p => p.text).join('\n');
    
    // 检查各个格式要素
    const results: FormatCheckResult[] = formatGuide.commonElements.map(element => {
      const elementName = element.name;
      const required = element.required;
      
      // 根据不同要素类型进行检查
      switch (elementName) {
        case "发文机关标志":
          // 检查文本开头是否有机关名称
          const orgMatch = fullText.match(/^(.+?)(?:\n|$)/);
          return {
            element: elementName,
            found: !!orgMatch,
            text: orgMatch ? orgMatch[1] : undefined,
            position: 0,
            required
          };
          
        case "发文字号":
          // 检查是否有类似"XX〔20XX〕XX号"的格式
          const codeMatch = fullText.match(/[a-zA-Z\u4e00-\u9fa5]+[〔［\[]?20\d{2}[〕］\]]?[a-zA-Z\u4e00-\u9fa5\d]+号/);
          return {
            element: elementName,
            found: !!codeMatch,
            text: codeMatch ? codeMatch[0] : undefined,
            position: codeMatch ? fullText.indexOf(codeMatch[0]) : undefined,
            required
          };
          
        case "标题":
          // 检查是否有居中的粗体文本行
          const titleMatch = document.paragraphs.find(p => 
            p.text.includes('strong') || 
            p.text.includes('h1') || 
            p.text.includes('h2') ||
            p.text.includes('font-weight: bold')
          );
          return {
            element: elementName,
            found: !!titleMatch,
            text: titleMatch ? titleMatch.text.replace(/<[^>]*>/g, '') : undefined,
            position: titleMatch ? document.paragraphs.indexOf(titleMatch) : undefined,
            required
          };
          
        case "主送机关":
          // 检查是否有冒号的行，且紧跟在标题后
          const recipientMatch = fullText.match(/^(.+?)[:：](.+?)(?:\n|$)/m);
          return {
            element: elementName,
            found: !!recipientMatch,
            text: recipientMatch ? recipientMatch[0] : undefined,
            position: recipientMatch ? fullText.indexOf(recipientMatch[0]) : undefined,
            required
          };
          
        case "正文":
          // 正文总是存在的
          return {
            element: elementName,
            found: true,
            text: "文档包含正文内容",
            required
          };
          
        case "附件":
          // 检查是否有"附件"字样
          const attachmentMatch = fullText.match(/附件[：:]\s*.+/);
          return {
            element: elementName,
            found: !!attachmentMatch,
            text: attachmentMatch ? attachmentMatch[0] : undefined,
            position: attachmentMatch ? fullText.indexOf(attachmentMatch[0]) : undefined,
            required
          };
          
        case "发文机关署名":
          // 检查是否有右对齐的机关名称
          const signatureMatch = fullText.match(/(.{2,10}(?:党委|党组|人民政府|委员会|办公室|局|厅|部|院))\s*\n/);
          return {
            element: elementName,
            found: !!signatureMatch,
            text: signatureMatch ? signatureMatch[1] : undefined,
            position: signatureMatch ? fullText.indexOf(signatureMatch[0]) : undefined,
            required
          };
          
        case "成文日期":
          // 检查是否有日期格式
          const dateMatch = fullText.match(/20\d{2}年\d{1,2}月\d{1,2}日/);
          return {
            element: elementName,
            found: !!dateMatch,
            text: dateMatch ? dateMatch[0] : undefined,
            position: dateMatch ? fullText.indexOf(dateMatch[0]) : undefined,
            required
          };
          
        case "抄送机关":
          // 检查是否有"抄送"字样
          const ccMatch = fullText.match(/抄送[：:]\s*.+/);
          return {
            element: elementName,
            found: !!ccMatch,
            text: ccMatch ? ccMatch[0] : undefined,
            position: ccMatch ? fullText.indexOf(ccMatch[0]) : undefined,
            required
          };
          
        default:
          // 其他要素，简单检查是否包含相关字样
          const defaultMatch = fullText.includes(elementName);
          return {
            element: elementName,
            found: defaultMatch,
            required
          };
      }
    });
    
    // 设置检查结果
    setCheckResults(results);
    
    // 计算得分
    const totalRequired = results.filter(r => r.required).length;
    const foundRequired = results.filter(r => r.required && r.found).length;
    const totalOptional = results.filter(r => !r.required).length;
    const foundOptional = results.filter(r => !r.required && r.found).length;
    
    // 计算得分 (必要元素占80分，可选元素占20分)
    const requiredScore = totalRequired > 0 ? (foundRequired / totalRequired) * 80 : 80;
    const optionalScore = totalOptional > 0 ? (foundOptional / totalOptional) * 20 : 20;
    setScore(Math.round(requiredScore + optionalScore));
    
    setIsChecking(false);
  };

  // 获取分数等级和颜色
  const getScoreLevel = () => {
    if (score >= 90) return { level: "优秀", color: "text-green-500" };
    if (score >= 80) return { level: "良好", color: "text-blue-500" };
    if (score >= 60) return { level: "合格", color: "text-yellow-500" };
    return { level: "不合格", color: "text-red-500" };
  };

  if (!document) return null;

  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <FileText size={16} className="mr-2" />
          公文格式检查
        </h3>
        <div className="flex items-center gap-2">
          {!isChecking && checkResults.length > 0 && (
            <div className="flex items-center">
              <span className="mr-2">格式评分:</span>
              <span className={`font-medium ${getScoreLevel().color}`}>
                {score} ({getScoreLevel().level})
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={checkDocumentFormat}
            disabled={isChecking}
          >
            {isChecking ? "检查中..." : checkResults.length > 0 ? "重新检查" : "检查格式"}
          </Button>
          {checkResults.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8"
              onClick={() => setShowResults(!showResults)}
            >
              {showResults ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          )}
        </div>
      </div>
      
      {isChecking && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">正在检查文档格式...</span>
            <span className="text-sm text-gray-500">50%</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>
      )}
      
      {!isChecking && showResults && checkResults.length > 0 && (
        <div className="p-4">
          <div className="mb-4">
            <h4 className="font-medium mb-2">检测到的文档类型: {documentType}</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    score >= 90 ? 'bg-green-500' : 
                    score >= 80 ? 'bg-blue-500' : 
                    score >= 60 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
              <span className={`font-medium ${getScoreLevel().color}`}>
                {score}分
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">公文格式要素检查结果:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checkResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-3 ${
                    result.found ? 'bg-green-50 border-green-200' : 
                    result.required ? 'bg-red-50 border-red-200' : 
                    'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {result.found ? (
                        <CheckCircle size={16} className="text-green-500 mr-2" />
                      ) : (
                        <AlertTriangle size={16} className={result.required ? "text-red-500 mr-2" : "text-yellow-500 mr-2"} />
                      )}
                      <span className="font-medium">{result.element}</span>
                    </div>
                    {result.required && (
                      <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">必需</span>
                    )}
                  </div>
                  
                  {result.text && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">检测到: </span>
                      <span className="text-gray-700">{result.text}</span>
                    </div>
                  )}
                  
                  {!result.found && (
                    <div className="mt-2 text-sm text-gray-600">
                      {result.required ? 
                        "未检测到此必需要素，建议添加" : 
                        "未检测到此要素，可以考虑添加"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 flex items-center mb-2">
              <AlertTriangle size={16} className="mr-2" />
              格式检查说明
            </h4>
            <p className="text-sm text-blue-700">
              此检查仅作为参考，由于文档格式多样化，可能无法100%准确识别所有格式要素。
              建议结合格式指南手动检查，确保公文格式符合规范要求。检查结果仅供参考，不代替人工审核。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentFormatChecker;