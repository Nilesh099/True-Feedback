import { Message } from "@/model/User";

export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean;
    messages?:Array<Message>;
    errors?: Array<{field: string, message: string}>;
}