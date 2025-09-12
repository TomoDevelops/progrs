"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import type { UseResetPasswordReturn } from "@/app/reset-password/hooks/useResetPassword";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  resetPasswordState: Pick<
    UseResetPasswordReturn,
    | "isLoading"
    | "error"
    | "handleFormSubmit"
    | "getPasswordStrength"
    | "getStrengthColor"
    | "getStrengthText"
  >;
}

export const ResetPasswordForm = ({
  resetPasswordState,
}: ResetPasswordFormProps) => {
  const {
    isLoading,
    error,
    handleFormSubmit,
    getPasswordStrength,
    getStrengthColor,
    getStrengthText,
  } = resetPasswordState;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const passwordStrength = getPasswordStrength(password);

  const onSubmit = (data: ResetPasswordFormData) => {
    handleFormSubmit(data.password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="pb-6 text-center">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Set new password
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Your new password must be different from previous used passwords.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            className="h-12 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />

                      {/* Password strength indicator */}
                      {password && (
                        <div className="space-y-2">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full ${
                                  level <= passwordStrength
                                    ? getStrengthColor(passwordStrength)
                                    : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p
                            className={`text-xs ${
                              passwordStrength <= 2
                                ? "text-red-600"
                                : passwordStrength <= 3
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            Password strength:{" "}
                            {getStrengthText(passwordStrength)}
                          </p>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            className="h-12 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <div className="text-xs text-gray-600">
                    <p>Password must contain:</p>
                    <ul className="mt-1 list-inside list-disc space-y-1">
                      <li
                        className={
                          password.length >= 8
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        At least 8 characters
                      </li>
                      <li
                        className={
                          /(?=.*[a-z])/.test(password)
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        One lowercase letter
                      </li>
                      <li
                        className={
                          /(?=.*[A-Z])/.test(password)
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        One uppercase letter
                      </li>
                      <li
                        className={
                          /(?=.*\d)/.test(password)
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        One number
                      </li>
                    </ul>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || passwordStrength < 4}
                >
                  {isLoading ? "Updating password..." : "Update password"}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
