import { DndContext, useDraggable, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";

export default function Teste() {

  const [items, setItems] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  const [activeItem, setActiveItem] = useState<number | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    console.log(event)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    console.log(event)
  }

  return (
    <div className="p-8">
      <h1>Teste</h1>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {items.map((item) => (
          <Draggable key={item} id={item.toString()}>
            {item}
          </Draggable>
        ))}
      </DndContext>
    </div>
  );
}

function Draggable({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id })

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {children}
    </div>
  )
}
