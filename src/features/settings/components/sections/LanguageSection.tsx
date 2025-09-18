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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "sonner";
import { Clock } from "lucide-react";

interface LanguageSettings {
  language: string;
  region: string;
  timezone: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  timeFormat: "12h" | "24h";
  firstDayOfWeek: "sunday" | "monday";
  measurementSystem: "metric" | "imperial";
}

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
];

const regions = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "BR", name: "Brazil" },
];

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Australia/Sydney",
];

interface LanguageSectionProps {
  id?: string;
  ref?: React.Ref<HTMLElement>;
}

export const LanguageSection = React.forwardRef<
  HTMLElement,
  LanguageSectionProps
>(({ id }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    language: "en",
    region: "US",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    firstDayOfWeek: "sunday",
    measurementSystem: "imperial",
  });
  const [originalSettings, setOriginalSettings] =
    useState<LanguageSettings>(languageSettings);

  useEffect(() => {
    fetchLanguageSettings();
  }, []);

  const fetchLanguageSettings = async () => {
    try {
      const response = await fetch("/api/me/settings");
      if (response.ok) {
        const data = await response.json();
        const settings = {
          language: data.language || "en",
          region: data.region || "US",
          timezone: data.timezone || "America/New_York",
          dateFormat: data.dateFormat || "MM/DD/YYYY",
          timeFormat: data.timeFormat || "12h",
          firstDayOfWeek: data.firstDayOfWeek || "sunday",
          measurementSystem: data.measurementSystem || "imperial",
        };
        setLanguageSettings(settings);
        setOriginalSettings(settings);
      }
    } catch (error) {
      console.error("Failed to fetch language settings:", error);
      toast.error("Failed to load language settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/me/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(languageSettings),
      });

      if (response.ok) {
        setOriginalSettings(languageSettings);
        setIsEditing(false);
        toast.success("Language settings updated successfully");
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to update language settings:", error);
      toast.error("Failed to update language settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLanguageSettings(originalSettings);
    setIsEditing(false);
  };

  const handleSettingChange = (key: keyof LanguageSettings, value: string) => {
    setLanguageSettings((prev) => ({ ...prev, [key]: value }));
    if (!isEditing) setIsEditing(true);
  };

  const getLanguageName = (code: string) => {
    const lang = languages.find((l) => l.code === code);
    return lang ? `${lang.name} (${lang.nativeName})` : code;
  };

  const getRegionName = (code: string) => {
    const region = regions.find((r) => r.code === code);
    return region ? region.name : code;
  };

  if (isLoading) {
    return (
      <section ref={ref} id={id} className="space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Language & Region
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Set your preferred language and regional settings
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
            Language & Region
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Set your preferred language and regional settings
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Language</Label>
            <Select
              value={languageSettings.language}
              onValueChange={(value) => handleSettingChange("language", value)}
            >
              <SelectTrigger>
                <SelectValue>
                  {getLanguageName(languageSettings.language)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Region</Label>
            <Select
              value={languageSettings.region}
              onValueChange={(value) => handleSettingChange("region", value)}
            >
              <SelectTrigger>
                <SelectValue>
                  {getRegionName(languageSettings.region)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.code} value={region.code}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Timezone */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Timezone
            </Label>
            <Select
              value={languageSettings.timezone}
              onValueChange={(value) => handleSettingChange("timezone", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Date & Time Format */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Date & Time Format</Label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-sm">Date Format</Label>
                <Select
                  value={languageSettings.dateFormat}
                  onValueChange={(value) =>
                    handleSettingChange(
                      "dateFormat",
                      value as LanguageSettings["dateFormat"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">
                      MM/DD/YYYY (12/31/2024)
                    </SelectItem>
                    <SelectItem value="DD/MM/YYYY">
                      DD/MM/YYYY (31/12/2024)
                    </SelectItem>
                    <SelectItem value="YYYY-MM-DD">
                      YYYY-MM-DD (2024-12-31)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Time Format</Label>
                <Select
                  value={languageSettings.timeFormat}
                  onValueChange={(value) =>
                    handleSettingChange(
                      "timeFormat",
                      value as LanguageSettings["timeFormat"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                    <SelectItem value="24h">24-hour (14:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Regional Preferences */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Regional Preferences</Label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-sm">First Day of Week</Label>
                <Select
                  value={languageSettings.firstDayOfWeek}
                  onValueChange={(value) =>
                    handleSettingChange(
                      "firstDayOfWeek",
                      value as LanguageSettings["firstDayOfWeek"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Measurement System</Label>
                <Select
                  value={languageSettings.measurementSystem}
                  onValueChange={(value) =>
                    handleSettingChange(
                      "measurementSystem",
                      value as LanguageSettings["measurementSystem"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                    <SelectItem value="imperial">Imperial (lbs, ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

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

LanguageSection.displayName = "LanguageSection";
