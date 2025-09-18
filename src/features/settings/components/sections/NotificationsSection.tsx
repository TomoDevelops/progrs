"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import {
  Pencil,
  X,
  Check,
  Plus,
  Trash2,
  Bell,
  Mail,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import type {
  NotificationPreferences,
  WorkoutReminder,
} from "@/features/settings/types";

interface NotificationsSectionProps {
  id?: string;
  ref?: React.Ref<HTMLElement>;
}

export const NotificationsSection = React.forwardRef<
  HTMLElement,
  NotificationsSectionProps
>(({ id }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<NotificationPreferences | null>(
    null,
  );
  const [newReminder, setNewReminder] =
    useState<Partial<WorkoutReminder> | null>(null);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetch("/api/me/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json() as Promise<NotificationPreferences>;
    },
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery<
    WorkoutReminder[]
  >({
    queryKey: ["reminders"],
    queryFn: async () => {
      const response = await fetch("/api/me/reminders");
      if (!response.ok) throw new Error("Failed to fetch reminders");
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationPreferences) => {
      const response = await fetch("/api/me/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update notifications");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification preferences updated");
      setIsEditing(false);
      setEditedData(null);
    },
    onError: () => {
      toast.error("Failed to update notification preferences");
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: async (
      data: Omit<WorkoutReminder, "id" | "userId" | "createdAt" | "updatedAt">,
    ) => {
      const response = await fetch("/api/me/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create reminder");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder created");
      setNewReminder(null);
    },
    onError: () => {
      toast.error("Failed to create reminder");
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/me/reminders/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete reminder");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder deleted");
    },
    onError: () => {
      toast.error("Failed to delete reminder");
    },
  });

  const handleEdit = () => {
    if (notifications) {
      setEditedData({ ...notifications });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(null);
    setNewReminder(null);
  };

  const handleSave = () => {
    if (editedData) {
      updateNotificationsMutation.mutate(editedData);
    }
  };

  const handleCreateReminder = () => {
    if (
      newReminder &&
      newReminder.dayOfWeek !== undefined &&
      newReminder.timeLocal
    ) {
      createReminderMutation.mutate({
        dayOfWeek: newReminder.dayOfWeek,
        timeLocal: newReminder.timeLocal,
        enabled: newReminder.enabled ?? true,
      });
    }
  };

  const currentData = isEditing ? editedData : notifications;

  if (isLoading || !currentData) {
    return (
      <section ref={ref} id={id} className="space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Notifications
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Email, push, and reminder settings
            </p>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="bg-muted h-32 rounded-lg" />
              <div className="bg-muted h-32 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section ref={ref} id={id} className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold">
              Notifications
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Email, push, and reminder settings
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateNotificationsMutation.isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <Mail className="h-4 w-4" />
              Email Notifications
            </h4>
            <p className="text-muted-foreground text-sm">
              Configure when you&apos;d like to receive email notifications
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Workout Reminders</Label>
                  <p className="text-muted-foreground text-xs">
                    Get reminded about scheduled workouts
                  </p>
                </div>
                <Switch
                  checked={currentData.workoutRemindersEmail}
                  onCheckedChange={(checked) => {
                    if (isEditing && editedData) {
                      setEditedData({
                        ...editedData,
                        workoutRemindersEmail: checked,
                      });
                    }
                  }}
                  disabled={!isEditing}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Product Updates</Label>
                  <p className="text-muted-foreground text-xs">
                    Weekly summaries of your progress
                  </p>
                </div>
                <Switch
                  checked={currentData.productUpdatesEmail}
                  onCheckedChange={(checked) => {
                    if (isEditing && editedData) {
                      setEditedData({
                        ...editedData,
                        productUpdatesEmail: checked,
                      });
                    }
                  }}
                  disabled={!isEditing}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Personal Records</Label>
                  <p className="text-muted-foreground text-xs">
                    Celebrate your milestones and PRs
                  </p>
                </div>
                <Switch
                  checked={currentData.prEmail}
                  onCheckedChange={(checked) => {
                    if (isEditing && editedData) {
                      setEditedData({ ...editedData, prEmail: checked });
                    }
                  }}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <Smartphone className="h-4 w-4" />
              Push Notifications
            </h4>
            <p className="text-muted-foreground text-sm">
              Configure browser and mobile push notifications
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Workout Reminders</Label>
                  <p className="text-muted-foreground text-xs">
                    Push notifications for scheduled workouts
                  </p>
                </div>
                <Switch
                  checked={currentData.pushWorkoutReminders}
                  onCheckedChange={(checked) => {
                    if (isEditing && editedData) {
                      setEditedData({
                        ...editedData,
                        pushWorkoutReminders: checked,
                      });
                    }
                  }}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Workout Reminders */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <Bell className="h-4 w-4" />
              Workout Reminders
            </h4>
            <p className="text-muted-foreground text-sm">
              Set up custom reminders for your workouts
            </p>
            <div className="space-y-4">
              {remindersLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="bg-muted h-16 rounded" />
                  <div className="bg-muted h-16 rounded" />
                </div>
              ) : (
                <>
                  {(reminders || []).map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {
                              [
                                "Sunday",
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                              ][reminder.dayOfWeek]
                            }{" "}
                            Reminder
                          </h4>
                          <Badge
                            variant={reminder.enabled ? "default" : "secondary"}
                          >
                            {reminder.enabled ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
                          <span>{reminder.timeLocal}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          reminder.id &&
                          deleteReminderMutation.mutate(reminder.id)
                        }
                        disabled={
                          deleteReminderMutation.isPending || !reminder.id
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {!newReminder ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setNewReminder({
                          dayOfWeek: 1,
                          timeLocal: "09:00",
                          enabled: true,
                        })
                      }
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Reminder
                    </Button>
                  ) : (
                    <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reminder-day">Day of Week</Label>
                          <Select
                            value={newReminder.dayOfWeek?.toString() || ""}
                            onValueChange={(value) =>
                              setNewReminder({
                                ...newReminder,
                                dayOfWeek: parseInt(value),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Sunday</SelectItem>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reminder-time">Time</Label>
                          <Input
                            id="reminder-time"
                            type="time"
                            value={newReminder.timeLocal || ""}
                            onChange={(e) =>
                              setNewReminder({
                                ...newReminder,
                                timeLocal: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateReminder}
                          disabled={
                            newReminder.dayOfWeek === undefined ||
                            !newReminder.timeLocal ||
                            createReminderMutation.isPending
                          }
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Create
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setNewReminder(null)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
});

NotificationsSection.displayName = "NotificationsSection";
