"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/shared/components/ui/button";
import { Settings, LogOut, Menu, X } from "lucide-react";

interface HeaderProps {
  onSignOut: () => void;
}

export const Header = ({ onSignOut }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-semibold text-transparent">
                Progrs
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button className="h-10 rounded-full bg-white text-black hover:bg-gray-50 has-[>svg]:px-5">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                className="h-10 rounded-full bg-white text-black hover:bg-gray-50 has-[>svg]:px-5"
                onClick={onSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <Button
                className="h-10 w-10 rounded-full bg-white text-black hover:bg-gray-50 p-0"
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
              className="fixed inset-0 bg-black z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleMobileMenu}
            />
            
            {/* Drawer */}
            <motion.div 
              className="fixed top-0 right-0 h-full w-3/4 bg-white shadow-lg z-50 md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-lg font-semibold">Menu</span>
                <Button
                  className="h-8 w-8 rounded-full bg-gray-100 text-black hover:bg-gray-200 p-0"
                  onClick={toggleMobileMenu}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <motion.div 
                className="p-4 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Button className="w-full justify-start h-12 rounded-lg bg-gray-50 text-black hover:bg-gray-100">
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Button>
                <Button
                  className="w-full justify-start h-12 rounded-lg bg-gray-50 text-black hover:bg-gray-100"
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
    </>
  );
};