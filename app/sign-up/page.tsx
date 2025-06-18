"use client";
import React, { useState } from "react";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Signup = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }
    try {
      await signUp.create({
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setPendingVerification(true);
    } catch (error: unknown) {
      console.log(JSON.stringify(error, null, 2));
      if (error && typeof error === "object" && "errors" in error) {
        const clerkError = error as { errors: { message: string }[] };
        setError(clerkError.errors[0]?.message || "An error occurred");
      } else {
        setError("An error occurred");
      }
    }
  }

  async function onPressVerify(e: React.FormEvent) {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }
    try {
      const completeSignup = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignup.status !== "complete") {
        console.log(JSON.stringify(completeSignup, null, 2));
      }
      if (completeSignup.status === "complete") {
        await setActive({ session: completeSignup.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.log(JSON.stringify(err, null, 2));
      if (err && typeof err === "object" && "errors" in err) {
        const clerkError = err as { errors: { message: string }[] };
        setError(clerkError.errors[0]?.message || "An error occurred");
      } else {
        setError("An error occurred");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {pendingVerification
                ? "Verify your email"
                : "Create your account"}
            </CardTitle>
            <CardDescription className="text-center">
              {pendingVerification
                ? "We've sent a verification code to your email address"
                : "Sign up to get started with your account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {!pendingVerification ? (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Clerk CAPTCHA widget container */}
                <div id="clerk-captcha"></div>

                <Button type="submit" className="w-full">
                  Sign up
                </Button>
              </form>
            ) : (
              <form onSubmit={onPressVerify} className="space-y-4">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Verification code
                  </label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter verification code"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Verify email
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter>
            <div className="text-center text-sm text-gray-600 w-full">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
