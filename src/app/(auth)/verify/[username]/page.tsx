"use client";

import { verifySchema } from "@/schemas/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const VerifyAccount = () => {
  const router = useRouter();
  const param = useParams<{ username: string }>();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post("/api/verify-code", {
        username: param.username,
        code: data.code,
      });

  toast.success(`Success: ${response.data.message}`);
  router.replace("/dashboard");
    } catch (error: unknown) {
      let message = "An unexpected error occurred";

      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }

      toast.error("Verification failed", {
        description: message,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1e2f] via-[#2d2f55] to-[#1e1e2f] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
            Verify Account
          </h1>
          <p className="text-sm text-gray-300 mt-2">
            Enter the code sent to your email
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter 6-digit code"
                      {...field}
                      className="rounded-xl bg-white/20 text-white placeholder:text-gray-400 border border-white/30 focus:ring-2 focus:ring-purple-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:opacity-90 transition"
            >
              Submit
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6 text-sm text-gray-300">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={() => toast.info("Resend link coming soon!")}
            className="text-purple-300 font-medium hover:underline"
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
