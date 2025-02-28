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
      
      // 读取文件内容
      const fileContent = await file.arrayBuffer();
      
      // 创建临时URL
      const fileUrl = URL.createObjectURL(file);
      
      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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