"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  User,
  Dumbbell,
  BarChart3,
  Bell,
  Shield,
  Eye,
  Palette,
  Globe,
  Keyboard,
} from "lucide-react";
import type { SettingsSection } from "./SettingsContainer";

interface SettingsNavigationProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

const navigationItems = [
  {
    id: "profile" as const,
    label: "Profile",
    icon: User,
    description: "Personal information and avatar",
  },
  {
    id: "training" as const,
    label: "Training Preferences",
    icon: Dumbbell,
    description: "Units, equipment, and workout settings",
  },
  {
    id: "dashboard" as const,
    label: "Dashboard & Analytics",
    icon: BarChart3,
    description: "Chart preferences and display options",
  },
  {
    id: "notifications" as const,
    label: "Notifications",
    icon: Bell,
    description: "Email, push, and reminder settings",
  },
  {
    id: "security" as const,
    label: "Security",
    icon: Shield,
    description: "Password and two-factor authentication",
  },
  {
    id: "privacy" as const,
    label: "Privacy",
    icon: Eye,
    description: "Data sharing and visibility settings",
  },
  {
    id: "appearance" as const,
    label: "Appearance",
    icon: Palette,
    description: "Theme and visual preferences",
  },
  {
    id: "language" as const,
    label: "Language & Region",
    icon: Globe,
    description: "Language, timezone, and locale settings",
  },
  {
    id: "shortcuts" as const,
    label: "Keyboard Shortcuts",
    icon: Keyboard,
    description: "Customize keyboard shortcuts",
  },
];

export function SettingsNavigation({
  activeSection,
  onSectionChange,
}: SettingsNavigationProps) {
  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full justify-start h-auto p-4 text-left",
              isActive
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "text-gray-700 hover:bg-gray-100"
            )}
            onClick={() => onSectionChange(item.id)}
          >
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.label}</div>
                <div className={cn(
                  "text-sm mt-1",
                  isActive ? "text-orange-100" : "text-gray-500"
                )}>
                  {item.description}
                </div>
              </div>
            </div>
          </Button>
        );
      })}
    </nav>
  );
}