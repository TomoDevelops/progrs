"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

interface KeyboardShortcut {
  id: string;
  action: string;
  description: string;
  defaultKeys: string;
  currentKeys: string;
  category: "navigation" | "workout" | "general";
}

const defaultShortcuts: KeyboardShortcut[] = [
  {
    id: "search",
    action: "Global Search",
    description: "Open global search dialog",
    defaultKeys: "Ctrl+K",
    currentKeys: "Ctrl+K",
    category: "general",
  },
  {
    id: "new-workout",
    action: "New Workout",
    description: "Start a new workout session",
    defaultKeys: "Ctrl+N",
    currentKeys: "Ctrl+N",
    category: "workout",
  },
  {
    id: "dashboard",
    action: "Go to Dashboard",
    description: "Navigate to dashboard",
    defaultKeys: "Ctrl+D",
    currentKeys: "Ctrl+D",
    category: "navigation",
  },
  {
    id: "workouts",
    action: "Go to Workouts",
    description: "Navigate to workouts page",
    defaultKeys: "Ctrl+W",
    currentKeys: "Ctrl+W",
    category: "navigation",
  },
  {
    id: "exercises",
    action: "Go to Exercises",
    description: "Navigate to exercises page",
    defaultKeys: "Ctrl+E",
    currentKeys: "Ctrl+E",
    category: "navigation",
  },
  {
    id: "analytics",
    action: "Go to Analytics",
    description: "Navigate to analytics page",
    defaultKeys: "Ctrl+A",
    currentKeys: "Ctrl+A",
    category: "navigation",
  },
  {
    id: "settings",
    action: "Go to Settings",
    description: "Navigate to settings page",
    defaultKeys: "Ctrl+,",
    currentKeys: "Ctrl+,",
    category: "navigation",
  },
  {
    id: "save-workout",
    action: "Save Workout",
    description: "Save current workout session",
    defaultKeys: "Ctrl+S",
    currentKeys: "Ctrl+S",
    category: "workout",
  },
  {
    id: "add-exercise",
    action: "Add Exercise",
    description: "Add exercise to current workout",
    defaultKeys: "Ctrl+Shift+E",
    currentKeys: "Ctrl+Shift+E",
    category: "workout",
  },
  {
    id: "start-timer",
    action: "Start/Stop Timer",
    description: "Start or stop rest timer",
    defaultKeys: "Space",
    currentKeys: "Space",
    category: "workout",
  },
];

interface ShortcutsSectionProps {
  id?: string;
  ref?: React.Ref<HTMLElement>;
}

export const ShortcutsSection = React.forwardRef<
  HTMLElement,
  ShortcutsSectionProps
>(({ id }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shortcuts, setShortcuts] =
    useState<KeyboardShortcut[]>(defaultShortcuts);
  const [originalShortcuts, setOriginalShortcuts] =
    useState<KeyboardShortcut[]>(defaultShortcuts);
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);

  useEffect(() => {
    fetchShortcuts();
  }, []);

  const fetchShortcuts = async () => {
    try {
      const response = await fetch("/api/me/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.keyboardShortcuts) {
          const updatedShortcuts = defaultShortcuts.map((shortcut) => {
            const saved = data.keyboardShortcuts.find(
              (s: { id: string; keys: string }) => s.id === shortcut.id,
            );
            return saved ? { ...shortcut, currentKeys: saved.keys } : shortcut;
          });
          setShortcuts(updatedShortcuts);
          setOriginalShortcuts(updatedShortcuts);
        }
      }
    } catch (error) {
      console.error("Failed to fetch shortcuts:", error);
      toast.error("Failed to load keyboard shortcuts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const shortcutsData = shortcuts.map((s) => ({
        id: s.id,
        keys: s.currentKeys,
      }));
      const response = await fetch("/api/me/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyboardShortcuts: shortcutsData }),
      });

      if (response.ok) {
        setOriginalShortcuts([...shortcuts]);
        setIsEditing(false);
        setEditingShortcut(null);
        toast.success("Keyboard shortcuts updated successfully");
      } else {
        throw new Error("Failed to update shortcuts");
      }
    } catch (error) {
      console.error("Failed to update shortcuts:", error);
      toast.error("Failed to update keyboard shortcuts");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setShortcuts([...originalShortcuts]);
    setIsEditing(false);
    setEditingShortcut(null);
  };

  const handleShortcutChange = (id: string, keys: string) => {
    setShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, currentKeys: keys } : s)),
    );
    if (!isEditing) setIsEditing(true);
  };

  const handleResetShortcut = (id: string) => {
    const shortcut = shortcuts.find((s) => s.id === id);
    if (shortcut) {
      handleShortcutChange(id, shortcut.defaultKeys);
    }
  };

  const handleResetAll = () => {
    setShortcuts((prev) =>
      prev.map((s) => ({ ...s, currentKeys: s.defaultKeys })),
    );
    if (!isEditing) setIsEditing(true);
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "navigation":
        return "Navigation";
      case "workout":
        return "Workout";
      case "general":
        return "General";
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "navigation":
        return "bg-blue-100 text-blue-800";
      case "workout":
        return "bg-green-100 text-green-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, KeyboardShortcut[]>,
  );

  if (isLoading) {
    return (
      <section ref={ref} id={id} className="space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Keyboard Shortcuts
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Customize keyboard shortcuts for faster navigation
            </p>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="bg-muted h-4 w-1/4 rounded"></div>
              <div className="bg-muted h-10 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section ref={ref} id={id} className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            Keyboard Shortcuts
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Customize keyboard shortcuts for faster navigation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reset All Button */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Click on a shortcut to edit it. Press Escape to cancel editing.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </Button>
          </div>

          <Separator />

          {/* Shortcuts by Category */}
          {Object.entries(groupedShortcuts).map(
            ([category, categoryShortcuts]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">
                    {getCategoryName(category)}
                  </h4>
                  <Badge
                    variant="secondary"
                    className={getCategoryColor(category)}
                  >
                    {categoryShortcuts.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Label className="text-sm font-medium">
                            {shortcut.action}
                          </Label>
                          {shortcut.currentKeys !== shortcut.defaultKeys && (
                            <Badge variant="outline" className="text-xs">
                              Modified
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {shortcut.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {editingShortcut === shortcut.id ? (
                          <Input
                            value={shortcut.currentKeys}
                            onChange={(e) =>
                              handleShortcutChange(shortcut.id, e.target.value)
                            }
                            onBlur={() => setEditingShortcut(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setEditingShortcut(null);
                              } else if (e.key === "Enter") {
                                setEditingShortcut(null);
                              }
                            }}
                            className="w-32 text-center"
                            placeholder="Enter keys..."
                            autoFocus
                          />
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingShortcut(shortcut.id)}
                            className="min-w-[80px] font-mono text-xs"
                          >
                            {shortcut.currentKeys}
                          </Button>
                        )}

                        {shortcut.currentKeys !== shortcut.defaultKeys && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetShortcut(shortcut.id)}
                            className="h-8 w-8 p-1"
                            title="Reset to default"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}

          {/* Action Buttons */}
          {isEditing && (
            <>
              <Separator />
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
});

ShortcutsSection.displayName = "ShortcutsSection";
