import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/semdVerificationEmail";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    console.log("Starting sign-up process...");
    await dbConnect();
    console.log("Database connection established");
    
    const requestData = await request.json();
    console.log("Received sign-up data:", requestData);
    
    // Validate with Zod schema
    try {
      const validatedData = signUpSchema.parse(requestData);
      const { username, email, password } = validatedData;
      console.log("Validation passed for:", { username, email });
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        console.error("Validation failed:", validationError.errors);
        return Response.json(
          {
            success: false,
            message: "Invalid data provided",
            errors: validationError.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        );
      }
      throw validationError;
    }
    
    const { username, email, password } = requestData;
    
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) { 
      console.log("User already exists with username:", username);
      return Response.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated verify code:", verifyCode);

    if (existingUserByEmail) {
      console.log("Found existing user by email:", email);
      if(existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 }
        );
      }else{
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpire = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
        console.log("Updated existing unverified user");

      }
    } else {
      console.log("Creating new user");
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpire: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      
      console.log("Attempting to save new user...");
      const savedUser = await newUser.save();
      console.log("New user created successfully with ID:", savedUser._id);
    }

    //send verification email
    console.log("Attempting to send verification email to:", email);
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    const successResponse = {
      success: true,
      message: "User registered successfully. Please check your email for verification code",
    };
    console.log("Returning success response:", successResponse);
    
    return Response.json(
        successResponse,
        { status: 201 }
      );

  } catch (error) {
    console.error("Error registering user:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
