import { FC, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import Notification from "./Notification";

interface FileUploadProps {
  onUploadComplete?: (fileName: string, fileContent?: ArrayBuffer, fileUrl?: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

const FileUpload: FC<FileUploadProps> = ({ onUploadComplete, onUploadStart, onUploadEnd }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 检查文件类型
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      setNotification({
        message: "只支持 .docx, .pdf 和 .txt 格式的文档",
        type: "error"
      });
      return;
    }

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      setNotification({
        message: "文件大小不能超过10MB",
        type: "error"
      });
      return;
    }

    try {
      onUploadStart?.();
      setIsUploading(true);
      
      // 对于文本文件，先尝试检测编码
      if (file.name.endsWith('.txt')) {
        // 读取文件的前4KB来检测编码
        const sampleBuffer = await file.slice(0, 4096).arrayBuffer();
        const firstBytes = new Uint8Array(sampleBuffer);
        
        console.log('检测文件编码:', {
          fileName: file.name,
          fileSize: file.size,
          sampleBytes: Array.from(firstBytes.slice(0, 4)).map(b => b.toString(16))
        });
        
        // 检测文件编码
        let encoding = 'utf-8';
        if (firstBytes[0] === 0xEF && firstBytes[1] === 0xBB && firstBytes[2] === 0xBF) {
          encoding = 'utf-8';
        } else if (firstBytes[0] === 0xFF && firstBytes[1] === 0xFE) {
          encoding = 'utf-16le';
        } else if (firstBytes[0] === 0xFE && firstBytes[1] === 0xFF) {
          encoding = 'utf-16be';
        } else {
          // 尝试检测是否是 GB18030
          try {
            const decoder = new TextDecoder('gb18030');
            const sample = decoder.decode(sampleBuffer);
            const invalidCharCount = (sample.match(/\uFFFD/g) || []).length;
            if (invalidCharCount < sample.length * 0.1) {
              encoding = 'gb18030';
            }
          } catch (error) {
            console.warn('GB18030 编码检测失败:', error);
          }
        }
        
        console.log('检测到的文件编码:', encoding);
      }
      
      // 读取完整文件内容
      const fileContent = await file.arrayBuffer();
      
      // 创建临时URL
      const fileUrl = URL.createObjectURL(file);
      
      setNotification({
        message: `文件 "${file.name}" 上传成功`,
        type: "success"
      });
      
      if (onUploadComplete) {
        onUploadComplete(file.name, fileContent, fileUrl);
      }
    } catch (err) {
      console.error("上传失败:", err);
      setNotification({
        message: "文件上传失败，请重试",
        type: "error"
      });
    } finally {
      setIsUploading(false);
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadEnd?.();
    }
  };

  return (
    <>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        accept=".docx,.pdf,.txt"
        onChange={handleFileChange}
      />
      <Button
        onClick={handleButtonClick}
        className="flex gap-1 items-center"
        size="sm"
        disabled={isUploading}
      >
        <UploadCloud size={16} className={isUploading ? "animate-bounce" : ""} />
        <span>{isUploading ? "上传中..." : "上传文档"}</span>
      </Button>
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default FileUpload; 