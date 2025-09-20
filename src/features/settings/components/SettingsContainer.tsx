"use client";

import { useRef } from "react";
import { Header } from "@/shared/components/Header";
import { ProfileSection } from "./sections/ProfileSection";
import { TrainingSection } from "./sections/TrainingSection";
// import { DashboardSection } from "./sections/DashboardSection";
// import { NotificationsSection } from "./sections/NotificationsSection";
import { SecuritySection } from "./sections/SecuritySection";
// import { PrivacySection } from "./sections/PrivacySection";
// import { AppearanceSection } from "./sections/AppearanceSection";
// import { LanguageSection } from "./sections/LanguageSection";
// import { ShortcutsSection } from "./sections/ShortcutsSection";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

import { authClient } from "@/shared/lib/auth-client";
import {
  User,
  Dumbbell,
  // BarChart3,
  // Bell,
  Shield,
  // Eye,
  // Palette,
  // Globe,
  // Keyboard,
} from "lucide-react";

export type SettingsSection =
  | "profile"
  | "training"
  // | "dashboard"
  // | "notifications"
  | "security";
// | "privacy"
// | "appearance"
// | "language"
// | "shortcuts"

const navigationItems = [
  {
    id: "profile" as const,
    label: "Profile",
    icon: User,
    description: "Personal information and avatar",
  },
  {
    id: "training" as const,
    label: "Training",
    icon: Dumbbell,
    description: "Units, equipment, and workout settings",
  },
  // {
  //   id: "dashboard" as const,
  //   label: "Dashboard",
  //   icon: BarChart3,
  //   description: "Chart preferences and display options",
  // },
  // {
  //   id: "notifications" as const,
  //   label: "Notifications",
  //   icon: Bell,
  //   description: "Email, push, and reminder settings",
  // },
  {
    id: "security" as const,
    label: "Security",
    icon: Shield,
    description: "Password and two-factor authentication",
  },
  // {
  //   id: "privacy" as const,
  //   label: "Privacy & Data",
  //   icon: Eye,
  //   description: "Data sharing and visibility settings",
  // },
  // {
  //   id: "appearance" as const,
  //   label: "Appearance",
  //   icon: Palette,
  //   description: "Theme and visual preferences",
  // },
  // {
  //   id: "language" as const,
  //   label: "Language & Region",
  //   icon: Globe,
  //   description: "Language, timezone, and locale settings",
  // },
  // {
  //   id: "shortcuts" as const,
  //   label: "Keyboard Shortcuts",
  //   icon: Keyboard,
  //   description: "Customize keyboard shortcuts",
  // },
];

export function SettingsContainer() {
  const router = useRouter();
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const renderSection = (sectionId: SettingsSection) => {
    const sectionProps = {
      ref: (el: HTMLElement | null) => {
        sectionsRef.current[sectionId] = el;
      },
      id: `section-${sectionId}`,
    };

    switch (sectionId) {
      case "profile":
        return <ProfileSection {...sectionProps} />;
      case "training":
        return <TrainingSection {...sectionProps} />;
      // case "dashboard":
      // return <DashboardSection {...sectionProps} />;
      // case "notifications":
      // return <NotificationsSection {...sectionProps} />;
      case "security":
        return <SecuritySection {...sectionProps} />;
      // case "privacy":
      //   return <PrivacySection {...sectionProps} />;
      // case "appearance":
      //   return <AppearanceSection {...sectionProps} />;
      // case "language":
      //   return <LanguageSection {...sectionProps} />;
      // case "shortcuts":
      //   return <ShortcutsSection {...sectionProps} />;
      default:
        return <ProfileSection {...sectionProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header
        onSignOut={handleSignOut}
        onStartWorkout={() => {}}
        hasWorkoutsToday={false}
      />

      {/* Page Header */}
      <div className="border-b bg-gray-100 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-foreground text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {navigationItems.map((item) => (
            <ErrorBoundary
              key={item.id}
              title={`Failed to load ${item.label.toLowerCase()} settings`}
              queryKey={["settings", item.id]}
            >
              {renderSection(item.id)}
            </ErrorBoundary>
          ))}
        </div>
      </div>
    </div>
  );
}
