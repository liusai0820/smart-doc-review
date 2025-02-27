import { FC, useEffect, useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

const Notification: FC<NotificationProps> = ({
  message,
  type,
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getBgColor = () => {
    switch (type) {
      case "success": return "bg-green-100 border-green-500 text-green-700";
      case "error": return "bg-red-100 border-red-500 text-red-700";
      default: return "bg-blue-100 border-blue-500 text-blue-700";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success": return <CheckCircle size={20} />;
      case "error": return <AlertCircle size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 max-w-xs rounded-lg border ${getBgColor()} shadow-md transition-all`}>
      <div className="mr-2">
        {getIcon()}
      </div>
      <div className="flex-1 text-sm">
        {message}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className="ml-2 p-1 hover:bg-gray-200 rounded-full"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification; 