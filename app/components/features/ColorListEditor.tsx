import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { normalizeHexColor } from "~/lib/uzzina-utils";
interface ColorItem {
  id: string;
  value: string;
}
interface ColorListProps {
  initialColors?: string[];
}

// Helper to ensure 3-char hex like #fff becomes 6-char #ffffff for the native color input

const DEFAULT_INITIAL_COLORS: string[] = [];
export function ColorListEditor({
  initialColors = DEFAULT_INITIAL_COLORS,
}: ColorListProps) {
  const dndId = useId();

  // Use unique IDs for dnd-kit, initialized from colors or empty
  const [items, setItems] = useState<ColorItem[]>(() =>
    initialColors && initialColors.length > 0
      ? initialColors.map((color) => ({
          id: crypto.randomUUID(),
          value: normalizeHexColor(color),
        }))
      : [
          {
            id: crypto.randomUUID(),
            value: "#000000",
          },
          // Default primary
          {
            id: crypto.randomUUID(),
            value: "#ffffff",
          }, // Default secondary
        ],
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  const addColor = () => {
    setItems((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        value: "#000000",
      },
    ]);
  };
  const removeColor = (id: string) => {
    setItems((items) => items.filter((item) => item.id !== id));
  };
  const updateColor = (id: string, newValue: string) => {
    setItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              value: newValue,
            }
          : item,
      ),
    );
  };
  return (
    <div className="space-y-4">
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
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {items.map((item, index) => (
              <SortableColorItem
                key={item.id}
                id={item.id}
                index={index}
                onChange={(val) => updateColor(item.id, val)}
                onRemove={() => removeColor(item.id)}
                value={item.value}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        className="flex items-center gap-2"
        onClick={addColor}
        size="sm"
        type="button"
        variant="outline"
      >
        <PlusIcon className="h-4 w-4" />
        Adicionar Cor
      </Button>
    </div>
  );
}
interface SortableItemProps {
  id: string;
  value: string;
  index: number;
  onRemove: () => void;
  onChange: (value: string) => void;
}
function SortableColorItem({
  id,
  value,
  onRemove,
  onChange,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    // opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-2 rounded-md",
        isDragging && "ring-2 ring-primary",
      )}
      style={style}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
      >
        <GripVerticalIcon className="size-4" />
      </div>

      <div className="flex flex-1 items-center gap-2">
        <label className="relative">
          <div
            className="size-6 rounded-full border"
            style={{
              backgroundColor: value,
            }}
          ></div>
          <input
            aria-label="Escolher cor visualmente"
            className="absolute inset-0 size-0 cursor-pointer p-0.5"
            id={`color_${id}`}
            name={`color_${id}`}
            onChange={(e) => onChange(e.target.value)}
            type="color"
            value={normalizeHexColor(value)}
          />
        </label>
        <Input
          aria-label="Código Hexadecimal da Cor"
          className="flex-1 font-mono uppercase"
          id={`hex_${id}`}
          maxLength={9}
          name={`hex_${id}`}
          onChange={(e) => onChange(e.target.value)}
          type="text"
          value={value}
        />
      </div>

      {/* Hidden input to submit the value. Name is "colors" to get array in action. */}
      {/* Important: Only include validation attributes if needed, but since it's dynamic, native validation might be tricky. */}
      {/* We add index to maybe track order if needed, but simple arrays usually work by document order. */}
      <input name="colors" type="hidden" value={value} />

      <Button
        className="h-9 w-9 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        size="icon"
        title="Remover cor"
        type="button"
        variant="ghost"
      >
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </div>
  );
}
