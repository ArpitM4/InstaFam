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
import CreatorNavbar from "@/components/CreatorNavbar";
import {
  FaRocket, FaBolt, FaCrown, FaGem, FaTrophy, FaArrowRight,
  FaYoutube, FaInstagram, FaTwitch, FaPalette, FaBrain,
  FaLink, FaGift, FaChartLine, FaUsers, FaCoins,
  FaTimes, FaCheck, FaShoppingBag, FaCreditCard, FaComments,
  FaStore, FaPaintBrush
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
      <CreatorNavbar />


      <div className="relative min-h-screen text-white overflow-x-hidden bg-[#0a0a0a]">

        {/* ==================== SECTION 1: HERO ==================== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative pt-20 border-b border-white/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#0a0a0a] to-[#0a0a0a]">
          <div className="max-w-7xl mx-auto z-10 w-full grid lg:grid-cols-2 gap-8 items-center">

            {/* Text Content */}
            <div className="text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-[var(--primary)]/30 mb-6 animate-pulse-slow">
                <FaCrown className="text-[var(--star-gold)]" />
                <span className="text-sm font-semibold tracking-wider uppercase text-[var(--star-gold)]">Trusted by Top Creators</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight">
                Earn From Anything You Do
                <span className="gradient-text block mt-1 pb-2 text-4xl md:text-5xl lg:text-6xl font-black">-Literally Anything.</span>
              </h1>
              <p className="text-base md:text-lg text-[var(--text-muted)] mb-6 max-w-xl leading-relaxed">
                Monetize your attention — your way. <span className="text-white font-medium">Sygil is the creator platform built for the new era</span> — where fans earn rewards, unlock perks, and support you directly.
              </p>

              {/* Username / CTA area */}
              <div className="max-w-md">
                {session ? (
                  <Link href={userData?.accountType === 'Creator' || userData?.accountType === 'VCreator' ? `/${session.user.name}` : '/setup'}>
                    <button className="w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-[1.02] text-sm border border-white/10">
                      Setup Your Page <FaArrowRight size={12} />
                    </button>
                  </Link>
                ) : (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-200"></div>
                    <div className="relative flex items-center bg-[#0a0a0a] rounded-full p-1 border border-white/10 shadow-2xl">
                      <span className="pl-4 pr-3 text-[var(--text-muted)] font-medium select-none text-base">sygil.app/</span>
                      <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-white font-semibold text-base placeholder-gray-600 p-2 w-full min-w-0"
                        placeholder="username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                          setIsAvailable(null);
                        }}
                        onKeyDown={handleInputKeyDown}
                      />
                      {isAvailable === true ? (
                        <button onClick={handleCreatePage} className="px-5 py-3 bg-[var(--success)] hover:brightness-110 text-white font-semibold rounded-full transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-green-900/20 text-sm">
                          Create Page <FaArrowRight size={12} />
                        </button>
                      ) : (
                        <button onClick={checkUsername} disabled={isChecking || !username} className="px-5 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 font-semibold rounded-full transition-all min-w-[100px] flex justify-center whitespace-nowrap text-sm">
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
            <div className="flex-1 lg:order-2 relative flex justify-center">
              <div className="relative w-[400px] h-[500px] md:w-[500px] md:h-[600px] animate-float">
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent z-10">
                </div> {/* Magic Man Visual */}
                <Image src="/magicman.png" alt="The Sygil Magician" fill unoptimized className="object-contain drop-shadow-[0_0_50px_rgba(139,92,246,0.3)]" />
                {/* Floating Stats Cards for visual flair */}
                <div className="absolute top-20 -left-10 p-3 glass-card rounded-lg border border-white/10 animate-bounce delay-700 hidden md:block">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">New Superfan</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                    <span className="font-bold text-sm">+500 FP</span> </div>
                </div>

                <div className="absolute top-20 -right-4 p-3 glass-card rounded-lg border border-white/10 hidden md:flex flex-col items-start bg-[#111]/80 backdrop-blur-md animate-bounce">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Monthly Revenue</div>
                  <div className="text-lg font-black text-green-400 mt-1">+$4,250</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ==================== SECTION 2: THE EVOLUTION ==================== */}
        <section className="py-24 px-4 relative bg-[#050505] border-b border-white/5">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>

          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-black uppercase mb-6 tracking-tight leading-none">
                You're Leaving a LOT of Money on the Table. <br className="hidden md:block" /> Here's Why.
              </h2>

              <div className="flex justify-center">
                <button className="px-6 py-2 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform">
                  You are building an empire on rented land, using tools that don't talk to each other.                  </button>
              </div>
            </div>

            {/* Scrollable Container on Mobile, Grid on Desktop */}
            <div className="flex overflow-x-auto pb-6 gap-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide">
              {[
                {
                  title: "YOU'RE OFFERING THEM LESS",
                  desc: "Fans want attention and recognition. Shoutouts, replies and reposts are worth paying for - most creators never monetize them.",
                  bgClass: "bg-gradient-to-b from-black to-indigo-800",
                  image: "/Img1.png"
                },
                {
                  title: "QR / SUPERCHAT TIPS",
                  desc: "A QR code donation is a thank-you moment — it rarely builds loyalty or habit. Convert one-time tips into repeat support.",
                  bgClass: "bg-gradient-to-b from-black to-amber-800",
                  image: "/Img2.png"
                },
                {
                  title: "SUBSCRIPTION FATIGUE",
                  desc: "Subscriptions aren't the problem — having them scattered across multiple platforms is..",
                  bgClass: "bg-gradient-to-b from-black to-rose-800",
                  image: "/Img3.png"
                },
                {
                  title: "FRAGMENTED TOOLS",
                  desc: "Link-in-bio for links. Patreon for subs. Ko-fi for tips. Discord for chat. Your fans are scattered everywhere.",
                  bgClass: "bg-gradient-to-b from-black to-red-800",
                  image: "/Img4.png"
                },
              ].map((card, i) => (
                <div key={i} className={`relative min-w-[85vw] md:min-w-0 md:w-auto snap-center rounded-[2rem] p-6 h-[520px] flex flex-col group overflow-hidden border border-black/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:brightness-110 ${card.bgClass}`}>

                  {/* Title */}
                  <h3 className="text-2xl font-black uppercase leading-[0.9] tracking- mb-6 relative z-10 w-3/4 text-white">
                    {card.title}
                  </h3>

                  {/* Image */}
                  <div className="flex-1 relative w-full rounded-xl overflow-hidden  order border-white/5 backdrop-blur-sm mb-6 transition-all group-hover:border-white/20">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>

                  {/* Description */}
                  <div className="relative z-10">
                    <p className="text-sm text-gray-300 font-medium leading-relaxed mb-4 line-clamp-4 group-hover:text-white transition-colors">
                      {card.desc}
                    </p>

                    {/* <div className="flex items-center text-sm font-bold text-white opacity-60 group-hover:opacity-100 transition-opacity gap-2">
                      Learn More <FaArrowRight size={10} />
                    </div> */}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SECTION 3: THE SOLUTION ==================== */}
        <section className="py-16 px-4 relative overflow-hidden border-b border-white/5 bg-[#0a0a0a]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-[var(--primary)]/8 blur-[100px] rounded-full -z-10" />

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
              <div className="text-left">
                <span className="inline-block py-1 px-3 rounded-full bg-[var(--secondary)]/10 text-[var(--secondary)] text-xs font-bold uppercase tracking-widest mb-4">
                  The Solution
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight">Turn Your Followers Into <span className="">Super Fans</span>.</h2>
                <div className="space-y-6 mt-8">
                  {[
                    { title: "Set Up Your Sygil Page", desc: "Create your page in minutes — your new home for earnings, perks, and fan engagement." },
                    { title: "Choose How You Want to Earn", desc: "Enable contributions, add Vault items (perks fans can unlock with points) or any other tools from merchandise to subscriptions." },
                    { title: "Share Your Link Everywhere", desc: "Place your Sygil link in your bio, on streams, in reels, or anywhere your audience sees you." },
                    { title: "Fans Engage & Earn Points", desc: "Every tip, view, share, or interaction gives fans FamPoints — keeping them coming back." },
                    { title: "You Get Instant Payouts", desc: "No more juggling 5 tools. Sygil handles everything in one place, and your money arrives instantly." }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-white/20 transition-colors ${i === 0
                        ? "bg-rose-500 text-black"
                        : "bg-white/10 group-hover:bg-rose-500 group-hover:text-black"
                        }`}>
                        {i + 1}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg leading-none mb-1 transition-colors ${i === 0
                          ? "text-rose-500"
                          : "text-white group-hover:text-rose-500"
                          }`}>
                          {step.title}
                        </h3>
                        <p className="text-[var(--text-muted)] text-base leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Phone Image */}
              <div className="relative h-[550px] w-full flex items-center justify-center">
                <div className="relative z-10 w-64 md:w-80 h-[550px]">
                  <Image
                    src="/Phone.png"
                    alt="Sygil App Preview"
                    fill
                    className="object-contain drop-shadow-2xl"
                    unoptimized
                  />
                </div>

                {/* Floating Cards */}
                <div className="absolute top-20 -right-4 p-3 rounded-xl border border-white/10 bg-[#111]/90 backdrop-blur-md shadow-xl hidden md:flex flex-col items-start" style={{ animationDelay: '0.8s' }}>
                  <FaCreditCard className="w-5 h-5 mb-2 text-green-400" />
                  <div className="text-xs font-bold text-white">Instant Payouts</div>
                </div>
                <div className="absolute bottom-28 -left-4 p-3 rounded-xl border border-white/10 bg-[#111]/90 backdrop-blur-md shadow-xl hidden md:flex flex-col items-start">
                  <FaComments className="w-5 h-5 mb-2 text-blue-400" />
                  <div className="text-xs font-bold text-white">Fan Chat</div>
                </div>
                <div className="absolute top-1/2 -right-16 p-3 rounded-xl border border-white/10 bg-[#111]/90 backdrop-blur-md shadow-xl hidden md:flex items-center gap-2">
                  <FaLink className="w-4 h-4 text-purple-400" />
                  <div className="text-xs font-bold text-white">sygil.app/emma_explore</div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Section 4 */}
        <section className="py-24 px-4 relative border-b border-white/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-[#0a0a0a] to-[#0a0a0a]">
          {/* Ecosystem Bento Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-black mb-4">Everything You Need. <span>One Ecosystem.</span></h3>
              <p className="text-[var(--text-muted)] text-base md:text-lg max-w-2xl mx-auto">From identity to monetization, The complete creator stack.</p>
            </div>

            <div className="flex overflow-x-auto pb-6 gap-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-5 md:auto-rows-[minmax(180px,auto)] md:overflow-visible md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">

              {/* 1. Beautiful Identity (Hero Card) - Spans 2 cols, 2 rows */}
              <div className="min-w-[85vw] md:min-w-0 snap-center md:col-span-2 md:row-span-2 rounded-3xl p-8 relative overflow-hidden group border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 bg-gradient-to-b from-[#111] to-[#050505] hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                      <FaLink />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">The Only Link You’ll Ever Need</h3>
                    <h2 className="text-xl md:text-xl font-bold mb-3 gradient-text">sygil.app/yourname</h2>
                    <p className="text-[var(--text-muted)] text-base leading-relaxed max-w-lg">
                      Stop sending fans to a list of links. Sygil gives you a stunning, customizable home that aggregates your entire digital presence.
                    </p>
                  </div>
                  {/* Visual Decorator */}
                  <div className="mt-8 w-48 md:w-80 flex gap-3 opacity-60 bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm relative z-20">
                    <div className="w-full h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
                  </div>
                </div>

                {/* Cat Image */}
                <div className="absolute -bottom-6 -right-6 w-40 h-40 md:w-64 md:h-64 opacity-40 md:opacity-80 z-0 pointer-events-none group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                  <Image src="/smallcat.png" alt="Sygil Cat" fill className="object-contain" unoptimized />
                </div>
              </div>

              {/* 2. Gamified Contributions */}
              <div className="min-w-[85vw] md:min-w-0 snap-center rounded-3xl p-6 border border-white/10 hover:border-blue-500/30 group transition-all duration-300 bg-gradient-to-b from-[#111] to-[#050505] flex flex-col justify-between hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    <FaGem />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Gamified Support</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed">Support becomes a game. Leaderboards, XP, and badges for top fans.</p>
                </div>
              </div>

              {/* 3. Redeemable Perks */}
              <div className="min-w-[85vw] md:min-w-0 snap-center rounded-3xl p-6 border border-white/10 hover:border-pink-500/30 group transition-all duration-300 bg-gradient-to-b from-[#111] to-[#050505] flex flex-col justify-between hover:shadow-[0_0_30px_rgba(236,72,153,0.1)]">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 text-2xl text-pink-400 group-hover:scale-110 transition-transform duration-300">
                    <FaGift />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Redeemable Perks</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed">Fans redeem points for real value: show outs, files, or exclusive access.</p>
                </div>
              </div>

              {/* 4, 5, 6 - Coming Soon Row */}
              {[
                { icon: FaGift, color: 'text-orange-500', bg: 'bg-orange-500/10', title: 'Viral Giveaways', desc: 'Automated growth.' },
                { icon: FaCrown, color: 'text-yellow-500', bg: 'bg-yellow-500/10', title: 'Subscriptions', desc: 'Recurring revenue.' },
                { icon: FaShoppingBag, color: 'text-pink-500', bg: 'bg-pink-500/10', title: 'Merch Store', desc: 'Sell direct.' },
              ].map((item, i) => (
                <div key={i} className="min-w-[85vw] md:min-w-0 snap-center rounded-3xl p-6 border border-dashed border-white/10 hover:border-white/20 flex flex-col opacity-70 hover:opacity-100 transition-all hover:-translate-y-1 bg-[#080808]">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full ${item.bg} ${item.color} text-xl grayscale group-hover:grayscale-0 transition-all`}>
                      <item.icon />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] uppercase font-bold tracking-wider text-white/50 border border-white/5">
                      Coming Soon
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>
          {/*  Till here*/}

        </section >

        {/* ==================== SECTION 5: USE CASES ==================== */}
        < section className="py-16 px-4 bg-[#0e0e11] border-b border-white/5 relative" >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3">Monetize What You Already Do — Just Like These Creators</h2>
              <p className="text-base text-[var(--text-muted)]">Here are just a few ways creators use Sygil's Vault Feature to reward their fans.</p>
            </div>

            <div className="flex overflow-x-auto pb-6 gap-4 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { icon: FaYoutube, color: 'text-red-600', title: 'Content Creators', items: ['Offer shoutouts', 'Real-life meetup slots', 'Thanks at the end of video'] },
                { icon: FaInstagram, color: 'text-pink-600', title: 'Influencers', items: ['Story reposts', 'Exclusive photos', 'Close Friends access'] },
                { icon: FaTwitch, color: 'text-purple-600', title: 'Streamers', items: ['1v1 sessions', 'Gameplay settings', 'Add to clan'] },
                { icon: FaPaintBrush, color: 'text-blue-500', title: 'Artists & Experts', items: ['Sell assets/notes', 'Brush settings & palettes', 'Exclusive wallpaper packs'] },
              ].map((c, i) => (
                <div key={i} className="min-w-[85vw] sm:min-w-0 snap-center glass-card p-8 rounded-2xl relative overflow-hidden group bg-[#151515] border border-white/5 min-h-[220px] flex flex-col hover:border-white/10 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <c.icon className={`text-8xl ${c.color}`} />
                  </div>

                  <div className="relative z-10 flex-1">
                    <h3 className="text-2xl font-bold mb-4">{c.title}</h3>
                    <ul className="space-y-3 text-[var(--text-muted)] text-base">
                      {c.items.map((it, idx) => (
                        <li key={idx} className="flex items-center gap-2"><FaCheck className="text-[var(--success)] text-sm" /> {it}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

            </div>
            <div className="text-center mt-12">
              <p className="text-base text-white">…and countless more — limited only by your creativity.</p>
            </div>

          </div>
        </section >

        {/* Section 6 */}
        {/* ==================== SECTION 6: COST COMPARISON ==================== */}
        <section className="py-16 px-4 bg-[#0a0a0a] relative border-b border-white/5">
          <div className="max-w-5xl mx-auto relative z-10">

            {/* 1. Main Headline & Subheading */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight">
                The True Cost of <br className="hidden md:block" />
                <span className="text-red-500">a Creator Stack.</span>
              </h2>
              <p className="text-[var(--text-muted)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Every Tool You Add Takes More of Your Earnings.<br /> Sygil Gives You Simplicity — For Free.
              </p>
            </div>

            <div className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 items-stretch">

              {/* 2. The Old Way (Left Column) */}
              <div className="min-w-[85vw] lg:min-w-0 snap-center rounded-2xl p-6 bg-[#111] border border-red-500/20 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <FaTimes className="text-8xl text-red-500" />
                </div>

                <h3 className="text-xl font-bold mb-1 text-white">The Typical Stack</h3>
                <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-6">Expensive & Fragmented</p>

                <div className="space-y-3 flex-1">
                  {[
                    { name: "Website Builder", price: "$50", period: "/month" },
                    { name: "Link In Bio", price: "$10", period: "/month" },
                    { name: "Courses", price: "$189", period: "/month" },
                    { name: "Analytics", price: "$44", period: "/month" },
                    { name: "Subscription Tool", price: "$29", period: "/month" },
                    { name: "Merch Storefront", price: "$29", period: "/month" },
                    { name: "Website Hosting", price: "$20", period: "/month" },
                    { name: "Platform Fees", price: "+30%  ", period: "fees" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                      <span className="text-gray-400 font-medium text-sm">{item.name}</span>
                      <span className="font-bold text-white text-sm">{item.price}<span className="text-[10px] text-gray-500 font-normal">{item.period}</span></span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400 font-medium text-sm">Total Monthly Cost</span>
                    <div className="text-right leading-none">
                      <span className="text-2xl font-black text-white">$371</span>
                      <span className="text-xs text-gray-500 block mt-1">/month + transaction fees</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. The Sygil Way (Right Column) */}
              <div className="min-w-[85vw] lg:min-w-0 snap-center rounded-2xl p-6 bg-gradient-to-b from-[#111] to-[#050505] border border-purple-500/20 relative overflow-hidden flex flex-col shadow-[0_0_30px_rgba(236,72,153,0.1)]">
                {/* Ribbon */}
                <div className="absolute top-5 right-5">
                  <span className="bg-yellow-500 text-black text-[10px] font-black uppercase py-1 px-2 rounded-full">
                    Best Value
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1 text-white">The Sygil Ecosystem</h3>
                <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-wider mb-6">Unified & Free</p>

                <div className="space-y-6 flex-1">
                  <div className="text-center py-6">
                    <div className="text-base text-gray-300 mb-1">What you pay monthly:</div>
                    <div className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-3">
                      $0
                    </div>
                    <p className="text-pink font-medium text-sm">No hidden monthly fees.</p>
                  </div>

                  <div className="space-y-2 bg-black/20 p-5 rounded-xl border border-white/5">
                    {[
                      "All-in-one Identity & Bio",
                      "Built-in Gamified Rewards",
                      "Perks & Shop System",
                      "Unified Fan Database",
                      "Keep 95% of Contributions"
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                          <FaCheck className="text-green-500 text-[10px]" />
                        </div>
                        <span className="text-white font-medium text-sm">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-pink-500/30 bg-pink-500/10 -mx-6 -mb-6 px-6 py-4">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <div>
                      <div className="text-xs text-primary font-medium uppercase tracking-wide mb-1">Your Savings</div>
                      <div className="text-xl font-bold text-white">
                        $371<span className="text">/mo</span> <span className="mx-2 text-white/20">|</span> $4,452<span className="text-pin">/yr</span>
                      </div>
                    </div>
                    <div className="text-xs text-yellow-200 max-w-[180px] leading-tight">
                      Plus increased revenue from higher conversion.
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Savings Statement & CTA */}
            <div className="mt-12 text-center">
              <p className="text-lg md:text-xl text-white font-medium mb-2 max-w-2xl mx-auto">
                "The real savings aren’t just cost — Sygil increases your earnings through loyalty, repeat engagement, and perks fans want to redeem."
              </p>

            </div>

          </div>
        </section>

        {/* ==================== FINAL CTA SECTION 7 ==================== */}
        {/* ==================== FINAL CTA SECTION 7 ==================== */}
        <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(360deg, rgba(255, 47, 114, 0.75) 0%, rgba(255, 99, 47, 0.55) 100%)' }}>
          <div className="max-w-6xl mx-auto relative z-10 px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">

              {/* Left: Image */}
              <div className="relative w-[200px] h-[200px] md:w-[350px] md:h-[350px] flex-shrink-0 animate-float">
                <div className="absolute inset-0 bg-white/20 blur-[50px] rounded-full -z-10"></div>
                <Image src="/traveller.png" alt="Sygil Traveller" fill className="object-contain drop-shadow-2xl" unoptimized />
              </div>

              {/* Right: Content */}
              <div className="text-center md:text-left flex-1 max-w-xl">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 text-white leading-tight">
                  You’re Just One Page Away From Earning More.
                </h2>
                <p className="mb-8 text-lg text-white/90 font-medium">Create It Now.</p>

                <div className="w-full max-w-md mx-auto md:mx-0">
                  {session ? (
                    <Link href={userData?.accountType === 'Creator' || userData?.accountType === 'VCreator' ? `/${session.user.name}` : '/setup'}>
                      <button className="w-auto px-8 py-4 bg-white text-[var(--primary)] hover:bg-gray-100 font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:scale-[1.02] text-sm md:text-base mx-auto md:mx-0">
                        Setup Your Page <FaArrowRight size={12} />
                      </button>
                    </Link>
                  ) : (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-white/50 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-200"></div>
                      <div className="relative flex items-center bg-[#0a0a0a] rounded-full p-1 border border-white/10 shadow-2xl">
                        <span className="pl-4 pr-3 text-[var(--text-muted)] font-medium select-none text-base">sygil.app/</span>
                        <input
                          type="text"
                          className="flex-1 bg-transparent border-none outline-none text-white font-semibold text-base placeholder-gray-600 p-2 w-full min-w-0"
                          placeholder="username"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                            setIsAvailable(null);
                          }}
                          onKeyDown={handleInputKeyDown}
                        />
                        {isAvailable === true ? (
                          <button onClick={handleCreatePage} className="px-5 py-3 bg-[var(--success)] text-white font-semibold rounded-full transition-all flex items-center gap-2 whitespace-nowrap shadow-lg text-sm">
                            Reserve <FaArrowRight size={12} />
                          </button>
                        ) : (
                          <button onClick={checkUsername} disabled={isChecking || !username} className="px-5 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 font-semibold rounded-full transition-all min-w-[100px] flex justify-center whitespace-nowrap text-sm">
                            {isChecking ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Check"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-6 text-sm text-white/70">Free forever. No credit card required.</p>
              </div>

            </div>
          </div>
        </section>

        <Footer forceShow={true} />
      </div >
    </>
  );
}
