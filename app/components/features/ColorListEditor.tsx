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
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { ActionColorDropdown } from "~/routes/CreateAndEditAction";

interface ColorItem {
  id: string;
  value: string;
}

interface ColorListProps {
  initialColors?: string[];
}

export function ColorListEditor({ initialColors = [] }: ColorListProps) {
  // Use unique IDs for dnd-kit, initialized from colors or empty
  const [items, setItems] = useState<ColorItem[]>(() =>
    initialColors && initialColors.length > 0
      ? initialColors.map((color) => ({
          id: crypto.randomUUID(),
          value: color,
        }))
      : [
          { id: crypto.randomUUID(), value: "#000000" }, // Default primary
          { id: crypto.randomUUID(), value: "#ffffff" }, // Default secondary
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
      { id: crypto.randomUUID(), value: "#000000" },
    ]);
  };

  const removeColor = (id: string) => {
    setItems((items) => items.filter((item) => item.id !== id));
  };

  const updateColor = (id: string, newValue: string) => {
    setItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, value: newValue } : item,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
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
                value={item.value}
                index={index}
                onRemove={() => removeColor(item.id)}
                onChange={(val) => updateColor(item.id, val)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addColor}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
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
  index,
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
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md",
        isDragging && "ring-primary ring-2",
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
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
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-0 cursor-pointer p-0.5"
          />
        </label>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono uppercase"
          maxLength={9}
        />
      </div>

      {/* Hidden input to submit the value. Name is "colors" to get array in action. */}
      {/* Important: Only include validation attributes if needed, but since it's dynamic, native validation might be tricky. */}
      {/* We add index to maybe track order if needed, but simple arrays usually work by document order. */}
      <input type="hidden" name="colors" value={value} />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive h-9 w-9"
        title="Remover cor"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
