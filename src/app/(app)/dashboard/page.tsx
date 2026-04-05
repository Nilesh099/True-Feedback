"use client";

import MessageCard from "@/components/MessageCard";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { RefreshCcw, Loader2, Copy } from "lucide-react";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { Message, User } from "@/model/User";

const Page = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");
  const username = (session?.user as User)?.username ?? "unknown";
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessage ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Error fetching accept settings", {
        description: axiosError.response?.data.message,
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(async (refresh = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>("api/get-messages");
      setMessages(response.data.messages || []);
      if (refresh) {
        toast.success("Messages refreshed");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Error fetching messages", {
        description: axiosError.response?.data.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== id));
  };

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Error updating setting", {
        description: axiosError.response?.data.message,
      });
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(profileUrl);
    toast.success("Copied!", {
      description: "Profile URL copied to clipboard.",
    });
  };

  useEffect(() => {
    if (!session?.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchMessages, fetchAcceptMessages]);

  if (!session?.user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Please log in to view the dashboard.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 md:px-8 lg:px-24 py-10 bg-muted/50">
      <div className="max-w-6xl mx-auto space-y-8">
        <section>
          <h1 className="text-4xl font-bold">User Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your anonymous messages and profile settings
          </p>
        </section>

        {/* Profile Link Section */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Your Profile Link</h2>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={profileUrl}
              disabled
              className="w-full"
            />
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
        </section>

        {/* Switch Section */}
        <section className="flex items-center space-x-3">
          <Switch
            {...register("acceptMessages")}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className="text-sm text-muted-foreground">
            Accept Messages:{" "}
            <span className="font-medium">
              {acceptMessages ? "On" : "Off"}
            </span>
          </span>
        </section>

        <Separator />

        {/* Refresh Messages Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Messages</h2>
          <Button variant="outline" onClick={() => fetchMessages(true)}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Messages Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageCard
                key={message._id}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <p className="col-span-full text-muted-foreground text-center">
              No messages found.
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default Page;
