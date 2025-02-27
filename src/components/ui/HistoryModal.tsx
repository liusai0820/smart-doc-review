import { FC, useState } from "react";
import { X, Clock, FileText } from "lucide-react";

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  changeCount: number;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  // 示例历史记录数据
  const [historyItems] = useState<HistoryItem[]>([
    {
      id: "hist-1",
      title: "项目可行性分析报告",
      date: "2024-02-20 13:45",
      changeCount: 8
    },
    {
      id: "hist-2",
      title: "季度财务报表",
      date: "2024-02-15 10:30",
      changeCount: 5
    },
    {
      id: "hist-3",
      title: "产品开发规划",
      date: "2024-02-10 16:20",
      changeCount: 3
    }
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            历史审阅记录
          </h2>
          <button onClick={onClose} className="hover:bg-gray-100 rounded p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          {historyItems.length > 0 ? (
            <div className="space-y-3">
              {historyItems.map(item => (
                <div key={item.id} className="flex items-start border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="bg-blue-100 p-2 rounded mr-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>{item.date}</span>
                      <span>{item.changeCount}处修改</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>暂无历史记录</p>
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal; 