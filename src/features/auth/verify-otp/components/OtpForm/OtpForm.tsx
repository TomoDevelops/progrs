"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { ArrowLeft, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UseOtpVerificationReturn } from "@/features/auth/verify-otp/hooks/useOtpVerification";

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "Please enter the complete 6-digit code")
    .max(6, "Code must be 6 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface OtpFormProps {
  otpState: Pick<
    UseOtpVerificationReturn,
    | "isLoading"
    | "isResending"
    | "error"
    | "countdown"
    | "isPasswordReset"
    | "handleFormSubmit"
    | "handleResendOTP"
    | "getTitle"
    | "getDescription"
  >;
}

export const OtpForm = ({ otpState }: OtpFormProps) => {
  const {
    isLoading,
    isResending,
    error,
    countdown,
    isPasswordReset,
    handleFormSubmit,
    handleResendOTP,
    getTitle,
    getDescription,
  } = otpState;

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = (data: OtpFormData) => {
    handleFormSubmit(data.otp);
  };

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
            <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {getDescription()}
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
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="block text-center">
                        Enter 6-digit code
                      </FormLabel>
                      <FormControl>
                        <div className="flex justify-center">
                          <InputOTP
                            maxLength={6}
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="h-12 w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || form.watch("otp").length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </form>
            </Form>

            <div className="space-y-4 text-center">
              <div className="text-sm text-gray-600">
                Didn&apos;t receive the code?
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isResending}
                className="text-blue-600 hover:text-blue-700"
              >
                {isResending
                  ? "Sending..."
                  : countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend code"}
              </Button>
            </div>

            <div className="text-center">
              <Link
                href={isPasswordReset ? "/login" : "/signup"}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to {isPasswordReset ? "login" : "sign up"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
