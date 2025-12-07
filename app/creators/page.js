"use client";
import "../globals.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SEO from "@/components/SEO";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import Footer from "@/components/Footer";
import {
  FaRocket, FaBolt, FaCrown, FaGem, FaTrophy, FaArrowRight,
  FaYoutube, FaInstagram, FaTwitch, FaPalette, FaBrain,
  FaLink, FaGift, FaChartLine, FaUsers, FaCoins,
  FaTimes, FaCheck, FaShoppingBag, FaCreditCard, FaComments,
  FaStore
} from "react-icons/fa";

export default function CreatorsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { userData } = useUser();

  // State for username check
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null); // null, true, false

  // Check Username Logic
  const checkUsername = async () => {
    if (!username || username.length < 3) return;
    setIsChecking(true);
    setIsAvailable(null);
    try {
      const res = await fetch(`/api/check-username?username=${username}`);
      const data = await res.json();
      setIsAvailable(data.available);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCreatePage = () => {
    if (!session) {
      router.push('/');
    } else if (userData?.accountType === 'Creator' || userData?.accountType === 'VCreator') {
      router.push(`/${session.user.name}`);
    } else {
      router.push('/setup');
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (isAvailable === true) {
        handleCreatePage();
      } else {
        checkUsername();
      }
    }
  };

  return (
    <>
      <SEO
        title="Sygil for Creators - The Superfan Engine"
        description="Turn your followers into superfans. Monetize your attention with gamified rewards, exclusive perks, and 95% payouts."
        url="https://www.sygil.app/creators"
        image="https://www.sygil.app/og-creators.jpg"
      />

      {/* Logo */}
      <Link href="/" className="absolute top-6 left-6 z-50 transition-transform hover:scale-105">
        <Image src="/Text.png" alt="Sygil" width={100} height={32} className="h-8 w-auto" priority />
      </Link>

      <div className="relative min-h-screen text-white overflow-x-hidden bg-[#0a0a0a]">

        {/* ==================== SECTION 1: HERO ==================== */}
        {/* Scrollable, distinct background instead of fixed cosmic */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative pt-20 border-b border-white/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0a0a0a] to-[#0a0a0a]">

          <div className="max-w-7xl mx-auto z-10 w-full grid lg:grid-cols-2 gap-8 items-center">

            {/* Text Content */}
            <div className="text-left animate-float-slow order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-[var(--primary)]/30 mb-8 animate-pulse-slow">
                <FaCrown className="text-[var(--star-gold)]" />
                <span className="text-sm font-bold tracking-wider uppercase text-[var(--star-gold)]">Trusted by Top Creators</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
                Earn From Anything You Do <span className="gradient-text block mt-1 pb-2">- Literally Anything.</span>
              </h1>

              <p className="text-lg text-[var(--text-muted)] mb-6 max-w-xl leading-relaxed">
                Monetize Your Attention — Your Way.<br />
                <span className="text-white font-medium">Sygil is the creator platform built for the new era</span> — where fans earn rewards, unlock perks, and support you directly.
              </p>

              {/* Smart Username Check */}
              {/* Smart Username Check */}
              <div className="max-w-md">
                {session ? (
                  <Link href={userData?.accountType === 'Creator' || userData?.accountType === 'VCreator' ? `/${session.user.name}` : '/setup'}>
                    <button className="px-8 py-4 bg-[var(--success)] hover:brightness-110 text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-green-900/20 text-lg">
                      Setup Your Page <FaArrowRight size={14} />
                    </button>
                  </Link>
                ) : (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                    <div className="relative flex items-center bg-[#0a0a0a] rounded-full p-1 border border-white/10 shadow-2xl">
                      <span className="pl-6 text-[var(--text-muted)] font-medium select-none text-lg">sygil.app/</span>
                      <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-white font-bold text-lg placeholder-gray-600 p-2 w-full min-w-0"
                        placeholder="username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                          setIsAvailable(null);
                        }}
                        onKeyDown={handleInputKeyDown}
                      />
                      {isAvailable === true ? (
                        <button onClick={handleCreatePage} className="px-6 py-3 bg-[var(--success)] hover:brightness-110 text-white font-bold rounded-full transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-green-900/20">
                          Create Page <FaArrowRight size={12} />
                        </button>
                      ) : (
                        <button onClick={checkUsername} disabled={isChecking || !username} className="px-6 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 font-bold rounded-full transition-all min-w-[100px] flex justify-center whitespace-nowrap">
                          {isChecking ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Check"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="h-6 mt-3 text-sm pl-4 font-medium">
                  {!session && isAvailable === true && <span className="text-green-500 flex items-center gap-1"><FaCheck /> Username available!</span>}
                  {!session && isAvailable === false && <span className="text-red-500 flex items-center gap-1"><FaTimes /> Username taken.</span>}
                </div>
              </div>

            </div>

            {/* Hero Image - 3D Character */}
            {/* Right Visual - Magic Man */}
            <div className="flex-1 lg:order-2 relative flex justify-center">
              <div className="relative w-[400px] h-[500px] md:w-[500px] md:h-[600px] animate-float">
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent z-10"></div>
                {/* Magic Man Visual */}
                <Image
                  src="/characters/magicman.png"
                  alt="The Sygil Magician"
                  fill
                  unoptimized
                  className="object-contain drop-shadow-[0_0_50px_rgba(139,92,246,0.3)]"
                />

                {/* Floating Stats Cards for visual flair */}
                <div className="absolute top-20 -left-10 p-3 glass-card rounded-lg border border-white/10 animate-bounce delay-700 hidden md:block">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">New Superfan</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                    <span className="font-bold text-sm">+500 FP</span>
                  </div>
                </div>

                <div className="absolute bottom-40 -right-5 p-3 glass-card rounded-lg border border-white/10 animate-bounce hidden md:block">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Monthly Revenue</div>
                  <div className="text-xl font-black text-green-400 mt-1">+$4,250</div>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ==================== SECTION 2: THE EVOLUTION ==================== */}

        {/* PART A: THE STRUGGLE (Spacious 2-Column Grid) */}
        <section className="py-16 px-4 relative bg-[#050505] border-b border-white/5">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>

          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-float-slow">
              <h2 className="text-3xl md:text-5xl font-black mb-4">
                You're Leaving a LOT of Money on the Table. Here's Why.
              </h2>
              <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                You are building an empire on rented land, using tools that don't talk to each other.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Problem 1 */}
              <div className="glass-card p-8 rounded-2xl bg-[#151515] hover:bg-white/5 transition-all duration-300 group border border-white/5 h-full flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform">
                  <FaLink className="text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Fragmented Tools</h3>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                  Link-in-bio for links. Patreon for subs. Ko-fi for tips. Discord for chat.
                  <br /><span className="text-white font-medium mt-2 block">Your fans are scattered everywhere.</span>
                </p>
              </div>

              {/* Problem 2 */}
              <div className="glass-card p-8 rounded-2xl bg-[#151515] hover:bg-white/5 transition-all duration-300 group border border-white/5 h-full flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform">
                  <FaCoins className="text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4">QR / Superchat Tips</h3>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                  Superchat is too Expensive.
                  <br />
                  A QR code donation is a "Thank you & Goodbye".
                  <br /><span className="text-white font-medium mt-2 block">It builds zero loyalty and no recurring habit.</span>
                </p>
              </div>

              {/* Problem 3 */}
              <div className="glass-card p-8 rounded-2xl bg-[#151515] hover:bg-white/5 transition-all duration-300 group border border-white/5 h-full flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-6 text-pink-500 group-hover:scale-110 transition-transform">
                  <FaRocket className="text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Subscription Fatigue</h3>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                  Not every fan can pay $5/month.
                  <br /><span className="text-white font-medium mt-2 block">You're leaving 99% of your potential support on the table.</span>
                </p>
              </div>

              {/* Problem 4 */}
              <div className="glass-card p-8 rounded-2xl bg-[#151515] hover:bg-white/5 transition-all duration-300 group border border-white/5 h-full flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
                  <FaComments className="text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Your Fans Aren't Paying Less</h3>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                  You’re Offering Them Less.
                  <br />
                  They want interactions, recognition, responses.
                  <br /><span className="text-white font-medium mt-2 block">These moments are worth paying for, but creators rarely monetize them.</span>
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* ==================== SECTION 3: THE SOLUTION ==================== */}
        <section className="py-16 px-4 relative overflow-hidden border-b border-white/5 bg-[#0a0a0a]">
          {/* Decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--primary)]/10 blur-[100px] rounded-full -z-10" />

          <div className="max-w-6xl mx-auto">

            {/* 1. Header & Phone Row */}
            <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
              {/* Left: Text */}
              <div className="text-left">
                <span className="inline-block py-1 px-3 rounded-full bg-[var(--secondary)]/10 text-[var(--secondary)] text-xs font-bold uppercase tracking-widest mb-4">
                  The Solution
                </span>
                <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                  Turn Your Followers Into<span className="text-[var(--primary)]"> Super Fans</span>.
                </h2>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                  Sygil gives you powerful tools to turn casual followers into loyal supporters.
                  <br></br>

                  1. Fans Contribute
                  <br></br>

                  2. Fans earn FamPoints, climb leaderboards, redeem perks, and get rewarded for their engagement.
                </p>
              </div>

              {/* Right: Phone Mockup */}
              <div className="relative h-[500px] w-full flex items-center justify-center animate-float-slow">
                <div className="absolute inset-0 rounded-full blur-3xl opacity-50" style={{ background: 'linear-gradient(to top right, rgba(0, 229, 212, 0.2), rgba(139, 92, 246, 0.2))' }} />

                {/* Phone Frame */}
                <div className="relative z-10 w-72 h-[500px] rounded-[3rem] shadow-2xl overflow-hidden border-8 bg-[#0a0a0a] border-[#222]" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                  {/* Mockup Screen Content */}
                  <div className="h-full w-full p-4 flex flex-col bg-[#050505]">
                    {/* Profile Header */}
                    <div className="w-full h-32 rounded-xl mb-4 p-4 flex items-end relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/50 to-blue-500/10"></div>
                      <div className="w-12 h-12 rounded-full border-2 border-[#050505] bg-[#333] relative z-10" />
                    </div>
                    {/* Skeleton UI Lines */}
                    <div className="space-y-3">
                      <div className="h-2 w-24 rounded bg-white/20 mb-4" />

                      <div className="h-14 w-full rounded-xl bg-white/5 border border-white/5 p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[var(--primary)]/20"></div>
                        <div className="h-2 w-20 rounded bg-white/10"></div>
                      </div>
                      <div className="h-14 w-full rounded-xl bg-white/5 border border-white/5 p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-green-500/20"></div>
                        <div className="h-2 w-24 rounded bg-white/10"></div>
                      </div>

                      {/* Featured Perk */}
                      <div className="h-32 w-full rounded-xl p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-white/10 mt-2">
                        <div className="h-2 w-20 rounded bg-[var(--primary)] mb-2" />
                        <div className="h-2 w-32 rounded bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute top-24 -right-4 p-4 rounded-xl border border-white/10 bg-[#111]/90 backdrop-blur-md shadow-xl animate-bounce" style={{ animationDelay: '1s' }}>
                  <FaCreditCard className="w-6 h-6 mb-2 text-green-400" />
                  <div className="text-xs font-bold text-white">Instance Payouts</div>
                </div>
                <div className="absolute bottom-32 -left-4 p-4 rounded-xl border border-white/10 bg-[#111]/90 backdrop-blur-md shadow-xl animate-bounce">
                  <FaComments className="w-6 h-6 mb-2 text-blue-400" />
                  <div className="text-xs font-bold text-white">Fans Chat</div>
                </div>
              </div>
            </div>

            {/* 2. Core Features (Existing Cards) */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: FaGem, color: "text-blue-400", title: "Gamified Contributions", desc: "Every dollar and interaction gives fans points. Support becomes a game." },
                { icon: FaGift, color: "text-pink-400", title: "Redeemable Perks", desc: "Offer shoutouts, exclusive DMs, or files. Fans redeem points for real value." },
                { icon: FaLink, color: "text-green-400", title: "Beautiful Identity", desc: "All your links, perks, and rewards in one stunning, customizable page." },
              ].map((item, i) => (
                <div key={i} className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 transform hover:-translate-y-2 group bg-[#151515] flex flex-col h-full">
                  <div className={`text-4xl mb-6 ${item.color} group-hover:scale-110 transition-transform duration-300 inline-block`}>
                    <item.icon />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-lg text-[var(--text-muted)] leading-relaxed flex-grow">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* 3. Coming Soon Section */}
            <div>
              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold">Coming Soon to Sygil</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Start with donations. Grow with the ecosystem</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Giveaways */}
                <div className="glass-card p-8 rounded-2xl border border-white/5 bg-[#111]/50 opacity-80 hover:opacity-100 transition-opacity flex flex-col h-full">
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-6 text-orange-500">
                    <FaGift className="text-3xl" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4">Viral Giveaways</h4>
                  <p className="text-lg text-[var(--text-muted)] flex-grow">Run automated giveaways to grow your reach. Fans enter by following or tipping.</p>
                </div>

                {/* Subscriptions */}
                <div className="glass-card p-8 rounded-2xl border border-white/5 bg-[#111]/50 opacity-80 hover:opacity-100 transition-opacity flex flex-col h-full">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6 text-yellow-500">
                    <FaCrown className="text-3xl" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4">Subscriptions</h4>
                  <p className="text-lg text-[var(--text-muted)] flex-grow">Build recurring revenue. Offer exclusive badges and content to monthly supporters.</p>
                </div>

                {/* Merchandise */}
                <div className="glass-card p-8 rounded-2xl border border-white/5 bg-[#111]/50 opacity-80 hover:opacity-100 transition-opacity flex flex-col h-full">
                  <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-6 text-pink-500">
                    <FaShoppingBag className="text-3xl" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4">Merchandise Store</h4>
                  <p className="text-lg text-[var(--text-muted)] flex-grow">Sell your custom merch directly from your page. No inventory headaches.</p>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ==================== SECTION 4: USE CASES ==================== */}
        <section className="py-16 px-4 bg-[#0e0e11] border-b border-white/5">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black mb-3">How Different Creators Use Sygil </h2>
              <p className="text-lg text-[var(--text-muted)]">Offer perks in exchange for FamPoints </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* YouTubers */}
              <div className="glass-card p-8 rounded-2xl relative overflow-hidden group bg-[#151515] flex flex-col h-full">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FaYoutube className="text-8xl text-red-600" />
                </div>
                <div className="relative z-10 flex flex-col h-full">

                  <h3 className="text-2xl font-bold mb-4">YouTubers</h3>
                  <ul className="space-y-3 text-[var(--text-muted)] text-base flex-grow">
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" /> Offer shoutouts</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" /> Real Life Meetup</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" /> Thanks at the end of video</li>
                  </ul>
                </div>
              </div>

              {/* Instagram */}
              <div className="glass-card p-8 rounded-2xl relative overflow-hidden group bg-[#151515] flex flex-col h-full">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FaInstagram className="text-8xl text-pink-600" />
                </div>
                <div className="relative z-10 flex flex-col h-full">

                  <h3 className="text-2xl font-bold mb-4">Instagram</h3>
                  <ul className="space-y-3 text-[var(--text-muted)] text-base flex-grow">
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" /> Story reposts</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" /> Exclusive photos</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" /> Close Friends</li>
                  </ul>
                </div>
              </div>

              {/* Streamers */}
              <div className="glass-card p-8 rounded-2xl relative overflow-hidden group bg-[#151515] flex flex-col h-full">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FaTwitch className="text-8xl text-purple-600" />
                </div>
                <div className="relative z-10 flex flex-col h-full">

                  <h3 className="text-2xl font-bold mb-4">Streamers</h3>
                  <ul className="space-y-3 text-[var(--text-muted)] text-base flex-grow">
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" /> 1 v 1</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" />Gameplay Settings</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" /> Add to clan</li>
                  </ul>
                </div>
              </div>

              {/* Artists & Coaches */}
              <div className="glass-card p-8 rounded-2xl relative overflow-hidden group bg-[#151515] flex flex-col h-full">
                {/* Decorative BookMan */}
                <div className="absolute -bottom-10 -right-5 w-24 h-24 opacity-20 group-hover:opacity-100 transition-opacity">
                  <Image
                    src="/characters/bookman.png"
                    alt="BookMan"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex gap-3 mb-4">
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Artists & Experts</h3>
                  <ul className="space-y-3 text-[var(--text-muted)] text-base flex-grow">
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" /> Sell assets/notes</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" />Brush Settings / Color Palettes</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" /> Exclusive Wallpaper Pack</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ==================== FINAL CTA SECTION ==================== */}
        <section className="py-16 text-center relative overflow-hidden bg-[#0a0a0a]">
          <div className="relative z-10">
            <div className="inline-block relative mb-3">
              <Image
                src="/characters/smallcat.png"
                alt="Cat"
                width={60}
                height={60}
                className="object-contain"
                unoptimized
              />
            </div>

            <h2 className="text-3xl md:text-5xl font-black mb-6 text-text">Ready to Upgrade Your Bio?</h2>
            <p className="mb-8 text-lg" style={{ color: 'var(--text-muted)' }}>Join the waitlist today and get early access to the Super Chat Killer.</p>

            {/* Smart Username Check Repeat */}
            <div className="flex justify-center px-4">
              <div className="max-w-md w-full">
                {session ? (
                  <Link href={userData?.accountType === 'Creator' || userData?.accountType === 'VCreator' ? `/${session.user.name}` : '/setup'}>
                    <button className="px-8 py-4 bg-[var(--success)] hover: text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-green-900/20 text-lg mx-auto">
                      Setup Your Page <FaArrowRight size={14} />
                    </button>
                  </Link>
                ) : (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                    <div className="relative flex items-center bg-[#0a0a0a] rounded-full p-1 border border-white/10 shadow-2xl">
                      <span className="pl-6 text-[var(--text-muted)] font-medium select-none text-lg">sygil.app/</span>
                      <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-white font-bold text-lg placeholder-gray-600 p-2 w-full min-w-0"
                        placeholder="username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                          setIsAvailable(null);
                        }}
                        onKeyDown={handleInputKeyDown}
                      />
                      {isAvailable === true ? (
                        <button onClick={handleCreatePage} className="px-6 py-3 bg-[var(--success)] hover: text-white font-bold rounded-full transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-green-900/20">
                          Reserve <FaArrowRight size={12} />
                        </button>
                      ) : (
                        <button onClick={checkUsername} disabled={isChecking || !username} className="px-6 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 font-bold rounded-full transition-all min-w-[100px] flex justify-center whitespace-nowrap">
                          {isChecking ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Check"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>Free forever. No credit card required.</p>
          </div>
        </section>
        <Footer forceShow={true} />
      </div>
    </>
  );
}
