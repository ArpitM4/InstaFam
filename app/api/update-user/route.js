import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/ConnectDb";
import User from "@/models/User";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const { coverpic, bannerAttribution } = body;

        // Build update object with only provided fields
        const updateData = {};
        if (coverpic !== undefined) updateData.coverpic = coverpic;
        if (bannerAttribution !== undefined) updateData.bannerAttribution = bannerAttribution;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        updateData.updatedAt = new Date();

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            updateData,
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            coverpic: user.coverpic,
            bannerAttribution: user.bannerAttribution
        });

    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
