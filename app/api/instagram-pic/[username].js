// pages/api/instagram-pic/[username].js

export async function GET(req, { params }) {
  const username = params.username;
  const res = await fetch(
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    {
      headers: {
        // Instagram blocks unknown agents—pretend to be a real browser
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
      },
    }
  );

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const json = await res.json();
  const picUrl = json?.data?.user?.profile_pic_url_hd || null;

  return new Response(JSON.stringify({ profilePic: picUrl }), {
    headers: { "Content-Type": "application/json" },
  });
}
