"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { DraggableExercise } from "./DraggableExerciseList";

interface DraggableExerciseItemProps {
  exercise: DraggableExercise;
  index: number;
  disabled?: boolean;
  showDragHandle?: boolean;
  isDragging?: boolean;
  children?: React.ReactNode;
}

export function DraggableExerciseItem({
  exercise,
  disabled = false,
  showDragHandle = true,
  isDragging = false,
  children,
}: DraggableExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: exercise.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || isSortableDragging;

  // Clone children and add drag functionality to them
  if (children) {
    const childElement = React.Children.only(children) as React.ReactElement;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          "group relative transition-all duration-200",
          isCurrentlyDragging && "scale-105 rotate-1 opacity-50 shadow-lg",
        )}
      >
        {/* Drag Handle */}
        {showDragHandle && !disabled && (
          <div
            {...listeners}
            className={cn(
              "absolute top-1/2 left-2 z-10 -translate-y-1/2 cursor-grab rounded transition-all hover:bg-gray-100 active:cursor-grabbing",
              isCurrentlyDragging ? "opacity-0" : "opacity-100",
            )}
          >
            <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </div>
        )}

        {/* Original child content */}
        {childElement}

        {/* Completion Indicator */}
        {exercise.isCompleted && (
          <div className="absolute top-2 right-2 z-10 h-3 w-3 rounded-full bg-green-500" />
        )}
      </div>
    );
  }

  // Fallback for when no children are provided
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "group relative rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200",
        isCurrentlyDragging && "scale-105 rotate-1 opacity-50 shadow-lg",
        !disabled && "hover:border-gray-300 hover:shadow-md",
      )}
    >
      {/* Drag Handle */}
      {showDragHandle && !disabled && (
        <div
          {...listeners}
          className={cn(
            "absolute top-1/2 left-2 z-10 -translate-y-1/2 cursor-grab rounded p-1 transition-all hover:bg-gray-100 active:cursor-grabbing",
            isCurrentlyDragging ? "opacity-0" : "opacity-100",
          )}
        >
          <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </div>
      )}

      {/* Exercise Content */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="truncate font-medium text-gray-900">
            {exercise.name}
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {exercise.sets && <span>{exercise.sets} sets</span>}
            {exercise.reps && <span>• {exercise.reps} reps</span>}
            {exercise.weight && <span>• {exercise.weight}</span>}
          </div>
        </div>
        {exercise.muscleGroup && (
          <p className="text-sm text-gray-500">{exercise.muscleGroup}</p>
        )}
        {exercise.notes && (
          <p className="text-sm text-gray-600 italic">{exercise.notes}</p>
        )}
      </div>

      {/* Completion Indicator */}
      {exercise.isCompleted && (
        <div className="absolute top-2 right-2 z-10 h-3 w-3 rounded-full bg-green-500" />
      )}
    </div>
  );
}

export type { DraggableExerciseItemProps };
