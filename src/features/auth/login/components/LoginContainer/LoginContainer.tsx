"use client";

import { useLogin } from "@/features/auth/login/hooks/useLogin";
import { LoginForm } from "@/features/auth/login/components/LoginForm";
import { LoginHero } from "@/features/auth/login/components/LoginHero";

export const LoginContainer = () => {
  const loginState = useLogin();

  return (
    <div className="flex min-h-screen">
      <LoginHero />
      {/* Right Side - Login Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <LoginForm loginState={loginState} />
      </div>
    </div>
  );
};
