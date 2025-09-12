"use client";

import { useLogin } from "@/app/login/hooks/useLogin";
import { LoginForm } from "@/app/login/components/LoginForm";
import { LoginHero } from "@/app/login/components/LoginHero";

export const LoginContainer = () => {
  const loginState = useLogin();

  return (
    <div className="min-h-screen flex">
      <LoginHero />
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <LoginForm loginState={loginState} />
      </div>
    </div>
  );
};