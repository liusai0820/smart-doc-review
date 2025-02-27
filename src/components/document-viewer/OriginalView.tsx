import { ScrollArea } from "@/components/ui/scroll-area";
import { Paragraph } from "@/lib/mock-data";

interface OriginalViewProps {
  paragraphs: Paragraph[];
}

export default function OriginalView({ paragraphs }: OriginalViewProps) {
  return (
    <ScrollArea className="h-[calc(100vh-260px)]">
      <div className="space-y-4 text-sm leading-7">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.id} className="text-gray-900">
            {paragraph.text}
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}