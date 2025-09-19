"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { Switch } from "@/shared/components/ui/switch";
import { Save, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UserSettings,
  UserSettingsUpdate,
} from "@/features/settings/types";

interface TrainingFormData {
  restTimerEnabled: boolean;
  restTimerSeconds: number;
}

interface TrainingSectionProps {
  id?: string;
  ref?: React.Ref<HTMLElement>;
}

export const TrainingSection = React.forwardRef<
  HTMLElement,
  TrainingSectionProps
>(({ id }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TrainingFormData>({
    restTimerEnabled: true,
    restTimerSeconds: 120,
  });
  const queryClient = useQueryClient();

  // Fetch user settings
  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const response = await fetch("/api/me/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const result = await response.json();
      return result.data;
    },
    enabled: true, // Server-side auth ensures user is authenticated
  });

  // Update form data when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData({
        restTimerEnabled: settings.restTimerEnabled,
        restTimerSeconds: settings.restTimerSeconds,
      });
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: UserSettingsUpdate) => {
      const response = await fetch("/api/me/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (settings) {
      setFormData({
        restTimerEnabled: settings.restTimerEnabled,
        restTimerSeconds: settings.restTimerSeconds,
      });
    }
    setIsEditing(false);
  };



  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Training Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section ref={ref} id={id} className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold">
              Training Preferences
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Rest timer settings
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={updateSettingsMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rest Timer */}
          <div className="space-y-4">
            <h4 className="font-medium">Rest Timer</h4>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.restTimerEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, restTimerEnabled: checked })
                }
                disabled={!isEditing}
              />
              <Label>Enable rest timer</Label>
            </div>

            {formData.restTimerEnabled && (
              <div className="space-y-2">
                <Label htmlFor="restTimerSeconds">
                  Default rest time (seconds)
                </Label>
                <Input
                  id="restTimerSeconds"
                  type="number"
                  min="30"
                  max="600"
                  value={formData.restTimerSeconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      restTimerSeconds: parseInt(e.target.value) || 120,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
});

TrainingSection.displayName = "TrainingSection";
