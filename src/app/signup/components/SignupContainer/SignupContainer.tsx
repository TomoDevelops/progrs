"use client";
import { useSignup } from "../../hooks/useSignup";
import { SignupForm } from "../SignupForm";
import { SignupHero } from "../SignupHero";

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
