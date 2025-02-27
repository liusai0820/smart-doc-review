import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileDown, FilePlus, FileText } from "lucide-react";
import { Document } from "@/lib/mock-data";
import { exportToWord, exportToHtml, downloadHtml } from "@/lib/document-export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
  document: Document | null;
  isLoading?: boolean;
}

export default function ExportButton({ document, isLoading = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportWord = async (mode: "original" | "changes" | "track") => {
    if (!document || isLoading || isExporting) return;
    
    setIsExporting(true);
    try {
      await exportToWord(document, true, mode);
    } catch (error) {
      console.error("导出Word文档失败:", error);
      alert("导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHtml = () => {
    if (!document || isLoading || isExporting) return;
    
    setIsExporting(true);
    try {
      const html = exportToHtml(document, true);
      downloadHtml(html, `${document.title}-审阅结果`);
    } catch (error) {
      console.error("导出HTML失败:", error);
      alert("导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  if (!document) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          disabled={isLoading || isExporting}
        >
          <Download size={16} className={isExporting ? "animate-bounce" : ""} />
          <span>{isExporting ? "导出中..." : "导出文档"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>选择导出格式</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExportWord("track")}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Word文档 (修订模式)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportWord("changes")}>
          <FilePlus className="mr-2 h-4 w-4" />
          <span>Word文档 (应用所有修改)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportWord("original")}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Word文档 (原始内容)</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportHtml}>
          <FileDown className="mr-2 h-4 w-4" />
          <span>HTML文档</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}