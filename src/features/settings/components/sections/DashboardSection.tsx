"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { Save, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UserSettings,
  UserSettingsUpdate,
} from "@/features/settings/types";

interface DashboardFormData {
  chartDefaultMetric: "total_volume" | "one_rm" | "duration" | "body_weight";
  chartDefaultRange: "2w" | "8w" | "6m" | "1y";
  heatmapMetric: "volume" | "minutes";
  showBodyWeightOverlay: boolean;
  showPrBadges: boolean;
}

interface DashboardSectionProps {
  id?: string;
  ref?: React.Ref<HTMLElement>;
}

export const DashboardSection = React.forwardRef<
  HTMLElement,
  DashboardSectionProps
>(({ id }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<DashboardFormData>({
    chartDefaultMetric: "total_volume",
    chartDefaultRange: "8w",
    heatmapMetric: "volume",
    showBodyWeightOverlay: false,
    showPrBadges: true,
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
        chartDefaultMetric: settings.chartDefaultMetric || "total_volume",
        chartDefaultRange: settings.chartDefaultRange || "8w",
        heatmapMetric: settings.heatmapMetric || "volume",
        showBodyWeightOverlay: settings.showBodyWeightOverlay ?? false,
        showPrBadges: settings.showPrBadges ?? true,
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
        chartDefaultMetric: settings.chartDefaultMetric || "total_volume",
        chartDefaultRange: settings.chartDefaultRange || "8w",
        heatmapMetric: settings.heatmapMetric || "volume",
        showBodyWeightOverlay: settings.showBodyWeightOverlay ?? false,
        showPrBadges: settings.showPrBadges ?? true,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <section ref={ref} id={id} className="space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Dashboard & Analytics
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Chart preferences and dashboard components
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
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
              Dashboard & Analytics
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Chart preferences and dashboard components
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
          {/* Chart Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium">Chart Preferences</h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Default Chart Metric</Label>
                <Select
                  value={formData.chartDefaultMetric}
                  onValueChange={(
                    value:
                      | "total_volume"
                      | "one_rm"
                      | "duration"
                      | "body_weight",
                  ) => setFormData({ ...formData, chartDefaultMetric: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total_volume">Total Volume</SelectItem>
                    <SelectItem value="one_rm">One Rep Max</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="body_weight">Body Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Time Range</Label>
                <Select
                  value={formData.chartDefaultRange}
                  onValueChange={(value: "2w" | "8w" | "6m" | "1y") =>
                    setFormData({ ...formData, chartDefaultRange: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2w">2 weeks</SelectItem>
                    <SelectItem value="8w">8 weeks</SelectItem>
                    <SelectItem value="6m">6 months</SelectItem>
                    <SelectItem value="1y">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Heatmap Metric</Label>
              <Select
                value={formData.heatmapMetric}
                onValueChange={(value: "volume" | "minutes") =>
                  setFormData({ ...formData, heatmapMetric: value })
                }
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Dashboard Components */}
          <div className="space-y-4">
            <h4 className="font-medium">Dashboard Components</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>PR Badges</Label>
                  <p className="text-muted-foreground text-xs">
                    Show personal record badges
                  </p>
                </div>
                <Switch
                  checked={formData.showPrBadges}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showPrBadges: checked })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Body Weight Overlay</Label>
                  <p className="text-muted-foreground text-xs">
                    Show body weight data on charts
                  </p>
                </div>
                <Switch
                  checked={formData.showBodyWeightOverlay}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showBodyWeightOverlay: checked })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
});

DashboardSection.displayName = "DashboardSection";
