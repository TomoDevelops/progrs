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
import { Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUserSettings } from "@/shared/hooks/useUserSettings";
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

interface FormErrors {
  chartDefaultMetric?: string;
  chartDefaultRange?: string;
  heatmapMetric?: string;
  general?: string;
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const queryClient = useQueryClient();

  // Track form changes
  const updateFormData = React.useCallback((updates: Partial<DashboardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
    setErrors(prev => ({ ...prev, general: undefined }));
  }, []);

  // Fetch user settings using shared hook
  const { data: settings, isLoading, error: fetchError, refetch } = useUserSettings();

  // Update form data when settings load and track changes
  React.useEffect(() => {
    if (settings) {
      const newFormData = {
        chartDefaultMetric: settings.chartDefaultMetric || "total_volume",
        chartDefaultRange: settings.chartDefaultRange || "8w",
        heatmapMetric: settings.heatmapMetric || "volume",
        showBodyWeightOverlay: settings.showBodyWeightOverlay ?? false,
        showPrBadges: settings.showPrBadges ?? true,
      };
      setFormData(newFormData);
      setHasUnsavedChanges(false);
      setErrors({});
    }
  }, [settings]);

  // Update settings mutation with optimistic updates
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: UserSettingsUpdate) => {
      const response = await fetch("/api/me/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || "Failed to update settings");
      }
      return response.json();
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["userSettings"] });
      
      // Snapshot previous value
      const previousSettings = queryClient.getQueryData<UserSettings>(["userSettings"]);
      
      // Optimistically update
      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(["userSettings"], {
          ...previousSettings,
          ...updates,
        });
      }
      
      return { previousSettings };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["userSettings"], data.data);
      setIsEditing(false);
      setHasUnsavedChanges(false);
      setErrors({});
      toast.success("Dashboard settings updated successfully");
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(["userSettings"], context.previousSettings);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to update settings";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.chartDefaultMetric) {
      newErrors.chartDefaultMetric = "Please select a default chart metric";
    }
    
    if (!formData.chartDefaultRange) {
      newErrors.chartDefaultRange = "Please select a default time range";
    }
    
    if (!formData.heatmapMetric) {
      newErrors.heatmapMetric = "Please select a heatmap metric";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors before saving");
      return;
    }
    
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
    setHasUnsavedChanges(false);
    setErrors({});
  };

  // Handle unsaved changes warning
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isEditing) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isEditing]);

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
              <span className="ml-2 text-sm text-muted-foreground">Loading settings...</span>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (fetchError) {
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
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    Failed to load dashboard settings. {fetchError.message}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={() => refetch()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
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
              <Button 
                size="sm" 
                onClick={() => setIsEditing(true)}
                disabled={updateSettingsMutation.isPending}
              >
                Edit
              </Button>
            )}
            {hasUnsavedChanges && isEditing && (
              <span className="text-xs text-amber-600 ml-2">
                Unsaved changes
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Alert */}
          {errors.general && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success indicator for optimistic updates */}
          {updateSettingsMutation.isSuccess && !updateSettingsMutation.isPending && (
            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <div className="flex">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    Settings updated successfully
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chart Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium">Chart Preferences</h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className={errors.chartDefaultMetric ? "text-destructive" : ""}>
                  Default Chart Metric
                  {errors.chartDefaultMetric && (
                    <span className="text-xs text-destructive ml-1">*</span>
                  )}
                </Label>
                <Select
                  value={formData.chartDefaultMetric}
                  onValueChange={(
                    value:
                      | "total_volume"
                      | "one_rm"
                      | "duration"
                      | "body_weight",
                  ) => updateFormData({ chartDefaultMetric: value })}
                  disabled={!isEditing || updateSettingsMutation.isPending}
                >
                  <SelectTrigger className={errors.chartDefaultMetric ? "border-destructive" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total_volume">Total Volume</SelectItem>
                    <SelectItem value="one_rm">One Rep Max</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="body_weight">Body Weight</SelectItem>
                  </SelectContent>
                </Select>
                {errors.chartDefaultMetric && (
                  <p className="text-xs text-destructive">{errors.chartDefaultMetric}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className={errors.chartDefaultRange ? "text-destructive" : ""}>
                  Default Time Range
                  {errors.chartDefaultRange && (
                    <span className="text-xs text-destructive ml-1">*</span>
                  )}
                </Label>
                <Select
                  value={formData.chartDefaultRange}
                  onValueChange={(value: "2w" | "8w" | "6m" | "1y") =>
                    updateFormData({ chartDefaultRange: value })
                  }
                  disabled={!isEditing || updateSettingsMutation.isPending}
                >
                  <SelectTrigger className={errors.chartDefaultRange ? "border-destructive" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2w">2 weeks</SelectItem>
                    <SelectItem value="8w">8 weeks</SelectItem>
                    <SelectItem value="6m">6 months</SelectItem>
                    <SelectItem value="1y">1 year</SelectItem>
                  </SelectContent>
                </Select>
                {errors.chartDefaultRange && (
                  <p className="text-xs text-destructive">{errors.chartDefaultRange}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className={errors.heatmapMetric ? "text-destructive" : ""}>
                Heatmap Metric
                {errors.heatmapMetric && (
                  <span className="text-xs text-destructive ml-1">*</span>
                )}
              </Label>
              <Select
                value={formData.heatmapMetric}
                onValueChange={(value: "volume" | "minutes") =>
                  updateFormData({ heatmapMetric: value })
                }
                disabled={!isEditing || updateSettingsMutation.isPending}
              >
                <SelectTrigger className={errors.heatmapMetric ? "border-destructive" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                </SelectContent>
              </Select>
              {errors.heatmapMetric && (
                <p className="text-xs text-destructive">{errors.heatmapMetric}</p>
              )}
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
                  onCheckedChange={(checked) => updateFormData({ showPrBadges: checked })}
                  disabled={!isEditing || updateSettingsMutation.isPending}
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
                  onCheckedChange={(checked) => updateFormData({ showBodyWeightOverlay: checked })}
                  disabled={!isEditing || updateSettingsMutation.isPending}
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
