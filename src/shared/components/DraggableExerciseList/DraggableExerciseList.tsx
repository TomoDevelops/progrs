"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import { DraggableExerciseItem } from "@/shared/components/DraggableExerciseList/DraggableExerciseItem";

export interface DraggableExercise {
  id: string;
  name: string;
  muscleGroup?: string;
  sets?: number;
  reps?: string;
  weight?: string;
  restTime?: number;
  notes?: string;
  isCompleted?: boolean;
  [key: string]: unknown; // Allow additional properties for flexibility
}

interface DraggableExerciseListProps {
  exercises: DraggableExercise[];
  onReorder: (exercises: DraggableExercise[]) => void;
  renderExercise?: (
    exercise: DraggableExercise,
    index: number,
  ) => React.ReactNode;
  className?: string;
  disabled?: boolean;
  showDragHandle?: boolean;
}

export function DraggableExerciseList({
  exercises,
  onReorder,
  renderExercise,
  className = "",
  disabled = false,
  showDragHandle = true,
}: DraggableExerciseListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedExercise, setDraggedExercise] =
    useState<DraggableExercise | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setIsDragging(true);

    const exercise = exercises.find((ex) => ex.id === active.id);
    setDraggedExercise(exercise || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = exercises.findIndex((ex) => ex.id === active.id);
      const newIndex = exercises.findIndex((ex) => ex.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedExercises = arrayMove(exercises, oldIndex, newIndex);
        onReorder(reorderedExercises);
      }
    }

    setActiveId(null);
    setIsDragging(false);
    setDraggedExercise(null);
  };

  if (exercises.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        <p>No exercises added yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext
          items={exercises.map((ex) => ex.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={`space-y-3 ${isDragging ? "select-none" : ""}`}>
            {exercises.map((exercise, index) => (
              <DraggableExerciseItem
                key={exercise.id}
                exercise={exercise}
                index={index}
                disabled={disabled}
                showDragHandle={showDragHandle}
                isDragging={activeId === exercise.id}
              >
                {renderExercise ? renderExercise(exercise, index) : null}
              </DraggableExerciseItem>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && draggedExercise ? (
            <div className="rotate-3 transform opacity-95 shadow-2xl">
              <div className="rounded-lg border-2 border-blue-500 bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {draggedExercise.name}
                    </h4>
                    {draggedExercise.muscleGroup && (
                      <p className="text-sm text-gray-500">
                        {draggedExercise.muscleGroup}
                      </p>
                    )}
                  </div>
                  {draggedExercise.sets && (
                    <div className="text-sm text-gray-600">
                      {draggedExercise.sets} sets
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export type { DraggableExerciseListProps };
