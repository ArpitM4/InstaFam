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

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        // Toggle visibility
        user.visibility = user.visibility === "public" ? "hidden" : "public";
        await user.save();

        return Response.json({ success: true, visibility: user.visibility });
    } catch (error) {
        console.error("Toggle visibility error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
