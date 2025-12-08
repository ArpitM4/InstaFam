import connectDb from "@/db/ConnectDb";
import User from "@/models/User";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
    await connectDb();

    try {
        // Find 3 random public creators
        const creators = await User.aggregate([
            {
                $match: {
                    accountType: { $in: ["Creator", "VCreator"] },
                    visibility: "public"
                }
            },
            { $sample: { size: 3 } },
            {
                $project: {
                    username: 1,
                    _id: 1,
                    profilepic: 1,
                    name: 1,
                    description: 1,
                    followers: 1,
                    followersArray: 1
                }
            }
        ]);

        // Add cache headers - cache for 5 minutes
        return new Response(JSON.stringify({ success: true, creators }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Error fetching random creators:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
