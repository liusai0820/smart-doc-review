import React from 'react';
import { Check, X, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Change } from '@/lib/types';

interface WordStyleReviewBubbleProps {
  change: Change;
  onAccept: () => void;
  onReject: () => void;
  isVisible: boolean;
}

const WordStyleReviewBubble: React.FC<WordStyleReviewBubbleProps> = ({
  change,
  onAccept,
  onReject,
  isVisible
}) => {
  if (!isVisible) return null;
  
  // 获取修改类型的标签
  const getChangeTypeLabel = () => {
    switch (change.type) {
      case 'replace': return '替换';
      case 'deletion': return '删除';
      case 'addition': return '添加';
      default: return '修改';
    }
  };
  
  // 获取不同严重性的样式和图标
  const getSeverityInfo = (severity: string) => {
    switch (severity) {
      case 'error':
        return {
          icon: <AlertCircle size={16} className="text-red-500" />,
          label: '错误',
          color: 'border-red-200 bg-red-50'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={16} className="text-yellow-500" />,
          label: '警告',
          color: 'border-yellow-200 bg-yellow-50'
        };
      default:
        return {
          icon: <Info size={16} className="text-blue-500" />,
          label: '建议',
          color: 'border-blue-200 bg-blue-50'
        };
    }
  };
  
  const severityInfo = getSeverityInfo(change.severity);
  
  return (
    <div 
      className={`shadow-lg border rounded-lg overflow-hidden ${severityInfo.color}`}
      style={{ 
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px',
        width: '320px',
        maxWidth: 'calc(100vw - 40px)'
      }}
    >
      {/* 标题区域 */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        change.severity === 'error' ? 'border-red-200 bg-red-100' :
        change.severity === 'warning' ? 'border-yellow-200 bg-yellow-100' :
        'border-blue-200 bg-blue-100'
      }`}>
        <div className="flex items-center gap-1.5">
          {severityInfo.icon}
          <span className="font-medium text-sm">{severityInfo.label}: {getChangeTypeLabel()}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReject();
            }}
            className="p-1 rounded-full hover:bg-white/30"
            title="拒绝修改"
          >
            <X size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
            className="p-1 rounded-full hover:bg-white/30"
            title="接受修改"
          >
            <Check size={14} />
          </button>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="p-3">
        {change.type === 'replace' && (
          <>
            <div className="text-xs text-gray-500 mb-1">原文:</div>
            <div className="text-sm line-through bg-red-50 p-1.5 rounded mb-2 border border-red-100">{change.original}</div>
            <div className="text-xs text-gray-500 mb-1">修改为:</div>
            <div className="text-sm bg-green-50 p-1.5 rounded border border-green-100">{change.new}</div>
          </>
        )}
        {change.type === 'deletion' && (
          <>
            <div className="text-xs text-gray-500 mb-1">删除内容:</div>
            <div className="text-sm line-through bg-red-50 p-1.5 rounded border border-red-100">{change.original}</div>
          </>
        )}
        {change.type === 'addition' && (
          <>
            <div className="text-xs text-gray-500 mb-1">添加内容:</div>
            <div className="text-sm bg-green-50 p-1.5 rounded border border-green-100">{change.new}</div>
          </>
        )}
        
        <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
          {change.explanation}
        </div>
        
        <div className="mt-3 flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onReject();
            }}
          >
            <X className="h-3 w-3 mr-1" />
            拒绝
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 px-2 text-xs border-green-200 text-green-600 hover:bg-green-50"
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
          >
            <Check className="h-3 w-3 mr-1" />
            接受
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WordStyleReviewBubble;