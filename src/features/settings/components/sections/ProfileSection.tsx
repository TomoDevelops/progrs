"use client";

import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Camera, Save, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserProfile, ProfileUpdateData } from "@/features/settings/types";

interface ProfileFormData {
  name: string;
  email: string;
  username: string;
}

interface EmailChangeData {
  newEmail: string;
  password: string;
}

interface ProfileSectionProps {
  id?: string;
  ref?: React.Ref<HTMLElement>;
}

export const ProfileSection = React.forwardRef<
  HTMLElement,
  ProfileSectionProps
>(({ id }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailChangeData, setEmailChangeData] = useState<EmailChangeData>({
    newEmail: "",
    password: "",
  });
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    username: "",
  });
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<UserProfile> => {
      const response = await fetch("/api/me/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const result = await response.json();
      return result.data;
    },
    enabled: true, // Server-side auth ensures user is authenticated
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        username: profile.username || "",
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await fetch("/api/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    },
  });

  // Change email mutation
  const changeEmailMutation = useMutation({
    mutationFn: async (data: EmailChangeData) => {
      const response = await fetch("/api/me/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to change email");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEmailDialogOpen(false);
      setEmailChangeData({ newEmail: "", password: "" });
      toast.success(
        "Email change initiated. Please check your new email for verification.",
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to change email",
      );
    },
  });

  const handleSave = () => {
    // Only update name and username, not email
    updateProfileMutation.mutate({
      name: formData.name,
      username: formData.username,
    });
  };

  const handleEmailChange = () => {
    if (!emailChangeData.newEmail || !emailChangeData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    changeEmailMutation.mutate(emailChangeData);
  };

  const openEmailDialog = () => {
    setEmailChangeData({ newEmail: formData.email, password: "" });
    setIsEmailDialogOpen(true);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        username: profile.username || "",
      });
    }
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    // TODO: Implement avatar upload functionality
    toast.info("Avatar upload coming soon");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section ref={ref} id={id} className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Profile</CardTitle>
          <p className="text-muted-foreground text-sm">
            Personal information and avatar
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={profile?.image || undefined}
                  alt={profile?.username || "User"}
                />
                <AvatarFallback className="text-lg">
                  {profile?.name?.[0] || "U"}
                  {profile?.username?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              {/* <Button
                size="sm"
                variant="outline"
                className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full p-0"
                onClick={handleAvatarUpload}
              >
                <Camera className="h-4 w-4" />
              </Button> */}
            </div>
            <div>
              <h3 className="text-lg font-medium">{profile?.name || "User"}</h3>
              <p className="text-sm text-gray-600">
                @{profile?.username || "username"}
              </p>
              {/* <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleAvatarUpload}
              >
                <Camera className="mr-2 h-4 w-4" />
                Change Avatar
              </Button> */}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled={true}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openEmailDialog}
                  className="shrink-0"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Change
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Change Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email address and current password to confirm the
              change. You&apos;ll need to verify your new email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={emailChangeData.newEmail}
                onChange={(e) =>
                  setEmailChangeData({
                    ...emailChangeData,
                    newEmail: e.target.value,
                  })
                }
                placeholder="Enter new email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={emailChangeData.password}
                onChange={(e) =>
                  setEmailChangeData({
                    ...emailChangeData,
                    password: e.target.value,
                  })
                }
                placeholder="Enter your current password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailDialogOpen(false)}
              disabled={changeEmailMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEmailChange}
              disabled={changeEmailMutation.isPending}
            >
              {changeEmailMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
});

ProfileSection.displayName = "ProfileSection";
