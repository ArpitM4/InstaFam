import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/db/ConnectDb";
import User from "@/models/User";

/**
 * Extensible requirements checker for going public.
 * Returns an array of unmet requirements.
 * Each requirement has: { id, message }
 * 
 * To add new requirements in the future, simply add more checks to this function.
 */
function checkPublicRequirements(user) {
    const unmetRequirements = [];

    // Requirement 1: At least one social link
    if (!user.socials || user.socials.length === 0) {
        unmetRequirements.push({
            id: "social_link",
            message: "Add at least one social media link to go public"
        });
    }

    // Future requirements can be added here:
    // Example: Require profile picture
    // if (!user.profilepic) {
    //     unmetRequirements.push({
    //         id: "profile_pic",
    //         message: "Add a profile picture to go public"
    //     });
    // }

    return unmetRequirements;
}

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

        // Determine target visibility
        const targetVisibility = user.visibility === "public" ? "hidden" : "public";

        // If trying to go public, check requirements
        if (targetVisibility === "public") {
            const unmetRequirements = checkPublicRequirements(user);

            if (unmetRequirements.length > 0) {
                return Response.json({
                    error: unmetRequirements[0].message,
                    unmetRequirements: unmetRequirements,
                    canGoPublic: false
                }, { status: 400 });
            }
        }

        // Toggle visibility
        user.visibility = targetVisibility;
        await user.save();

        return Response.json({ success: true, visibility: user.visibility });
    } catch (error) {
        console.error("Toggle visibility error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET - Check if user can go public (validate requirements)
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

        const unmetRequirements = checkPublicRequirements(user);

        return Response.json({
            success: true,
            canGoPublic: unmetRequirements.length === 0,
            unmetRequirements: unmetRequirements,
            currentVisibility: user.visibility
        });
    } catch (error) {
        console.error("Check visibility requirements error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
