"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/shared/components/ui/button";
import { Settings, LogOut, Menu, X, Play } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onSignOut: () => void;
  onStartWorkout?: () => void;
  hasWorkoutsToday?: boolean;
}

export const Header = ({
  onSignOut,
  onStartWorkout,
  hasWorkoutsToday = false,
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-semibold text-transparent">
                Progrs
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-4 md:flex">
              {/* Hero Start Workout CTA */}
              {hasWorkoutsToday && onStartWorkout && (
                <Button
                  onClick={onStartWorkout}
                  variant="default"
                  size="lg"
                  radius="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start workout
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="default"
                radius="full"
                className="bg-white text-black hover:bg-gray-50"
              >
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button
                variant="outline"
                size="default"
                radius="full"
                className="bg-white text-black hover:bg-gray-50"
                onClick={onSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="icon"
                radius="full"
                className="bg-white text-black hover:bg-gray-50"
                onClick={toggleMobileMenu}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleMobileMenu}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 z-50 h-full w-3/4 bg-white shadow-lg md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between border-b p-4">
                <span className="text-lg font-semibold">Menu</span>
                <Button
                  className="h-8 w-8 rounded-full bg-gray-100 p-0 text-black hover:bg-gray-200"
                  onClick={toggleMobileMenu}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <motion.div
                className="space-y-4 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {/* Mobile Hero Start Workout CTA */}
                {hasWorkoutsToday && onStartWorkout && (
                  <Button
                    onClick={() => {
                      if (onStartWorkout) {
                        onStartWorkout();
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    variant="default"
                    size="lg"
                    radius="lg"
                    className="w-full justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start workout
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="default"
                  radius="lg"
                  className="w-full justify-start bg-white text-black hover:bg-gray-50"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  radius="lg"
                  className="w-full justify-start bg-white text-black hover:bg-gray-50"
                  onClick={() => {
                    onSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign out
                </Button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile FAB for Start Workout */}
      {hasWorkoutsToday && onStartWorkout && (
        <div className="fixed right-6 bottom-6 z-50 md:hidden">
          <Button
            onClick={onStartWorkout}
            variant="default"
            size="icon"
            radius="full"
            className="hover:shadow-3xl h-14 w-14 bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl transition-all duration-200 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
  );
};
