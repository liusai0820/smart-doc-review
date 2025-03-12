import { Document, Change } from "@/lib/mock-data";
import { saveAs } from 'file-saver';
import * as docx from 'docx';

/**
 * 导出文档为Word格式(DOCX)
 * @param document 包含原始内容和修改的文档
 * @param includeChanges 是否包含修改建议
 * @param exportMode 导出模式: "original", "changes", "track"
 */
export async function exportToWord(
  document: Document,
  includeChanges: boolean = true,
  exportMode: "original" | "changes" | "track" = "track"
) {
  try {
    // 创建新的docx文档
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: generateDocxContent(document, includeChanges, exportMode)
        }
      ]
    });

    // 生成docx文件的buffer
    const buffer = await docx.Packer.toBlob(doc);
    
    // 使用file-saver保存文件
    saveAs(buffer, `${document.title}-审阅结果.docx`);

    return true;
  } catch (error) {
    console.error("导出Word文档失败:", error);
    return false;
  }
}

/**
 * 生成docx内容
 */
function generateDocxContent(
  document: Document,
  includeChanges: boolean,
  exportMode: "original" | "changes" | "track"
): docx.Paragraph[] {
  // 标题部分
  const paragraphs: docx.Paragraph[] = [
    new docx.Paragraph({
      text: document.title,
      heading: docx.HeadingLevel.HEADING_1,
      alignment: docx.AlignmentType.CENTER,
      spacing: {
        after: 200
      }
    })
  ];

  if (exportMode === "original") {
    // 只导出原始内容
    document.paragraphs.forEach(para => {
      paragraphs.push(
        new docx.Paragraph({
          children: [new docx.TextRun(para.text)],
          spacing: { after: 120 }
        })
      );
    });
  } else if (exportMode === "changes") {
    // 导出已应用所有修改的版本
    document.paragraphs.forEach(para => {
      let text = para.text;
      
      // 仅应用已接受的修改
      if (para.changes && para.changes.length > 0) {
        // 过滤出已接受的变更
        const acceptedChanges = para.changes.filter(change => change.accepted);
        // 按位置排序变更
        const sortedChanges = [...acceptedChanges].sort((a, b) => {
          const posA = a.original ? text.indexOf(a.original) : 0;
          const posB = b.original ? text.indexOf(b.original) : 0;
          return posB - posA; // 从后向前应用变更
        });
        
        // 应用变更
        sortedChanges.forEach(change => {
          if (change.type === 'replace' && change.original && change.new) {
            text = text.replace(change.original, change.new);
          } else if (change.type === 'deletion' && change.original) {
            text = text.replace(change.original, '');
          } else if (change.type === 'addition' && change.new) {
            text += ' ' + change.new;
          }
        });
      }
      
      paragraphs.push(
        new docx.Paragraph({
          children: [new docx.TextRun(text)],
          spacing: { after: 120 }
        })
      );
    });
  } else {
    // 使用修订模式显示所有修改
    document.paragraphs.forEach(para => {
      if (!para.changes || para.changes.length === 0) {
        // 无修改的段落直接添加
        paragraphs.push(
          new docx.Paragraph({
            children: [new docx.TextRun(para.text)],
            spacing: { after: 120 }
          })
        );
        return;
      }
      
      // 处理有修改的段落
      const textRuns: docx.TextRun[] = [];
      const currentText = para.text;
      let lastEndIndex = 0;
      
      // 按位置排序变更
      const sortedChanges = [...para.changes].sort((a, b) => {
        const posA = a.original ? currentText.indexOf(a.original) : currentText.length;
        const posB = b.original ? currentText.indexOf(b.original) : currentText.length;
        return posA - posB;
      });
      
      sortedChanges.forEach(change => {
        if (change.type === 'addition' && change.new) {
          if (lastEndIndex < currentText.length) {
            textRuns.push(new docx.TextRun({ text: currentText.substring(lastEndIndex) }));
          }
          textRuns.push(
            new docx.TextRun({
              text: change.new,
              color: "009900",
              highlight: "green"
            })
          );
          lastEndIndex = currentText.length;
          return;
        }
        
        const startIndex = change.original ? currentText.indexOf(change.original, lastEndIndex) : -1;
        if (startIndex === -1) return;
        
        // 添加修改前的文本
        if (startIndex > lastEndIndex) {
          textRuns.push(new docx.TextRun({ text: currentText.substring(lastEndIndex, startIndex) }));
        }
        
        const changeText = change.original || '';
        
        if (change.type === 'deletion') {
          textRuns.push(
            new docx.TextRun({
              text: changeText,
              strike: true,
              color: "FF0000",
              highlight: "red"
            })
          );
        } else if (change.type === 'replace' && change.new) {
          textRuns.push(
            new docx.TextRun({
              text: changeText,
              strike: true,
              color: "FF0000",
              highlight: "yellow"
            })
          );
          textRuns.push(
            new docx.TextRun({
              text: change.new,
              color: "009900",
              highlight: "green"
            })
          );
        }
        
        lastEndIndex = startIndex + changeText.length;
      });
      
      // 添加剩余文本
      if (lastEndIndex < currentText.length) {
        textRuns.push(new docx.TextRun({ text: currentText.substring(lastEndIndex) }));
      }
      
      paragraphs.push(
        new docx.Paragraph({
          children: textRuns,
          spacing: { after: 120 }
        })
      );
      
      // 如果includeChanges为true，添加修改原因
      if (includeChanges) {
        para.changes.forEach(change => {
          paragraphs.push(
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `[${change.severity.toUpperCase()}] ${change.explanation}`,
                  italics: true,
                  color: change.severity === 'error' ? 'FF0000' : 
                         change.severity === 'warning' ? 'FF9900' : '0000FF',
                  size: 20
                })
              ],
              spacing: { after: 120 },
              indent: { left: 720 } // 缩进
            })
          );
        });
      }
    });
  }
  
  return paragraphs;
}

/**
 * 导出文档为HTML
 */
export function exportToHtml(document: Document, includeChanges: boolean = true): string {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${document.title} - 审阅结果</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2rem; }
        .title { text-align: center; margin-bottom: 2rem; }
        .paragraph { margin-bottom: 1rem; }
        .deleted { text-decoration: line-through; color: red; background-color: #ffeeee; }
        .added { color: green; background-color: #eeffee; }
        .modified { color: blue; background-color: #eeeeff; }
        .change-explanation { margin-left: 2rem; color: #666; font-style: italic; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .error { color: red; }
        .warning { color: orange; }
        .info { color: blue; }
      </style>
    </head>
    <body>
      <h1 class="title">${document.title}</h1>
  `;

  document.paragraphs.forEach(para => {
    if (!para.changes || para.changes.length === 0) {
      // 无修改的段落
      html += `<p class="paragraph">${para.text}</p>`;
      return;
    }

    // 有修改的段落
    let paragraphHtml = '<p class="paragraph">';
    let parts: { text: string; change?: Change; type?: string }[] = [
      { text: para.text }
    ];

    // 按位置排序变更
    const sortedChanges = [...para.changes].sort((a, b) => {
      const posA = a.original ? para.text.indexOf(a.original) : para.text.length;
      const posB = b.original ? para.text.indexOf(b.original) : para.text.length;
      return posA - posB;
    });

    sortedChanges.forEach((change) => {
      const newParts: typeof parts = [];

      parts.forEach((part) => {
        if (part.change) {
          newParts.push(part);
          return;
        }

        if (change.type === 'addition') {
          newParts.push(part);
          // 将新增内容添加到段落末尾
          if (part === parts[parts.length - 1]) {
            newParts.push({ text: change.new || '', change, type: 'addition' });
          }
          return;
        }

        if (!change.original || part.text.indexOf(change.original) === -1) {
          newParts.push(part);
          return;
        }

        const index = part.text.indexOf(change.original);
        const before = part.text.substring(0, index);
        const after = part.text.substring(index + (change.original?.length || 0));

        if (before) {
          newParts.push({ text: before });
        }

        if (change.type === 'deletion') {
          newParts.push({ text: change.original, change, type: 'deletion' });
        } else if (change.type === 'replace' && change.new) {
          newParts.push({ text: change.original, change, type: 'deletion' });
          newParts.push({ text: change.new || '', change, type: 'addition' });
        }

        if (after) {
          newParts.push({ text: after });
        }
      });

      parts = newParts;
    });

    parts.forEach(part => {
      if (part.type === 'deletion') {
        paragraphHtml += `<span class="deleted">${part.text}</span>`;
      } else if (part.type === 'addition') {
        paragraphHtml += `<span class="added">${part.text}</span>`;
      } else {
        paragraphHtml += part.text;
      }
    });

    paragraphHtml += '</p>';
    html += paragraphHtml;

    // 添加修改原因
    if (includeChanges) {
      para.changes.forEach(change => {
        const severityClass = change.severity === 'error' ? 'error' : 
                              change.severity === 'warning' ? 'warning' : 'info';
        html += `<div class="change-explanation ${severityClass}">
                  [${change.severity.toUpperCase()}] ${change.explanation}
                </div>`;
      });
    }
  });

  html += `
    </body>
    </html>
  `;

  return html;
}

/**
 * 下载HTML文件
 */
export function downloadHtml(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${filename}.html`);
}

/**
 * 将HTML导出为PDF（前端实现）
 * 注意：这需要额外的库，如html2pdf.js或jsPDF
 */
export function exportToPdf(document: Document): void {
  // TODO: 实现PDF导出功能
  console.warn('PDF导出功能尚未实现', document.title);
}