"use server";

import connectDb from "@/db/ConnectDb";
import User from "@/models/User";

export const getExploreCreators = async (currentUserEmail = null) => {
    try {
        await connectDb();

        const matchStage = {
            visibility: "public"
        };

        if (currentUserEmail) {
            matchStage.email = { $ne: currentUserEmail };
        }

        // Find 20 random public users, excluding current user
        const creators = await User.aggregate([
            { $match: matchStage },
            { $sample: { size: 20 } },
            { $project: { username: 1, _id: 1, profilepic: 1, name: 1, accountType: 1, bio: 1, isVerified: 1 } }
        ]);

        // Serialize ObjectIds
        return creators.map(creator => ({
            ...creator,
            _id: creator._id.toString()
        }));
    } catch (error) {
        console.error("Error fetching explore creators:", error);
        return [];
    }
};

export const searchCreators = async (query) => {
    try {
        if (!query) return [];

        await connectDb();

        // Fetch only public users using index on username
        const users = await User.find({
            username: { $regex: query, $options: "i" },
            visibility: "public",
        }).select("username name profilepic _id isVerified").lean();

        return users.map(user => ({
            ...user,
            _id: user._id.toString()
        }));
    } catch (error) {
        console.error("Error searching creators:", error);
        return [];
    }
};
