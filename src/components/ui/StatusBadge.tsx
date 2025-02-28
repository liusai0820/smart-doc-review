import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "completed" | "in_progress" | "pending";
}

const statusColors = {
  completed: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 drop-shadow-sm",
  in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 drop-shadow-sm",
  pending: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 drop-shadow-sm"
} as const;

const statusLabels = {
  completed: "已完成",
  in_progress: "进行中",
  pending: "待审阅"
} as const;

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`px-2 py-1 font-medium smooth-transition ${statusColors[status]}`}
    >
      {statusLabels[status]}
    </Badge>
  );
}