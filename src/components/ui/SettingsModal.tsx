import { FC, useState } from "react";
import { X, Settings, Sliders, Key } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "");
  const [modelName, setModelName] = useState("google/gemini-2.0-pro-exp-02-05:free");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    // 这里只是模拟保存设置
    setNotification("设置已保存");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            系统设置
          </h2>
          <button onClick={onClose} className="hover:bg-gray-100 rounded p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* API设置 */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Key className="w-4 h-4 mr-1" />
              OpenRouter API设置
            </h3>
            <label className="block mb-2">
              <span className="text-sm text-gray-600">API密钥</span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm shadow-sm placeholder-gray-400
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="输入您的OpenRouter API密钥"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">模型选择</span>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="deepseek/deepseek-r1:free">DeepSeek Coder R1</option>
                <option value="google/gemini-2.0-pro-exp-02-05:free">Gemini 2.0 Pro</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </label>
          </div>
          
          {/* 界面设置 */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Sliders className="w-4 h-4 mr-1" />
              界面设置
            </h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={() => setIsDarkMode(!isDarkMode)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">深色模式</span>
            </label>
          </div>
          
          {/* 提示信息 */}
          {notification && (
            <div className="bg-green-50 text-green-700 p-3 rounded text-sm">
              {notification}
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 