"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { Save, Loader2, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserSettings, UserSettingsUpdate } from "@/features/settings/types";

interface TrainingFormData {
  units: "metric" | "imperial";
  barWeight: number;
  platePairs: number[];
  roundingIncrement: number;
  oneRmFormula: "epley" | "brzycki";
  restTimerEnabled: boolean;
  restTimerSeconds: number;
  autoProgressionEnabled: boolean;
  autoProgressionStep: number;
  warmupPreset: string;
}

interface TrainingSectionProps {
  id?: string;
  ref?: React.Ref<HTMLElement>;
}

export const TrainingSection = React.forwardRef<HTMLElement, TrainingSectionProps>(
  ({ id }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newPlateWeight, setNewPlateWeight] = useState("");
  const [formData, setFormData] = useState<TrainingFormData>({
    units: "metric",
    barWeight: 20,
    platePairs: [25, 20, 15, 10, 5, 2.5, 1.25],
    roundingIncrement: 2.5,
    oneRmFormula: "epley",
    restTimerEnabled: true,
    restTimerSeconds: 120,
    autoProgressionEnabled: false,
    autoProgressionStep: 2.5,
    warmupPreset: "40-60-75-90",
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
  });

  // Update form data when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData({
        units: settings.units,
        barWeight: settings.barWeight,
        platePairs: settings.platePairs || [25, 20, 15, 10, 5, 2.5, 1.25],
        roundingIncrement: settings.roundingIncrement,
        oneRmFormula: settings.oneRmFormula,
        restTimerEnabled: settings.restTimerEnabled,
        restTimerSeconds: settings.restTimerSeconds,
        autoProgressionEnabled: settings.autoProgressionEnabled,
        autoProgressionStep: settings.autoProgressionStep,
        warmupPreset: settings.warmupPreset,
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
        units: settings.units,
        barWeight: settings.barWeight,
        platePairs: settings.platePairs || [25, 20, 15, 10, 5, 2.5, 1.25],
        roundingIncrement: settings.roundingIncrement,
        oneRmFormula: settings.oneRmFormula,
        restTimerEnabled: settings.restTimerEnabled,
        restTimerSeconds: settings.restTimerSeconds,
        autoProgressionEnabled: settings.autoProgressionEnabled,
        autoProgressionStep: settings.autoProgressionStep,
        warmupPreset: settings.warmupPreset,
      });
    }
    setIsEditing(false);
  };

  const addPlate = () => {
    const weight = parseFloat(newPlateWeight);
    if (weight > 0 && !formData.platePairs.includes(weight)) {
      setFormData({
        ...formData,
        platePairs: [...formData.platePairs, weight].sort((a, b) => b - a),
      });
      setNewPlateWeight("");
    }
  };

  const removePlate = (weight: number) => {
    setFormData({
      ...formData,
      platePairs: formData.platePairs.filter(p => p !== weight),
    });
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
            <CardTitle className="text-lg font-semibold">Training Preferences</CardTitle>
            <p className="text-sm text-muted-foreground">
              Units, equipment, and workout settings
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
          {/* Units & Equipment */}
          <div className="space-y-4">
            <h4 className="font-medium">Units & Equipment</h4>
            <div className="space-y-2">
            <Label>Units</Label>
            <Select
              value={formData.units}
              onValueChange={(value: "metric" | "imperial") => 
                setFormData({ ...formData, units: value })
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (kg)</SelectItem>
                <SelectItem value="imperial">Imperial (lbs)</SelectItem>
              </SelectContent>
            </Select>
            </div>

            {/* Bar Weight & Plates */}
            <div className="space-y-4">
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="barWeight">Bar Weight ({formData.units === "metric" ? "kg" : "lbs"})</Label>
                <Input
                  id="barWeight"
                  type="number"
                  step="0.25"
                  value={formData.barWeight}
                  onChange={(e) => setFormData({ ...formData, barWeight: parseFloat(e.target.value) || 0 })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roundingIncrement">Rounding Increment ({formData.units === "metric" ? "kg" : "lbs"})</Label>
                <Input
                  id="roundingIncrement"
                  type="number"
                  step="0.25"
                  value={formData.roundingIncrement}
                  onChange={(e) => setFormData({ ...formData, roundingIncrement: parseFloat(e.target.value) || 0 })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Plates ({formData.units === "metric" ? "kg" : "lbs"})</Label>
              <div className="flex flex-wrap gap-2">
                {formData.platePairs.map((weight) => (
                  <Badge key={weight} variant="secondary" className="flex items-center gap-1">
                    {weight}
                    {isEditing && (
                      <button
                        onClick={() => removePlate(weight)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add plate weight"
                    type="number"
                    step="0.25"
                    value={newPlateWeight}
                    onChange={(e) => setNewPlateWeight(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPlate()}
                    className="max-w-32"
                  />
                  <Button size="sm" variant="outline" onClick={addPlate}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            </div>
          </div>

          <Separator />

          {/* 1RM Formula */}
          <div className="space-y-4">
            <h4 className="font-medium">1RM Formula</h4>
            <div className="space-y-2">
            <Label>1RM Formula</Label>
            <Select
              value={formData.oneRmFormula}
              onValueChange={(value: "epley" | "brzycki") => 
                setFormData({ ...formData, oneRmFormula: value })
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="epley">Epley</SelectItem>
                <SelectItem value="brzycki">Brzycki</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>

          <Separator />

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
                <Label htmlFor="restTimerSeconds">Default rest time (seconds)</Label>
                <Input
                  id="restTimerSeconds"
                  type="number"
                  min="30"
                  max="600"
                  value={formData.restTimerSeconds}
                  onChange={(e) => setFormData({ ...formData, restTimerSeconds: parseInt(e.target.value) || 120 })}
                  disabled={!isEditing}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Auto Progression */}
          <div className="space-y-4">
            <h4 className="font-medium">Auto Progression</h4>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.autoProgressionEnabled}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, autoProgressionEnabled: checked })
                }
                disabled={!isEditing}
              />
              <Label>Enable automatic progression</Label>
            </div>

            {formData.autoProgressionEnabled && (
              <div className="space-y-2">
                <Label htmlFor="autoProgressionStep">Progression step ({formData.units === "metric" ? "kg" : "lbs"})</Label>
                <Input
                  id="autoProgressionStep"
                  type="number"
                  step="0.25"
                  value={formData.autoProgressionStep}
                  onChange={(e) => setFormData({ ...formData, autoProgressionStep: parseFloat(e.target.value) || 2.5 })}
                  disabled={!isEditing}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Warmup Presets */}
          <div className="space-y-4">
            <h4 className="font-medium">Warmup Presets</h4>
            <div className="space-y-2">
            <Label htmlFor="warmupPreset">Warmup Preset (%)</Label>
            <Input
              id="warmupPreset"
              placeholder="e.g., 40-60-75-90"
              value={formData.warmupPreset}
              onChange={(e) => setFormData({ ...formData, warmupPreset: e.target.value })}
              disabled={!isEditing}
            />
            <p className="text-xs text-muted-foreground">
              Percentage of working weight for warmup sets, separated by dashes
            </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
});

TrainingSection.displayName = "TrainingSection";