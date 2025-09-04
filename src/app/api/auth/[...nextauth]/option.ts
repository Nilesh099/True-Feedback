import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import type { User } from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
  async authorize(credentials: Record<"email" | "password", string> | undefined): Promise<User | null> {
        await dbConnect();
        try {
          const emailOrUsername = credentials?.email;
          const password = credentials?.password;
          if (!emailOrUsername || !password) {
            throw new Error("Missing credentials");
          }
          const user = await UserModel.findOne({
            $or: [
              { email: emailOrUsername },
              { username: emailOrUsername },
            ],
          }).lean();

          if (!user) {
            throw new Error("No user found");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before login");
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return {
              id: user._id?.toString(),
              email: user.email,
              username: user.username,
              isVerified: user.isVerified,
              isAcceptingMessage: user.isAcceptingMessage,
            };
          } else {
            throw new Error("Incorrect password");
          }
        } catch (err: unknown) {
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
        if(token) {
            session.user._id = token._id
            session.user.isVerified= token.isVerified
            session.user.isAcceptingMessages = token.isAcceptingMessages
            session.user.username = token.username  
        }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
