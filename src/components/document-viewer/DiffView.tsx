import { ScrollArea } from "@/components/ui/scroll-area";
import { Paragraph, Change } from "@/lib/mock-data";
import ChangeHighlight from "../ui/ChangeHighlight";

interface DiffViewProps {
  paragraphs: Paragraph[];
}

export default function DiffView({ paragraphs }: DiffViewProps) {
  return (
    <ScrollArea className="h-[calc(100vh-260px)]">
      <div className="space-y-4 text-sm leading-7">
        {paragraphs.map((paragraph) => {
          if (paragraph.changes.length === 0) {
            return (
              <p key={paragraph.id} className="text-gray-900">
                {paragraph.text}
              </p>
            );
          }

          // 将文本分割为可高亮的段落
          let parts: { text: string; change?: Change; type?: string }[] = [
            { text: paragraph.text }
          ];

          // 按位置排序变更
          const sortedChanges = [...paragraph.changes].sort((a, b) => {
            const posA = a.original ? paragraph.text.indexOf(a.original) : paragraph.text.length;
            const posB = b.original ? paragraph.text.indexOf(b.original) : paragraph.text.length;
            return posA - posB;
          });

          sortedChanges.forEach((change) => {
            let newParts: typeof parts = [];

            parts.forEach((part) => {
              if (part.change) {
                newParts.push(part);
                return;
              }

              if (change.type === 'addition') {
                newParts.push(part);
                // 将新增内容添加到段落末尾
                if (part === parts[parts.length - 1]) {
                  newParts.push({ text: change.new || '', change, type: 'addition' });
                }
                return;
              }

              if (!change.original || part.text.indexOf(change.original) === -1) {
                newParts.push(part);
                return;
              }

              const index = part.text.indexOf(change.original);
              const before = part.text.substring(0, index);
              const after = part.text.substring(index + (change.original?.length || 0));

              if (before) {
                newParts.push({ text: before });
              }

              if (change.type === 'deletion') {
                newParts.push({ text: change.original, change, type: 'deletion' });
              } else if (change.type === 'replace') {
                newParts.push({ text: change.original, change, type: 'deletion' });
                newParts.push({ text: change.new || '', change, type: 'addition' });
              }

              if (after) {
                newParts.push({ text: after });
              }
            });

            parts = newParts;
          });

          return (
            <p key={paragraph.id} className="text-gray-900">
              {parts.map((part, index) => (
                <ChangeHighlight key={index} type={part.type} change={part.change}>
                  {part.text}
                </ChangeHighlight>
              ))}
            </p>
          );
        })}
      </div>
    </ScrollArea>
  );
}