"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
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
import Link from "next/link";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";

const Page = () => {
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
      console.log("Signing in with:", data.identifier);
      
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      console.log("Sign-in result:", result);

      if (result?.error) {
        console.error("Sign-in error:", result.error);
        toast.error(
          result.error === "CredentialsSignin"
            ? "Incorrect username or password"
            : result.error
        );
        return;
      }

      if (result?.ok) {
        toast.success("Sign in successful");
        // Force hard navigation to dashboard to ensure session is loaded
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Sign-in exception:", error);
      toast.error("An unexpected error occurred during sign in");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1e2f] via-[#2d2f55] to-[#1e1e2f] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-300 mt-2">
            Sign in to your anonymous profile
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Username */}
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Email / Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com or username"
                      {...field}
                      value={field.value || ""}
                      className="rounded-xl bg-white/20 text-white placeholder:text-gray-400 border border-white/30 focus:ring-2 focus:ring-purple-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      value={field.value || ""}
                      className="rounded-xl bg-white/20 text-white placeholder:text-gray-400 border border-white/30 focus:ring-2 focus:ring-purple-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:opacity-90 transition"
            >
              Sign In
            </Button>
          </form>
        </Form>

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
