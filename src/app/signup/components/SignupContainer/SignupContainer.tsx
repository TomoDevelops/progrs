"use client";
import { useSignup } from "@/app/signup/hooks/useSignup";
import { SignupForm } from "@/app/signup/components/SignupForm";
import { SignupHero } from "@/app/signup/components/SignupHero";

export const SignupContainer = () => {
    const signupState = useSignup();

    return (
        <div className="min-h-screen flex">
            <SignupHero />
            <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
                <SignupForm signupState={signupState} />
            </div>
        </div>
    );
};
