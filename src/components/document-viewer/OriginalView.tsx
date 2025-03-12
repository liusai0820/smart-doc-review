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
          <p key={paragraph.id} className="text-gray-900" style={{
            fontWeight: paragraph.isHtml ? 'bold' : 'normal',
            fontStyle: paragraph.isTable ? 'italic' : 'normal',
            color: paragraph.isHtml ? '#333' : '#666',
            marginBottom: '1rem',
            lineHeight: '1.6',
          }}>
            {paragraph.text}
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}