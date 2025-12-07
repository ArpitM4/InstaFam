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

      {/* Floating Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center pointer-events-none bg-black md:bg-transparent">
        {/* Logo */}
        <Link href="/" className="pointer-events-auto transition-transform hover:scale-105">
          <Image src="/Text.png" alt="Sygil" width={100} height={32} className="h-8 w-auto" priority />
        </Link>

        {/* Get Started Button */}
        <Link href={session ? (userData?.accountType === 'Creator' || userData?.accountType === 'VCreator' ? `/${session.user.name}` : '/setup') : '/'} className="pointer-events-auto">
          <button className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
            Get Started for Free
          </button>
        </Link>
      </nav>

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

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight">
                Earn From Anything You Do
                <span className="gradient-text block mt-1 pb-2 text-4xl md:text-5xl lg:text-6xl font-extrabold">— Literally Anything.</span>
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
                  <div className="text-lg font-extrabold text-green-400 mt-1">+$4,250</div>
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
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-extrabold uppercase mb-6 tracking-tight leading-none">
                You're Leaving a LOT of Money on the Table. <br className="hidden md:block" /> Here's Why.
              </h2>

              <div className="flex justify-center">
                <Link href={session ? (userData?.accountType === 'Creator' || userData?.accountType === 'VCreator' ? `/${session.user.name}` : '/setup') : '/setup'}>
                  <button className="px-6 py-2 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform">
                    You are building an empire on rented land, using tools that don't talk to each other.                  </button>
                </Link>
              </div>
            </div>

            {/* Scrollable Container on Mobile, Grid on Desktop */}
            <div className="flex overflow-x-auto pb-6 gap-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide">
              {[
                {
                  title: "YOU'RE OFFERING THEM LESS",
                  desc: "Fans want attention and recognition. Shoutouts, replies and reposts are worth paying for — most creators never monetize them.",
                  bgClass: "bg-gradient-to-b from-black to-indigo-800"
                },
                {
                  title: "QR / SUPERCHAT TIPS",
                  desc: "A QR code donation is a thank-you moment — it rarely builds loyalty or habit. Convert one-time tips into repeat support.",
                  bgClass: "bg-gradient-to-b from-black to-amber-800"
                },
                {
                  title: "SUBSCRIPTION FATIGUE",
                  desc: "Not every fan can pay $5/month. Subscriptions are powerful but not the only path to income.",
                  bgClass: "bg-gradient-to-b from-black to-rose-800"
                },
                {
                  title: "FRAGMENTED TOOLS",
                  desc: "Link-in-bio for links. Patreon for subs. Ko-fi for tips. Discord for chat. Your fans are scattered everywhere.",
                  bgClass: "bg-gradient-to-b from-black to-red-800"
                },
              ].map((card, i) => (
                <div key={i} className={`relative min-w-[85vw] md:min-w-0 md:w-auto snap-center rounded-[2rem] p-6 h-[500px] flex flex-col group overflow-hidden border border-black/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:brightness-110 ${card.bgClass}`}>

                  {/* Title */}
                  <h3 className="text-2xl font-black uppercase leading-[0.9] tracking- mb-6 relative z-10 w-3/4 text-white">
                    {card.title}
                  </h3>

                  {/* Image Placeholder */}
                  <div className="flex-1 relative w-full rounded-xl overflow-hidden bg-black/30 border border-white/5 backdrop-blur-sm mb-6 transition-all group-hover:border-white/20">
                    <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-mono uppercase">
                      [Image Placeholder]
                    </div>
                  </div>

                  {/* Description */}
                  <div className="relative z-10">
                    <p className="text-sm text-gray-300 font-medium leading-relaxed mb-4 line-clamp-3 group-hover:text-white transition-colors">
                      {card.desc}
                    </p>

                    <div className="flex items-center text-sm font-bold text-white opacity-60 group-hover:opacity-100 transition-opacity gap-2">
                      Learn More <FaArrowRight size={10} />
                    </div>
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
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">Turn Your Followers Into <span className="text-[var(--primary)]">Super Fans</span>.</h2>
                <div className="space-y-6 mt-8">
                  {[
                    { title: "Set Up Your Sygil Page", desc: "Create your page in minutes — your new home for earnings, perks, and fan engagement." },
                    { title: "Choose How You Want to Earn", desc: "Enable contributions, add Vault items, and offer perks fans can unlock with points." },
                    { title: "Share Your Link Everywhere", desc: "Place your Sygil link in your bio, on streams, in reels, or anywhere your audience sees you." },
                    { title: "Fans Engage & Earn Points", desc: "Every tip, view, share, or interaction gives fans FamPoints — keeping them coming back." },
                    { title: "You Get Instant Payouts", desc: "No more juggling 5 tools. Sygil handles everything in one place, and your money arrives instantly." }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm border border-white/20 group-hover:bg-orange-500 group-hover:text-black transition-colors">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg leading-none mb-1 group-hover:text-orange-500 transition-colors">{step.title}</h3>
                        <p className="text-[var(--text-muted)] text-base leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Phone Mockup */}
              <div className="relative h-[420px] w-full flex items-center justify-center">
                <div className="relative z-10 w-64 md:w-72 h-[420px] rounded-[2rem] shadow-2xl overflow-hidden border-8 bg-[#0a0a0a] border-[#222]" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                  <div className="h-full w-full p-4 flex flex-col bg-[#050505]">
                    <div className="w-full h-28 rounded-xl mb-4 p-4 flex items-end relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/50 to-blue-500/10"></div>
                      <div className="w-12 h-12 rounded-full border-2 border-[#050505] bg-[#333] relative z-10" />
                    </div>

                    <div className="space-y-3">
                      <div className="h-2 w-24 rounded bg-white/20 mb-4" />
                      <div className="h-14 w-full rounded-xl bg-white/5 border border-white/5 p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[var(--primary)]/20" />
                        <div className="h-2 w-20 rounded bg-white/10" />
                      </div>

                      <div className="h-14 w-full rounded-xl bg-white/5 border border-white/5 p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-green-500/20" />
                        <div className="h-2 w-24 rounded bg-white/10" />
                      </div>

                      <div className="h-28 w-full rounded-xl p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-white/10 mt-2">
                        <div className="h-2 w-20 rounded bg-[var(--primary)] mb-2" />
                        <div className="h-2 w-32 rounded bg-white/10" />
                      </div>
                    </div>
                  </div>
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
              </div>
            </div>
          </div>
        </section>


        {/* Section 4 */}
        <section className="py-24 px-4 relative border-b border-white/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/20 via-[#0a0a0a] to-[#0a0a0a]">
          {/* Ecosystem Bento Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Everything You Need. <span className="text-[var(--primary)]">One Ecosystem.</span></h3>
              <p className="text-[var(--text-muted)] text-base md:text-lg max-w-2xl mx-auto">From identity to monetization, The complete creator stack.</p>
            </div>

            <div className="flex overflow-x-auto pb-6 gap-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-5 md:auto-rows-[minmax(180px,auto)] md:overflow-visible md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">

              {/* 1. Beautiful Identity (Hero Card) - Spans 2 cols, 2 rows */}
              <div className="min-w-[85vw] md:min-w-0 snap-center md:col-span-2 md:row-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group border border-white/5 hover:border-[var(--primary)]/30 transition-all duration-500 bg-[#0f0f0f]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                      <FaLink />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">Beautiful Identity</h3>
                    <p className="text-[var(--text-muted)] text-base leading-relaxed max-w-lg">
                      Stop sending fans to a list of links. Sygil gives you a stunning, customizable home that aggregates your entire digital presence.
                    </p>
                  </div>
                  {/* Visual Decorator */}
                  <div className="mt-8 flex gap-3 opacity-40 bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="w-1/3 h-1.5 rounded-full bg-white/10"></div>
                  </div>
                </div>
              </div>

              {/* 2. Gamified Contributions */}
              <div className="min-w-[85vw] md:min-w-0 snap-center glass-card rounded-3xl p-6 border border-white/5 hover:border-blue-400/30 group transition-all duration-300 bg-[#0f0f0f] flex flex-col justify-between">
                <div>
                  <FaGem className="text-3xl text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-bold mb-2">Gamified Support</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed">Support becomes a game. Leaderboards, XP, and badges for top fans.</p>
                </div>
              </div>

              {/* 3. Redeemable Perks */}
              <div className="min-w-[85vw] md:min-w-0 snap-center glass-card rounded-3xl p-6 border border-white/5 hover:border-pink-400/30 group transition-all duration-300 bg-[#0f0f0f] flex flex-col justify-between">
                <div>
                  <FaGift className="text-3xl text-pink-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
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
                <div key={i} className="min-w-[85vw] md:min-w-0 snap-center glass-card rounded-3xl p-6 border border-white/5 flex flex-col opacity-80 hover:opacity-100 transition-all hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full ${item.bg} ${item.color} text-xl`}>
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
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3">Different Creators. Different Perks. Same Superfan Engine.</h2>
              <p className="text-base text-[var(--text-muted)]">Here are just a few ways creators use Sygil to reward their fans.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: FaYoutube, color: 'text-red-600', title: 'Content Creators', items: ['Offer shoutouts', 'Real-life meetup slots', 'Thanks at the end of video'] },
                { icon: FaInstagram, color: 'text-pink-600', title: 'Influencers', items: ['Story reposts', 'Exclusive photos', 'Close Friends access'] },
                { icon: FaTwitch, color: 'text-purple-600', title: 'Streamers', items: ['1v1 sessions', 'Gameplay settings', 'Add to clan'] },
                { icon: FaPaintBrush, color: 'text-blue-500', title: 'Artists & Experts', items: ['Sell assets/notes', 'Brush settings & palettes', 'Exclusive wallpaper packs'] },
              ].map((c, i) => (
                <div key={i} className="glass-card p-8 rounded-2xl relative overflow-hidden group bg-[#151515] border border-white/5 min-h-[220px] flex flex-col hover:border-white/10 transition-colors">
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
          </div>
        </section >

        {/* ==================== FINAL CTA SECTION-6 ==================== */}
        < section className="py-16 text-center relative overflow-hidden bg-[#0a0a0a]" >
          <div className="relative z-10">
            <div className="inline-block relative mb-3">
              <Image src="/smallcat.png" alt="Cat" width={60} height={60} className="object-contain" unoptimized />
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 text-text">You’re One Page Away From Earning More.</h2>
            <p className="mb-8 text-base text-[var(--text-muted)]">Create It Now.</p>

            <div className="flex justify-center px-4">
              <div className="max-w-md w-full">
                {session ? (
                  <Link href={userData?.accountType === 'Creator' || userData?.accountType === 'VCreator' ? `/${session.user.name}` : '/setup'}>
                    <button className="w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-[1.02] text-sm border border-white/10 mx-auto">
                      Setup Your Page <FaArrowRight size={12} />
                    </button>
                  </Link>
                ) : (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-200"></div>
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
            </div>

            <p className="mt-6 text-sm text-[var(--text-muted)]">Free forever. No credit card required.</p>
          </div>
        </section >

        <Footer forceShow={true} />
      </div >

    </>
  );
}
