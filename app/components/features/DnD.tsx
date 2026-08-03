import {
  useDraggable,
  useDroppable,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import React from "react";
import { cn } from "cnfast";
import { CSS } from "@dnd-kit/utilities";

export function Droppable({
  id,
  children,
  className,
}: {
  id: UniqueIdentifier;
  children: (isOver: boolean) => React.ReactNode;
  className?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  return (
    <div ref={setNodeRef} className={cn(className)}>
      {children(isOver)}
    </div>
  );
}

export function Draggable({
  id,
  children,
}: {
  id: UniqueIdentifier;
  children: React.ReactElement;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
    });
  const style = {
    transform: CSS.Transform.toString(transform),
  };
  const child = React.Children.only(children);
  const isDOMElement = typeof child.type === "string";
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={isDragging ? undefined : style}
      // className={cn(isDragging && "opacity-20")}
    >
      {React.cloneElement(child, {
        [isDOMElement ? "data-dragging" : "isDragging"]: isDragging,
      })}
    </div>
  );
}

import { useSortable } from "@dnd-kit/sortable";

export function SortableItem({
  id,
  children,
  className,
}: {
  id: UniqueIdentifier;
  children: React.ReactElement;
  className?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    // Controla a animação de "deslize" dos itens vizinhos durante o drag.
    // O padrão do @dnd-kit é 200ms linear — aumentamos para algo mais suave.
    transition: {
      duration: 350,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const child = React.Children.only(children);
  const isDOMElement = typeof child.type === "string";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(className, isDragging && "opacity-20 pointer-events-none")}
    >
      {React.cloneElement(child, {
        [isDOMElement ? "data-dragging" : "isDragging"]: isDragging,
      })}
    </div>
  );
}
