"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { signIn } from "next-auth/react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInSchema } from "@/schemas/signInSchema";

const Page = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      // ❌ Error case
      if (result?.error) {
        toast.error(
          result.error === "CredentialsSignin"
            ? "Incorrect username or password"
            : result.error
        );
        return;
      }

      // ✅ Success case
      if (result?.ok) {
        toast.success("Sign in successful");

        // Navigate to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1e2f] via-[#2d2f55] to-[#1e1e2f] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-300 mt-2">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Identifier */}
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">
                    Email / Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="you@example.com or username"
                      className="rounded-xl bg-white/20 text-white placeholder:text-gray-400 border border-white/30 focus:ring-2 focus:ring-purple-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      type="password"
                      placeholder="••••••••"
                      className="rounded-xl bg-white/20 text-white placeholder:text-gray-400 border border-white/30 focus:ring-2 focus:ring-purple-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Button */}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:opacity-90 transition"
            >
              Sign In
            </Button>

          </form>
        </Form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-300">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-purple-300 font-medium hover:underline"
          >
            Sign up
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Page;