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

      toast(`Success: ${response.data.message}`);
      router.replace("/sign-in");
    } catch (error: unknown) {
      let message = "An unexpected error occurred";

      type AxiosErrorResponse = {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      const err = error as AxiosErrorResponse;

      if (
        err &&
        typeof err === "object" &&
        err.response &&
        typeof err.response === "object" &&
        err.response.data &&
        typeof err.response.data === "object" &&
        err.response.data.message
      ) {
        message = err.response.data.message;
      } else if (
        err &&
        typeof err === "object" &&
        err.message
      ) {
        message = err.message;
      }

      toast("Verification failed", {
        description: message,
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">
            Enter the verification code sent to your email.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyAccount;
