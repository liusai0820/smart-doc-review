import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "completed" | "in_progress" | "pending";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          label: "已完成",
          variant: "success" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-100",
        };
      case "in_progress":
        return {
          label: "进行中",
          variant: "warning" as const,
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        };
      case "pending":
        return {
          label: "待审阅",
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        };
      default:
        // 确保总是返回一个默认值
        return {
          label: "未知状态",
          variant: "default" as const,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}