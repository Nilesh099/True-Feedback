"use client";

import MessageCard from "@/components/MessageCard";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message, User } from "@/model/User";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@react-email/components";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const Page = () => {
  const [message, setMessage] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const handleDeleteMessage = (messageId: string) => {
    setMessage(message.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });
  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessages ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast(
        <>
          <div className="font-bold">Error</div>
          <div>
            {axiosError.response?.data.message ||
              "Failed to fetch accept settings"}
          </div>
        </>
      );
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>("api/get-messages");
        setMessage(response.data.messages || []);
        if (refresh) {
          toast(
            <>
              <div className="font-bold">Refreshed messages</div>
              <div>Showing Latest Messages</div>
            </>
          );
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast(
          <>
            <div className="font-bold">Error</div>
            <div>
              {axiosError.response?.data.message ||
                "Failed to fetch accept settings"}
            </div>
          </>
        );
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessage]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, setValue, fetchAcceptMessages, fetchMessages]);

  //handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast(
        <>
          <div className="font-bold">{response.data.message}</div>
        </>
      );
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast(
        <>
          <div className="font-bold">Error</div>
          <div>
            {axiosError.response?.data.message ||
              "Failed to fetch accept settings"}
          </div>
        </>
      );
    }
  };
 const username = (session?.user as User)?.username ?? "unknown";


  //TODO: do more research

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = async () => {
    navigator.clipboard.writeText(profileUrl);
    toast(
      <>
        <div className="font-bold">URL Copied</div>
        <div>Profile URL has been copied to clipboard</div>
      </>
    );
  };

  if (!session || !session.user) {
    return <div>Please Login</div>;
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
            title="Your unique profile URL"
            placeholder="Your unique profile URL"
          />
          <button onClick={copyToClipboard}>Copy</button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages:{acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />
      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4 mr-2" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {message.length > 0 ? (
          message.map((message) => (
            <MessageCard
              key={message._id as string}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages found</p>
        )}
      </div>
    </div>
  );
};

export default Page;
