"use client";
import { useSignup } from "@/app/signup/hooks/useSignup";
import { SignupForm } from "@/app/signup/components/SignupForm";
import { SignupHero } from "@/app/signup/components/SignupHero";

export const SignupContainer = () => {
  const signupState = useSignup();

  return (
    <div className="flex min-h-screen">
      <SignupHero />
      <div className="flex flex-1 items-center justify-center p-6 lg:p-8">
        <SignupForm signupState={signupState} />
      </div>
    </div>
  );
};
