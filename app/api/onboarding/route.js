import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/db/ConnectDb";
import User from "@/models/User";

// GET - Check onboarding status
export async function GET(req) {
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

        return Response.json({
            success: true,
            onboardingCompleted: user.onboardingCompleted || false,
            // Include current setup status for the onboarding steps
            hasProfilePic: !!user.profilepic,
            hasCoverPic: !!user.coverpic,
            hasSocialLinks: user.socials && user.socials.length > 0,
            visibility: user.visibility
        });
    } catch (error) {
        console.error("Get onboarding status error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST - Mark onboarding as completed
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

        // Mark onboarding as completed
        user.onboardingCompleted = true;
        await user.save();

        return Response.json({ success: true, onboardingCompleted: true });
    } catch (error) {
        console.error("Mark onboarding complete error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
