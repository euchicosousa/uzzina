import {
  useDraggable,
  useDroppable,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import React from "react";
import { cn } from "~/lib/utils";
import { CSS } from "@dnd-kit/utilities";

export const Droppable = ({
  id,
  children,
  className,
}: {
  id: UniqueIdentifier;
  children: (isOver: boolean) => React.ReactNode;
  className?: string;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn(className)}>
      {children(isOver)}
    </div>
  );
};

export const Draggable = ({
  id,
  children,
  shouldFollow,
}: {
  id: UniqueIdentifier;
  children: React.ReactElement<any>;
  shouldFollow?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
    });

  // const style =
  //   shouldFollow && transform
  //     ? {
  //         transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  //       }
  //     : undefined;
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
      className={cn(isDragging && "opacity-20")}
    >
      {React.cloneElement(child, {
        [isDOMElement ? "data-dragging" : "isDragging"]: isDragging,
      })}
    </div>
  );
};
