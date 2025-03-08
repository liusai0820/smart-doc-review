开始处理上传文件: Object
ApiDebugHelper.tsx:40 开始解析文件: 河套发展署关于“智能语音神经网络芯片异构集成的关键技术研究”项目整改的通知V1.docx Object
ApiDebugHelper.tsx:40 处理 DOCX 文件
ApiDebugHelper.tsx:40 文档解析结果: Object
ApiDebugHelper.tsx:40 创建新文档: Object
ApiDebugHelper.tsx:40 从 DOCX 提取的内容: Object
ApiDebugHelper.tsx:40 文档内容已提取: 河套发展署关于“智能语音神经网络芯片异构集成的关键技术研究”项目整改的通知V1 Object
ApiDebugHelper.tsx:40 文档内容: Object
ApiDebugHelper.tsx:40 生成提示词: Object
ApiDebugHelper.tsx:40 提示词生成结果: Object
ApiDebugHelper.tsx:40 提示词信息: Object
ApiDebugHelper.tsx:40 开始审阅文档: Object
ApiDebugHelper.tsx:40 文档内容信息: Object
ApiDebugHelper.tsx:40 提示词信息: Object
ApiDebugHelper.tsx:40 准备调用API: Object
ApiDebugHelper.tsx:40 从 DOCX 提取的内容: Object
ApiDebugHelper.tsx:40 开始生成文档洞察: Object
ApiDebugHelper.tsx:40 生成文档分析提示词: Object
ApiDebugHelper.tsx:40 提示词生成结果: Object
ApiDebugHelper.tsx:40 API原始响应数据: Object
ApiDebugHelper.tsx:40 API返回的原始内容: Object
ApiDebugHelper.tsx:40 原始输入: {
  "documentInfo": {
    "title": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"项目整改的通知V1",
    "overview": "该通知文档为行政公文，整体结构基本符合公文格式要求，但存在格式排版不规范、语言表达需要优化的问题。主要包括段落划分不清晰、标点符号使用不当、部分表述不够严谨等问题。建议对文档进行重新排版，并对部分表述进行调整，以提高公文的规范性和可读性。",
    "totalIssues": {
      "errors": 2,
      "warnings": 3,
      "suggestions": 3
    }
  },
  "reviewContent": [
    {
      "id": "p1",
      "originalText": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"项目整改的通知 深圳芯瑞华声科技有限公司：",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 70
          },
          "originalText": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"项目整改的通知 深圳芯瑞华声科技有限公司：",
          "newText": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"\n项目整改的通知\n\n深圳芯瑞华声科技有限公司：",
          "explanation": "公文标题与收文单位应分行显示，并添加适当的行间距",
          "severity": "warning",
          "category": "格式规范"
        }
      ]
    },
    {
      "id": "p2",
      "originalText": "根据《智能语音神经网络芯片异构集成的关键技术研究项目合同书》（合同编号：HTHZQSWS-KCCYB-2023040）（以下简称《项目合同书》）及项目管理机构里程碑考核结果",
      "changes": [
        {
          "type": "insert",
          "position": {
            "start": 0,
            "end": 0
          },
          "originalText": "",
          "newText": "    ",
          "explanation": "段落首行应当缩进2个汉字",
          "severity": "warning",
          "category": "格式规范"
        }
      ]
    },
    {
      "id": "p3",
      "originalText": "《河套深港科技创新合作区深圳园区科研及创新创业若支持措施若干配套文件》",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 32
          },
          "originalText": "若支持措施若干",
          "newText": "支持措施若干",
          "explanation": "文件名称中有错别字，删除多余的"若"字",
          "severity": "error",
          "category": "错别字"
        }
      ]
    },
    {
      "id": "p4",
      "originalText": "2025年1月X日",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 9
          },
          "originalText": "2025年1月X日",
          "newText": "2025年1月  日",
          "explanation": "公文中未确定具体日期时应使用空格，而非"X"",
          "severity": "warning",
          "category": "格式规范"
        }
      ]
    },
    {
      "id": "p5",
      "originalText": "（联系人：XXX；电话：XXX）",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 20
          },
          "originalText": "（联系人：XXX；电话：XXX）",
          "newText": "联系人：        电话：        ",
          "explanation": "联系方式应独立成行，并预留填写空间",
          "severity": "suggestion",
          "category": "格式规范"
        }
      ]
    }
  ]
}
ApiDebugHelper.tsx:40 清理后的 JSON: Object
ApiDebugHelper.tsx:40 初次解析失败: SyntaxError: Expected ',' or '}' after property value in JSON at position 38 (line 1 column 39)
    at JSON.parse (<anonymous>)
    at parseRobustJSON (improved-json-parser.ts:139:27)
    at reviewDocumentWithLLM (openrouter-api.ts:118:37)
    at async startReview (ReviewButton.tsx:119:28)
    at async handleTemplateSelect (ReviewButton.tsx:36:5)
ApiDebugHelper.tsx:40 修复后的 JSON: Object
intercept-console-error.js:52 JSON 解析失败: SyntaxError: Expected ',' or '}' after property value in JSON at position 38 (line 1 column 39)
    at JSON.parse (<anonymous>)
    at parseRobustJSON (improved-json-parser.ts:156:25)
    at reviewDocumentWithLLM (openrouter-api.ts:118:37)
    at async startReview (ReviewButton.tsx:119:28)
    at async handleTemplateSelect (ReviewButton.tsx:36:5)
error @ intercept-console-error.js:52Understand this errorAI
intercept-console-error.js:52 最后的 JSON 字符串: {
  "documentInfo": {
    "title": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"项目整改的通知V1",
    "overview": "该通知文档为行政公文，整体结构基本符合公文格式要求，但存在格式排版不规范、语言表达需要优化的问题。主要包括段落划分不清晰、标点符号使用不当、部分表述不够严谨等问题。建议对文档进行重新排版，并对部分表述进行调整，以提高公文的规范性和可读性。",
    "totalIssues": {
      "errors": 2,
      "warnings": 3,
      "suggestions": 3
    }
  },
  "reviewContent": [
    {
      "id": "p1",
      "originalText": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"项目整改的通知 深圳芯瑞华声科技有限公司：",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 70
          },
          "originalText": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"项目整改的通知 深圳芯瑞华声科技有限公司：",
          "newText": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"\n项目整改的通知\n\n深圳芯瑞华声科技有限公司：",
          "explanation": "公文标题与收文单位应分行显示，并添加适当的行间距",
          "severity": "warning",
          "category": "格式规范"
        }
      ]
    },
    {
      "id": "p2",
      "originalText": "根据《智能语音神经网络芯片异构集成的关键技术研究项目合同书》（合同编号：HTHZQSWS-KCCYB-2023040）（以下简称《项目合同书》）及项目管理机构里程碑考核结果",
      "changes": [
        {
          "type": "insert",
          "position": {
            "start": 0,
            "end": 0
          },
          "originalText": "",
          "newText": "    ",
          "explanation": "段落首行应当缩进2个汉字",
          "severity": "warning",
          "category": "格式规范"
        }
      ]
    },
    {
      "id": "p3",
      "originalText": "《河套深港科技创新合作区深圳园区科研及创新创业若支持措施若干配套文件》",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 32
          },
          "originalText": "若支持措施若干",
          "newText": "支持措施若干",
          "explanation": "文件名称中有错别字，删除多余的"若"字",
          "severity": "error",
          "category": "错别字"
        }
      ]
    },
    {
      "id": "p4",
      "originalText": "2025年1月X日",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 9
          },
          "originalText": "2025年1月X日",
          "newText": "2025年1月  日",
          "explanation": "公文中未确定具体日期时应使用空格，而非"X"",
          "severity": "warning",
          "category": "格式规范"
        }
      ]
    },
    {
      "id": "p5",
      "originalText": "（联系人：XXX；电话：XXX）",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 20
          },
          "originalText": "（联系人：XXX；电话：XXX）",
          "newText": "联系人：        电话：        ",
          "explanation": "联系方式应独立成行，并预留填写空间",
          "severity": "suggestion",
          "category": "格式规范"
        }
      ]
    }
  ]
}
error @ intercept-console-error.js:52Understand this errorAI
intercept-console-error.js:52 处理API响应失败: Error: JSON 解析失败: Expected ',' or '}' after property value in JSON at position 38 (line 1 column 39)
    at parseRobustJSON (improved-json-parser.ts:165:11)
    at reviewDocumentWithLLM (openrouter-api.ts:118:37)
    at async startReview (ReviewButton.tsx:119:28)
    at async handleTemplateSelect (ReviewButton.tsx:36:5)
error @ intercept-console-error.js:52Understand this errorAI
intercept-console-error.js:52 问题JSON字符串: {
  "documentInfo": {
    "title": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"项目整改的通知V1",
    "overview": "该通知文档为行政公文，整体结构基本符合公文格式要求，但存在格式排版不规范、语言表达需要优化的问题。主要包括段落划分不清晰、标点符号使用不当、部分表述不够严谨等问题。建议对文档进行重新排版，并对部分表述进行调整，以提高公文的规范性和可读性。",
    "totalIssues": {
      "errors": 2,
      "warnings": 3,
      "suggestions": 3
    }
  },
  "reviewContent": [
    {
      "id": "p1",
      "originalText": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"项目整改的通知 深圳芯瑞华声科技有限公司：",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 70
          },
          "originalText": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"项目整改的通知 深圳芯瑞华声科技有限公司：",
          "newText": "河套发展署关于"智能语音神经网络芯片异构集成的关键技术研究"\n项目整改的通知\n\n深圳芯瑞华声科技有限公司：",
          "explanation": "公文标题与收文单位应分行显示，并添加适当的行间距",
          "severity": "warning",
          "category": "格式规范"
        }
      ]
    },
    {
      "id": "p2",
      "originalText": "根据《智能语音神经网络芯片异构集成的关键技术研究项目合同书》（合同编号：HTHZQSWS-KCCYB-2023040）（以下简称《项目合同书》）及项目管理机构里程碑考核结果",
      "changes": [
        {
          "type": "insert",
          "position": {
            "start": 0,
            "end": 0
          },
          "originalText": "",
          "newText": "    ",
          "explanation": "段落首行应当缩进2个汉字",
          "severity": "warning",
          "category": "格式规范"
        }
      ]
    },
    {
      "id": "p3",
      "originalText": "《河套深港科技创新合作区深圳园区科研及创新创业若支持措施若干配套文件》",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 32
          },
          "originalText": "若支持措施若干",
          "newText": "支持措施若干",
          "explanation": "文件名称中有错别字，删除多余的"若"字",
          "severity": "error",
          "category": "错别字"
        }
      ]
    },
    {
      "id": "p4",
      "originalText": "2025年1月X日",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 9
          },
          "originalText": "2025年1月X日",
          "newText": "2025年1月  日",
          "explanation": "公文中未确定具体日期时应使用空格，而非"X"",
          "severity": "warning",
          "category": "格式规范"
        }
      ]
    },
    {
      "id": "p5",
      "originalText": "（联系人：XXX；电话：XXX）",
      "changes": [
        {
          "type": "replace",
          "position": {
            "start": 0,
            "end": 20
          },
          "originalText": "（联系人：XXX；电话：XXX）",
          "newText": "联系人：        电话：        ",
          "explanation": "联系方式应独立成行，并预留填写空间",
          "severity": "suggestion",
          "category": "格式规范"
        }
      ]
    }
  ]
}
error @ intercept-console-error.js:52Understand this errorAI
intercept-console-error.js:52 审阅文档失败: Error: 解析API响应失败: JSON 解析失败: Expected ',' or '}' after property value in JSON at position 38 (line 1 column 39)
    at reviewDocumentWithLLM (openrouter-api.ts:139:13)
    at async startReview (ReviewButton.tsx:119:28)
    at async handleTemplateSelect (ReviewButton.tsx:36:5)
error @ intercept-console-error.js:52Understand this errorAI
intercept-console-error.js:52 审阅失败: Error: 解析API响应失败: JSON 解析失败: Expected ',' or '}' after property value in JSON at position 38 (line 1 column 39)
    at reviewDocumentWithLLM (openrouter-api.ts:139:13)
    at async startReview (ReviewButton.tsx:119:28)
    at async handleTemplateSelect (ReviewButton.tsx:36:5)