import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/db/ConnectDb";
import User from "@/models/User";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, username, accountType, profilepic } = await req.json();

        if (!name || !username || !accountType) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        // Check if username is taken
        const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } });
        if (existingUser && existingUser.email !== session.user.email) {
            return Response.json({ error: "Username is already taken" }, { status: 400 });
        }

        // Update user
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                name,
                username,
                accountType,
                profilepic: profilepic || "https://api.dicebear.com/9.x/avataaars/svg?seed=" + username, // Fallback
                setupCompleted: true,
                visibility: "hidden" // Default to hidden
            },
            { new: true }
        );

        return Response.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Setup error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
