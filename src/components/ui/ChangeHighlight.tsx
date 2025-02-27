import React, { useState } from "react";
import { Change } from "@/lib/mock-data";

interface ChangeHighlightProps {
  children: React.ReactNode;
  type?: string;
  change?: Change;
}

export default function ChangeHighlight({ children, type, change }: ChangeHighlightProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!type || !change) {
    return <>{children}</>;
  }

  const getTypeStyles = () => {
    switch (type) {
      case "deletion":
        return "deleted-text";
      case "addition":
        return "added-text";
      case "replace":
        return "modified-text";
      default:
        return "";
    }
  };

  return (
    <span
      className={`relative ${getTypeStyles()}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
          <div className="font-semibold mb-1">
            {type === "addition"
              ? "新增内容"
              : type === "deletion"
              ? "删除内容"
              : "内容变更"}
          </div>
          <div>{change.explanation}</div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 rotate-45 bg-gray-900"></div>
        </div>
      )}
    </span>
  );
}