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
import { ArrowLeft, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UseForgotPasswordReturn } from "@/app/forgot-password/hooks/useForgotPassword";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  forgotPasswordState: Pick<
    UseForgotPasswordReturn,
    | "isLoading"
    | "error"
    | "isSuccess"
    | "handleFormSubmit"
    | "handleContinue"
    | "email"
  >;
}

export const ForgotPasswordForm = ({
  forgotPasswordState,
}: ForgotPasswordFormProps) => {
  const {
    isLoading,
    error,
    isSuccess,
    handleFormSubmit,
    handleContinue,
    email,
  } = forgotPasswordState;

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    handleFormSubmit(data.email);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="pb-6 text-center">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                Check your email
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                We sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 text-center">
                <p className="text-sm text-gray-600">
                  Click the link in the email to reset your password. If you
                  don&apos;t see it, check your spam folder.
                </p>

                <Button
                  onClick={handleContinue}
                  className="h-12 w-full bg-blue-600 hover:bg-blue-700"
                >
                  Continue to verification
                </Button>
              </div>

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
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="pb-6 text-center">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Forgot password?
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              No worries, we&apos;ll send you reset instructions.
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="h-12 w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Reset password"}
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
