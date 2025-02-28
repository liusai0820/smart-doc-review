// 新建文件: src/lib/document-content-extraction.ts
// 这个文件帮助从各种文档格式中提取文本内容

import { Document } from "./types";
import { renderAsync } from "docx-preview";

/**
 * 从文档对象中提取文本内容
 * 确保返回非空的文本内容
 */
export async function extractDocumentContent(document: Document): Promise<string> {
  // 验证文档对象
  if (!document) {
    console.error('无效的文档对象');
    return '';
  }
  
  // 如果有 ArrayBuffer 类型的内容，尝试解析 docx 文件
  if (document.content instanceof ArrayBuffer) {
    try {
      // 创建一个临时的 div 元素来渲染 docx 内容
      const container = window.document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      window.document.body.appendChild(container);

      try {
        // 使用 docx-preview 渲染文档
        await renderAsync(document.content, container, container, {
          inWrapper: false,
          ignoreWidth: true,
          ignoreHeight: true,
          ignoreFonts: true,
          breakPages: false,
          useBase64URL: false
        });
        
        // 提取文本内容，移除多余的空白字符
        const textContent = container.innerText
          .replace(/[\r\n]+/g, '\n')  // 将多个换行符替换为单个
          .replace(/\s+/g, ' ')       // 将多个空格替换为单个
          .split('\n')                // 按换行符分割
          .map(line => line.trim())   // 修剪每行的空白
          .filter(line => line)       // 移除空行
          .join('\n\n');              // 用双换行重新连接
        
        console.log('从 DOCX 提取的内容:', {
          length: textContent.length,
          preview: textContent.substring(0, 100)
        });
        
        return textContent;
      } catch (error) {
        console.error('DOCX 解析失败:', error);
        throw new Error('无法解析 DOCX 文件内容');
      } finally {
        // 清理 DOM
        window.document.body.removeChild(container);
      }
    } catch (error) {
      console.error('解析 DOCX 文件失败:', error);
      throw new Error('DOCX 文件处理失败');
    }
  }
  
  // 如果没有 ArrayBuffer 内容，继续尝试从段落中提取
  // 验证段落数组
  if (!document.paragraphs || document.paragraphs.length === 0) {
    console.error('文档没有段落内容', {
      title: document.title,
      hasContent: !!document.content,
      contentType: document.content ? typeof document.content : 'undefined'
    });
    return '';
  }
  
  console.log('开始提取文档内容:', {
    title: document.title,
    paragraphCount: document.paragraphs.length,
    firstParagraphPreview: document.paragraphs[0]?.text?.substring(0, 50),
    hasContent: !!document.content,
    contentType: document.content ? typeof document.content : 'undefined'
  });
  
  // 提取和验证文本内容
  const paragraphTexts = document.paragraphs
    .map((p, index) => {
      if (!p) {
        console.warn(`段落 ${index} 为空`);
        return '';
      }
      
      const text = typeof p.text === 'string' ? p.text : '';
      console.log(`段落 ${index + 1} 内容:`, {
        length: text.length,
        preview: text.substring(0, 50),
        isString: typeof p.text === 'string',
        type: typeof p.text,
        hasText: 'text' in p,
        keys: Object.keys(p)
      });
      return text ? text.trim() : '';
    })
    .filter(text => text !== '');
  
  // 如果没有有效段落，尝试从文档的其他属性中提取内容
  if (paragraphTexts.length === 0) {
    console.warn('文档段落为空，尝试从其他属性提取内容', {
      title: document.title,
      hasContent: !!document.content,
      contentType: document.content ? typeof document.content : 'undefined',
      documentKeys: Object.keys(document)
    });
    
    // 如果还是没有内容，返回标题作为最小内容
    console.error('无法从文档中提取有效内容，只返回标题', {
      title: document.title,
      documentKeys: Object.keys(document)
    });
    return document.title || '文档内容为空';
  }
  
  // 将所有段落合并为一个字符串，用两个换行符分隔
  const content = paragraphTexts.join('\n\n');
  
  // 记录提取结果
  console.log(`成功从文档提取内容: ${document.title}`, {
    paragraphCount: paragraphTexts.length,
    contentLength: content.length,
    preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
    paragraphLengths: paragraphTexts.map(p => p.length)
  });
  
  return content;
}

/**
 * 处理流文件并提取文本内容的工具函数
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  // 纯文本文件
  if (fileType === 'txt') {
    return await file.text();
  }
  
  // Word文档
  if (fileType === 'docx') {
    // 如果有可用的docx解析库，可以在这里调用
    // 现在先返回文件名作为内容
    console.warn('DOCX解析尚未实现，只返回文件名');
    return `文件名: ${file.name}\n\n文件类型: DOCX文档\n\n请实现DOCX解析功能`;
  }
  
  // PDF文档
  if (fileType === 'pdf') {
    // 如果有可用的PDF解析库，可以在这里调用
    console.warn('PDF解析尚未实现，只返回文件名');
    return `文件名: ${file.name}\n\n文件类型: PDF文档\n\n请实现PDF解析功能`;
  }
  
  // 其他文件类型
  console.warn(`不支持的文件类型: ${fileType}，只返回文件名`);
  return `文件名: ${file.name}\n\n文件类型: ${fileType?.toUpperCase() || '未知'}\n\n请上传支持的文件类型`;
}