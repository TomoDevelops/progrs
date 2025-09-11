"use client";

import { useLogin } from "../../hooks/useLogin";
import { LoginForm } from "../LoginForm";
import { LoginHero } from "../LoginHero";

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