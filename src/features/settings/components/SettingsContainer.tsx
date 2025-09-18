"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/shared/components/Header";
import { ProfileSection } from "./sections/ProfileSection";
import { TrainingSection } from "./sections/TrainingSection";
import { DashboardSection } from "./sections/DashboardSection";
// import { NotificationsSection } from "./sections/NotificationsSection";
import { SecuritySection } from "./sections/SecuritySection";
// import { PrivacySection } from "./sections/PrivacySection";
// import { AppearanceSection } from "./sections/AppearanceSection";
// import { LanguageSection } from "./sections/LanguageSection";
// import { ShortcutsSection } from "./sections/ShortcutsSection";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { useAuthenticatedSession } from "@/shared/hooks/useSession";
import { authClient } from "@/shared/lib/auth-client";
import {
  User,
  Dumbbell,
  BarChart3,
  // Bell,
  Shield,
  // Eye,
  // Palette,
  // Globe,
  // Keyboard,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type SettingsSection =
  | "profile"
  | "training"
  | "dashboard"
  // | "notifications"
  | "security"
  | "privacy"
  | "appearance"
  | "language"
  | "shortcuts";

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
  {
    id: "dashboard" as const,
    label: "Dashboard",
    icon: BarChart3,
    description: "Chart preferences and display options",
  },
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
  // Verify session and redirect to login if not authenticated
  useAuthenticatedSession();

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const tabsRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  // Scrollspy functionality
  useEffect(() => {
    const sections = Object.values(sectionsRef.current).filter(
      Boolean,
    ) as HTMLElement[];

    if (sections.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id.replace(
              "section-",
              "",
            ) as SettingsSection;
            setActiveSection(sectionId);

            // Update URL hash without scrolling
            const newUrl = `${window.location.pathname}#${sectionId}`;
            window.history.replaceState(null, "", newUrl);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0.1,
      },
    );

    sections.forEach((section) => {
      observerRef.current?.observe(section);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Handle initial hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1) as SettingsSection;
    if (hash && navigationItems.find((item) => item.id === hash)) {
      setActiveSection(hash);
      setTimeout(() => scrollToSection(hash), 100);
    }
  }, []);

  const scrollToSection = (sectionId: SettingsSection) => {
    const element = sectionsRef.current[sectionId];
    if (element) {
      const headerOffset = 140; // Account for sticky header + tabs
      const elementPosition = element.offsetTop - headerOffset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  const handleTabClick = (sectionId: SettingsSection) => {
    setActiveSection(sectionId);
    scrollToSection(sectionId);
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}#${sectionId}`,
    );
  };

  const handleJumpToSelect = (sectionId: SettingsSection) => {
    handleTabClick(sectionId);
    setIsSheetOpen(false);
  };

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
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
      case "dashboard":
        return <DashboardSection {...sectionProps} />;
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
          <div className="mb-6">
            <h1 className="text-foreground text-2xl font-semibold">Settings</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Sticky Navigation Tabs */}
          <div className="relative">
            {/* Desktop scroll buttons */}
            <Button
              variant="ghost"
              size="sm"
              className="bg-background/80 absolute top-1/2 left-0 z-10 hidden -translate-y-1/2 backdrop-blur md:flex"
              onClick={() => scrollTabs("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-background/80 absolute top-1/2 right-0 z-10 hidden -translate-y-1/2 backdrop-blur md:flex"
              onClick={() => scrollTabs("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Scrollable tabs container */}
            <div
              ref={tabsRef}
              className="no-scrollbar flex gap-2 overflow-x-auto px-8 md:px-12"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)",
              }}
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex-shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                    onClick={() => handleTabClick(item.id)}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`section-${item.id}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {navigationItems.map((item) => (
            <div key={item.id}>{renderSection(item.id)}</div>
          ))}
        </div>
      </div>

      {/* Mobile Jump To FAB */}
      <div className="fixed right-6 bottom-6 md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg"
              aria-label="Jump to section"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Jump to Section</SheetTitle>
            </SheetHeader>
            <Command className="mt-4">
              <CommandInput placeholder="Search settings..." />
              <CommandList>
                <CommandEmpty>No settings found.</CommandEmpty>
                <CommandGroup>
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <CommandItem
                        key={item.id}
                        value={`${item.label} ${item.description}`}
                        onSelect={() => handleJumpToSelect(item.id)}
                        className="flex items-center gap-3 p-3"
                      >
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-muted-foreground text-sm">
                            {item.description}
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
