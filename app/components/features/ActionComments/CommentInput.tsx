import { SendIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

interface CommentInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isSubmitting?: boolean;
}

export function CommentInput({
  value,
  onChange,
  onSend,
  isSubmitting,
}: CommentInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      onSend();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        placeholder="Escreva uma observação..."
        className="min-h-[80px] w-full resize-none rounded-xl border bg-muted/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center justify-between px-1">
        <span className="text-muted-foreground uppercase text-[10px] font-medium tracking-wider">
          Cmd + Enter para enviar
        </span>
        <Button
          size="sm"
          className="squircle h-9 rounded-xl px-4"
          disabled={!value.trim() || isSubmitting}
          onClick={onSend}
        >
          <SendIcon className="mr-2 size-3.5" />
          Enviar
        </Button>
      </div>
    </div>
  );
}
