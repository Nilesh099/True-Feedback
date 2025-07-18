import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpire) > new Date();

    if (!isCodeValid) {
      return Response.json(
        { success: false, message: "Incorrect verification code" },
        { status: 400 }
      );
    }

    if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification code is expired. Please sign up again to receive a new one.",
        },
        { status: 400 }
      );
    }

    // ✅ Code is valid and not expired
    user.isVerified = true;
    await user.save();

    return Response.json(
      { success: true, message: "Account verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying user:", error);

    return Response.json(
      { success: false, message: "Internal server error during verification." },
      { status: 500 }
    );
  }
}
