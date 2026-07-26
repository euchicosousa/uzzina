import { cn } from "cnfast";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
export function TokensColorsSection() {
  const colorItems = [
    {
      id: "background",
      label: "Base Surfaces",
      title: "Background",
      code: "bg-background text-foreground",
    },
    {
      id: "card",
      label: "Base Surfaces",
      title: "Card",
      code: "bg-card text-foreground border",
    },
    {
      id: "popover",
      label: "Base Surfaces",
      title: "Popover",
      code: "bg-popover text-foreground border",
    },
    {
      id: "primary",
      label: "Base Surfaces",
      title: "Primary (Accent Knob)",
      code: "bg-primary text-primary-foreground",
    },
    {
      id: "secondary",
      label: "Base Surfaces",
      title: "Secondary",
      code: "bg-secondary text-secondary-foreground border",
    },
    {
      id: "muted",
      label: "Base Surfaces",
      title: "Muted",
      code: "bg-muted text-muted-foreground",
    },
    {
      id: "accent",
      label: "Base Surfaces",
      title: "Accent",
      code: "bg-accent text-accent-foreground border",
    },
    {
      id: "border",
      label: "Aero Borders & Controls",
      title: "Border Color",
      code: "border-border text-foreground border",
    },
    {
      id: "input",
      label: "Aero Borders & Controls",
      title: "Input Background",
      code: "bg-input text-foreground border",
    },
    {
      id: "action",
      label: "Uzzina Workflows",
      title: "Action State",
      code: "bg-action text-foreground border",
    },
    {
      id: "late",
      label: "Uzzina Workflows",
      title: "Late State (Atrasado)",
      code: "bg-late text-destructive border",
    },
  ];
  return (
    <div id="colors">
      <GallerySection>
        <GallerySectionHeader
          description="Mapeamento das variáveis de cores ativas e corrigidas no tailwind.css."
          title="Cores Semânticas OKLCH"
        />
        <GallerySectionContent className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
          {colorItems.map((item) => (
            <GalleryItem key={item.id} label={item.label}>
              <div className="flex items-top gap-3">
                <div className={cn("size-8 rounded-lg border", item.code)} />
                <div className="space-y-1">
                  <div className="text-xs font-medium">{item.title}</div>
                  <code className="text-[10px] text-muted-foreground font-mono">
                    {item.code}
                  </code>
                </div>
              </div>
            </GalleryItem>
          ))}
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
