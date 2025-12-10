import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import connectDB from "@/db/ConnectDb";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Toggle visibility
        const newVisibility = user.visibility === "hidden" ? "public" : "hidden";

        // Validation for Public Visibility
        if (newVisibility === "public") {
            const hasCoverPic = !!user.coverpic;
            const hasSocials = user.socials && user.socials.length > 0;

            if (!hasCoverPic || !hasSocials) {
                return NextResponse.json({
                    error: "Setup incomplete. Please add a banner and at least one social link."
                }, { status: 400 });
            }
        }

        // If setting to public, also update account type to Creator if not already
        const updateData = { visibility: newVisibility };

        if (newVisibility === "public" && user.accountType === "User") {
            updateData.accountType = "Creator";
        }

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            updateData,
            { new: true }
        );

        return NextResponse.json({
            success: true,
            visibility: updatedUser.visibility,
            accountType: updatedUser.accountType
        });

    } catch (error) {
        console.error("Toggle visibility error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
