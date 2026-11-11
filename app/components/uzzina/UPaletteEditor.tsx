import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, useState } from "react";
import { cn } from "cnfast";
import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { PrismButton, PrismInput } from "~/components/prism";
import { UColorPickerDropdown } from "./UColorPickerDropdown";
import { normalizeHexColor, safeColor } from "~/utils/uzzina-utils";

export interface PaletteItem {
  id: string;
  value: string;
  draft?: string;
  isInvalid?: boolean;
}

export interface UPaletteEditorProps {
  /** Cores iniciais da paleta */
  initialColors?: string[];
  /** Callback disparado quando as cores válidas mudam */
  onChange?: (colors: string[]) => void;
  className?: string;
  disabled?: boolean;
}

const DEFAULT_INITIAL_COLORS: string[] = [];

function isValidHex(hexStr: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexStr.trim());
}

export function UPaletteEditor({
  initialColors = DEFAULT_INITIAL_COLORS,
  onChange,
  className,
  disabled,
}: UPaletteEditorProps) {
  const dndId = useId();

  const [items, setItems] = useState<PaletteItem[]>(() =>
    initialColors && initialColors.length > 0
      ? initialColors.map((color) => {
          const hex = safeColor(color);
          return {
            id: crypto.randomUUID(),
            value: hex,
            draft: hex,
            isInvalid: false,
          };
        })
      : [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const triggerChange = (updatedItems: PaletteItem[]) => {
    onChange?.(updatedItems.map((item) => item.value));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);
        const next = arrayMove(prevItems, oldIndex, newIndex);
        triggerChange(next);
        return next;
      });
    }
  };

  const addColor = () => {
    setItems((prevItems) => {
      const next = [
        ...prevItems,
        {
          id: crypto.randomUUID(),
          value: "#2563EB",
          draft: "#2563EB",
          isInvalid: false,
        },
      ];
      triggerChange(next);
      return next;
    });
  };

  const removeColor = (id: string) => {
    setItems((prevItems) => {
      const next = prevItems.filter((item) => item.id !== id);
      triggerChange(next);
      return next;
    });
  };

  const handlePickerChange = (id: string, newHex: string) => {
    const normalized = safeColor(newHex);
    setItems((prevItems) => {
      const next = prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              value: normalized,
              draft: normalized,
              isInvalid: false,
            }
          : item,
      );
      triggerChange(next);
      return next;
    });
  };

  const handleTextChange = (id: string, text: string) => {
    let formatted = text.trim();
    if (formatted && !formatted.startsWith("#")) {
      formatted = `#${formatted}`;
    }

    const valid = isValidHex(formatted);

    setItems((prevItems) => {
      const next = prevItems.map((item) => {
        if (item.id !== id) return item;

        if (valid) {
          const normalized = normalizeHexColor(formatted);
          return {
            ...item,
            value: normalized,
            draft: formatted,
            isInvalid: false,
          };
        }

        // Mantém o texto que o usuário digitou sem converter em preto ou preencher com zeros
        return {
          ...item,
          draft: text,
          isInvalid: true,
        };
      });

      if (valid) {
        triggerChange(next);
      }

      return next;
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {items.length === 0 ? (
        <p className="py-2 text-sm text-secondary-foreground">
          Nenhuma cor definida na paleta.
        </p>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          id={dndId}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {items.map((item, index) => (
                <SortablePaletteItem
                  key={item.id}
                  disabled={disabled}
                  id={item.id}
                  index={index}
                  item={item}
                  onChangeText={(val) => handleTextChange(item.id, val)}
                  onPickerChange={(val) => handlePickerChange(item.id, val)}
                  onRemove={() => removeColor(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <PrismButton
        isDisabled={disabled}
        onClick={addColor}
        size="sm"
        variant="outline"
      >
        Adicionar Cor
        <PlusIcon className="size-4" />
      </PrismButton>
    </div>
  );
}

interface SortablePaletteItemProps {
  id: string;
  item: PaletteItem;
  index: number;
  disabled?: boolean;
  onRemove: () => void;
  onPickerChange: (newHex: string) => void;
  onChangeText: (text: string) => void;
}

function SortablePaletteItem({
  id,
  item,
  index,
  disabled,
  onRemove,
  onPickerChange,
  onChangeText,
}: SortablePaletteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const inputValue = item.draft ?? item.value;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-2 rounded-2xl squircle",
        isDragging && "ring-2 ring-primary",
      )}
      style={style}
    >
      {/* Alça de arraste */}
      <div
        {...attributes}
        {...listeners}
        aria-label="Reordenar cor"
        className={cn(
          "cursor-grab p-1 opacity-60 transition hover:opacity-100 active:cursor-grabbing",
          disabled && "pointer-events-none opacity-30",
        )}
      >
        <GripVerticalIcon className="size-4" />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {/* Seletor compartilhado UColorPickerDropdown */}
        <UColorPickerDropdown
          aria-label={`Editar cor ${index + 1}`}
          disabled={disabled}
          onChange={onPickerChange}
          popoverSize="default"
          size="icon-sm"
          value={item.value}
          variant="ghost"
        />

        {/* Input de texto com validação e feedback acessível */}
        <PrismInput
          aria-invalid={item.isInvalid ? "true" : undefined}
          aria-label={`Código Hexadecimal da Cor ${index + 1}`}
          className={cn(
            "h-8 min-w-0 flex-1 font-mono text-xs uppercase",
            item.isInvalid &&
              "border-error bg-error-background text-error ring-3 ring-error-background focus-visible:border-error",
          )}
          disabled={disabled}
          id={`hex_${id}`}
          maxLength={9}
          name={`hex_${id}`}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="#000000"
          type="text"
          value={inputValue}
        />
      </div>

      {/* Input oculto para submissão de formulário padrão */}
      <input name="colors" type="hidden" value={item.value} />

      {/* Botão de exclusão com variante ghost-error discreta */}
      <PrismButton
        aria-label={`Remover cor ${index + 1}`}
        isDisabled={disabled}
        onClick={onRemove}
        size="icon-sm"
        type="button"
        variant="ghost-error"
      >
        <Trash2Icon />
      </PrismButton>
    </div>
  );
}
