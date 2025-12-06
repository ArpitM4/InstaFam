"use client";
import "../globals.css";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SEO from "@/components/SEO";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import Footer from "@/components/Footer";
import { FaTrophy, FaGem, FaPercent, FaLink, FaUsers, FaShoppingBag, FaCreditCard, FaComments, FaCheck, FaTimes, FaYoutube, FaTwitch, FaInstagram } from "react-icons/fa";

export default function CreatorsPage() {
  const headings = ["Creator Business at One Place", "Stop Scattering Your Fans."];
  const animationDuration = 10000;
  const [textIndex, setTextIndex] = useState(0);
  const [key, setKey] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [claimUsername, setClaimUsername] = useState("");
  const videoRef = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { userData } = useUser();

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % headings.length;
        setKey((prevKey) => prevKey + 1);
        return nextIndex;
      });
    }, animationDuration);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const setPlaybackRate = () => {
        video.playbackRate = 1.2;
        setVideoLoaded(true);
      };
      if (video.readyState >= 1) {
        setPlaybackRate();
      }
      video.addEventListener('loadeddata', setPlaybackRate);
      video.addEventListener('canplay', setPlaybackRate);
      return () => {
        video.removeEventListener('loadeddata', setPlaybackRate);
        video.removeEventListener('canplay', setPlaybackRate);
      };
    }
  }, []);

  const handleCreatePage = () => {
    if (!session) {
      router.push('/login');
    } else if (userData?.accountType === 'Creator' || userData?.accountType === 'VCreator') {
      router.push(`/${session.user.name}`);
    } else {
      router.push('/account');
    }
  };

  const handleClaimLink = () => {
    if (claimUsername.trim()) {
      router.push(`/signup?username=${encodeURIComponent(claimUsername.trim())}`);
    } else {
      router.push('/signup');
    }
  };

  const getButtonText = () => {
    if (!session) return "Create your Page →";
    if (userData?.accountType === 'Creator' || userData?.accountType === 'VCreator') {
      return "My Page";
    }
    return "Create your Page →";
  };

  return (
    <>
      <SEO
        title="Build Your Creator Business on One Page"
        description="Join Sygil to connect with creators, earn points, unlock exclusive content, and support your favorite influencers."
        url="https://www.sygil.app/creators"
        image="https://www.sygil.app/og-home.jpg"
      />
      
      {/* Floating Logo - Top Left */}
      <Link href="/" className="fixed top-6 left-6 z-50">
        <Image
          src="/Text.png"
          alt="Sygil"
          width={100}
          height={32}
          className="h-8 w-auto"
          priority
        />
      </Link>

      {/* Main Container */}
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        
        {/* ==================== HERO SECTION WITH VIDEO ==================== */}
        <section className="relative min-h-screen flex items-center justify-center">
          {/* Video Background - NOT fixed, contained to this section */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div 
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
              style={{ backgroundImage: 'url(/vid.png)' }}
            />
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
              src="/vid.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 px-3 sm:px-6 md:px-12 py-12 text-center max-w-4xl w-full">
            <h1
              key={key}
              className="text-2xl sm:text-4xl md:text-6xl lg:text-6xl font-extrabold text-white mb-6 border-r-4 border-white whitespace-nowrap overflow-hidden animate-typing"
            >
              {headings[textIndex]}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white opacity-80 mb-8 animate-fadeIn delay-200">
              Bring all your engagement, contributions, links, and loyalty into a single creator page — simple, powerful, and built to grow your brand.
            </p>

            {/* Create Page Button */}
            <div className="flex items-center justify-center animate-fadeIn delay-300">
              <button
                onClick={handleCreatePage}
                className="btn-gradient px-8 py-4 font-semibold text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-lg"
              >
                {getButtonText()}
              </button>
            </div>

            {/* Explore Link */}
            <div className="pt-20 animate-fadeIn delay-400">
              <Link 
                href="/explore" 
                className="text-white hover:text-primary transition-colors duration-200 text-lg font-light animate-pulse-blink"
              >
                Explore Top Creators →
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </section>

        {/* ==================== HERO SECTION 2: SUPER CHAT KILLER ==================== */}
        <section className="relative py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
          {/* Background Gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[120px] -z-10" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }} />
          
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 hover:bg-white/10 transition cursor-pointer" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--success)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>New: The "Super Chat Killer" is live 🚀</span>
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight text-text">
              Stop Giving YouTube <br />
              <span className="text-gradient-primary">30% of Your Income.</span>
            </h2>
            
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-muted)' }}>
              Sygil is the all-in-one platform for creators. Gamified live donations, loyalty rewards, and a link-in-bio that actually makes you money. 
              <span className="text-text font-bold"> All for just 5%.</span>
            </p>

            {/* Claim Link Input */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <div className="flex items-center bg-white rounded-full p-1.5 pr-2 pl-6 w-full sm:w-auto max-w-md mx-auto sm:mx-0 group focus-within:ring-4 transition" style={{ '--tw-ring-color': 'rgba(255, 47, 114, 0.3)' }}>
                <span className="font-medium mr-1" style={{ color: 'var(--text-muted)' }}>sygil.app/</span>
                <input 
                  type="text" 
                  placeholder="yourname" 
                  value={claimUsername}
                  onChange={(e) => setClaimUsername(e.target.value)}
                  className="bg-transparent border-none outline-none text-black font-bold w-32 placeholder-gray-400 focus:ring-0 p-0"
                />
                <button 
                  onClick={handleClaimLink}
                  className="text-white px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition whitespace-nowrap"
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  Claim Link
                </button>
              </div>
            </div>

            {/* Social Proof */}
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Trusted by creators from</p>
            <div className="flex justify-center gap-8 opacity-50">
              <div className="flex items-center gap-2 text-text"><FaYoutube className="w-6 h-6" /> <span className="font-bold">YouTube</span></div>
              <div className="flex items-center gap-2 text-text"><FaTwitch className="w-6 h-6" /> <span className="font-bold">Twitch</span></div>
              <div className="flex items-center gap-2 text-text"><FaInstagram className="w-6 h-6" /> <span className="font-bold">Instagram</span></div>
            </div>
          </div>
        </section>

        {/* ==================== FEATURE GRID SECTION ==================== */}
        <section className="py-24" style={{ backgroundColor: 'var(--background-soft)' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-text">Don't Just Take Tips.<br />Build an Empire.</h2>
              <p style={{ color: 'var(--text-muted)' }}>Turn passive viewers into active superfans with our gamified engine.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1: Gamified Leaderboards */}
              <div className="rounded-3xl p-8 hover:bg-white/10 transition group border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition" style={{ backgroundColor: 'rgba(255, 47, 114, 0.2)' }}>
                  <FaTrophy className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-text">Gamified Leaderboards</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Create FOMO and competition. Fans donate to rank #1 on your public leaderboard. Proven to increase revenue by 30%.</p>
                <div className="rounded-xl p-4 border" style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-bold" style={{ color: 'var(--star-gold)' }}>#1 KingSlayer</span>
                    <span className="font-bold" style={{ color: 'var(--star-gold)' }}>₹5,000</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--background-hover)' }}>
                    <div className="h-full w-3/4" style={{ backgroundColor: 'var(--star-gold)' }} />
                  </div>
                </div>
              </div>

              {/* Card 2: Vault & FamPoints */}
              <div className="rounded-3xl p-8 hover:bg-white/10 transition group border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                  <FaGem className="w-6 h-6" style={{ color: 'var(--cosmic-purple)' }} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-text">The Vault & FamPoints</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Don't just take; give back. Every donation earns fans guaranteed loyalty points they can redeem for exclusive perks.</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 text-xs rounded border" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: 'rgb(196, 181, 253)', borderColor: 'rgba(139, 92, 246, 0.3)' }}>💎 100 FP Earned</span>
                  <span className="px-2 py-1 text-xs rounded border" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: 'rgb(134, 239, 172)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>🔓 Perk Unlocked</span>
                </div>
              </div>

              {/* Card 3: Keep 95% */}
              <div className="rounded-3xl p-8 hover:bg-white/10 transition group relative overflow-hidden border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }} />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                  <FaPercent className="w-6 h-6" style={{ color: 'var(--success)' }} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-text">Keep 95% of It</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>YouTube takes 30%. Twitch takes 50%. We take a flat 5%. You did the work; you should keep the money.</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded border" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <div className="text-xs" style={{ color: 'rgb(248, 113, 113)' }}>Them</div>
                    <div className="font-bold" style={{ color: 'var(--error)' }}>30% Cut</div>
                  </div>
                  <div className="p-2 rounded border" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                    <div className="text-xs" style={{ color: 'rgb(134, 239, 172)' }}>Sygil</div>
                    <div className="font-bold" style={{ color: 'var(--success)' }}>5% Cut</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==================== COMPARISON TABLE SECTION ==================== */}
        <section className="py-20 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'var(--background)' }}>
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-text">Why Creators are Switching</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <th className="p-4 font-medium" style={{ color: 'var(--text-muted)' }}>Feature</th>
                    <th className="p-4 text-center"><span className="font-bold" style={{ color: 'var(--primary)' }}>Sygil</span></th>
                    <th className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>Linktree</th>
                    <th className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>YouTube</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <td className="p-4 font-medium text-text">Commission Fee</td>
                    <td className="p-4 text-center font-bold" style={{ color: 'var(--success)' }}>5%</td>
                    <td className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>N/A</td>
                    <td className="p-4 text-center" style={{ color: 'var(--error)' }}>30%</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <td className="p-4 font-medium text-text">Live Leaderboard</td>
                    <td className="p-4 text-center" style={{ color: 'var(--success)' }}><FaCheck className="w-5 h-5 mx-auto" /></td>
                    <td className="p-4 text-center" style={{ color: 'var(--text-muted)' }}><FaTimes className="w-5 h-5 mx-auto" /></td>
                    <td className="p-4 text-center" style={{ color: 'var(--success)' }}><FaCheck className="w-5 h-5 mx-auto" /></td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <td className="p-4 font-medium text-text">Loyalty Store (Vault)</td>
                    <td className="p-4 text-center" style={{ color: 'var(--success)' }}><FaCheck className="w-5 h-5 mx-auto" /></td>
                    <td className="p-4 text-center" style={{ color: 'var(--text-muted)' }}><FaTimes className="w-5 h-5 mx-auto" /></td>
                    <td className="p-4 text-center" style={{ color: 'var(--text-muted)' }}><FaTimes className="w-5 h-5 mx-auto" /></td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <td className="p-4 font-medium text-text">All-in-One Profile</td>
                    <td className="p-4 text-center" style={{ color: 'var(--success)' }}><FaCheck className="w-5 h-5 mx-auto" /></td>
                    <td className="p-4 text-center" style={{ color: 'var(--success)' }}><FaCheck className="w-5 h-5 mx-auto" /></td>
                    <td className="p-4 text-center" style={{ color: 'var(--text-muted)' }}><FaTimes className="w-5 h-5 mx-auto" /></td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <td className="p-4 font-medium text-text">FamPoints Rewards</td>
                    <td className="p-4 text-center" style={{ color: 'var(--success)' }}><FaCheck className="w-5 h-5 mx-auto" /></td>
                    <td className="p-4 text-center" style={{ color: 'var(--text-muted)' }}><FaTimes className="w-5 h-5 mx-auto" /></td>
                    <td className="p-4 text-center" style={{ color: 'var(--text-muted)' }}><FaTimes className="w-5 h-5 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ==================== THE MOAT / ECOSYSTEM SECTION ==================== */}
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-bold tracking-wider text-xs uppercase" style={{ color: 'var(--accent)' }}>The Future</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6 text-text">More Than Just a Link. <br />It's Your Entire Business.</h2>
              <p className="mb-8 text-lg" style={{ color: 'var(--text-muted)' }}>
                Start with donations. Grow with the ecosystem. Sygil replaces your Patreon, Linktree, and Discord with one unified home for your fans.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 229, 212, 0.2)' }}>
                    <FaLink className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  </div>
                  <span className="font-medium text-text">Smart Link-in-Bio</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                    <FaUsers className="w-4 h-4" style={{ color: 'var(--cosmic-purple)' }} />
                  </div>
                  <span className="font-medium text-text">Fan Community <span className="text-xs px-2 py-0.5 rounded ml-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>Coming Soon</span></span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 215, 0, 0.2)' }}>
                    <FaShoppingBag className="w-4 h-4" style={{ color: 'var(--star-gold)' }} />
                  </div>
                  <span className="font-medium text-text">Merch Store <span className="text-xs px-2 py-0.5 rounded ml-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>Coming Soon</span></span>
                </li>
              </ul>
              <button 
                onClick={handleCreatePage}
                className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition"
              >
                Get Started Free
              </button>
            </div>
            
            {/* Phone Mockup */}
            <div className="relative h-[500px] w-full flex items-center justify-center">
              <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: 'linear-gradient(to top right, rgba(0, 229, 212, 0.1), rgba(139, 92, 246, 0.1))' }} />
              
              {/* Phone Frame */}
              <div className="relative z-10 w-72 h-[500px] rounded-[3rem] shadow-2xl overflow-hidden border-8 animate-float" style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-hover)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 47, 114, 0.1)' }}>
                {/* Mockup Content */}
                <div className="h-full w-full p-4 flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="w-full h-32 rounded-xl mb-4 p-4 flex items-end" style={{ background: 'linear-gradient(to bottom, rgba(255, 47, 114, 0.3), var(--background))' }}>
                    <div className="w-12 h-12 rounded-full border-2" style={{ backgroundColor: 'var(--background-hover)', borderColor: 'var(--background)' }} />
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 w-full rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <div className="h-12 w-full rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <div className="h-24 w-full rounded-lg p-3 border" style={{ background: 'linear-gradient(to right, rgba(255, 47, 114, 0.2), rgba(139, 92, 246, 0.2))', borderColor: 'rgba(255, 47, 114, 0.3)' }}>
                      <div className="h-2 w-20 rounded mb-2" style={{ backgroundColor: 'var(--primary)' }} />
                      <div className="h-4 w-32 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Feature Cards */}
              <div className="absolute top-20 right-0 p-4 rounded-xl border shadow-xl animate-bounce" style={{ backgroundColor: 'var(--background-soft)', borderColor: 'rgba(255,255,255,0.1)', animationDelay: '1s' }}>
                <FaCreditCard className="w-6 h-6 mb-2" style={{ color: 'var(--success)' }} />
                <div className="text-xs font-bold text-text">Payouts</div>
              </div>
              <div className="absolute bottom-40 left-0 p-4 rounded-xl border shadow-xl animate-bounce" style={{ backgroundColor: 'var(--background-soft)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <FaComments className="w-6 h-6 mb-2" style={{ color: 'var(--accent)' }} />
                <div className="text-xs font-bold text-text">Community</div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FINAL CTA SECTION ==================== */}
        <section className="py-24 text-center relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-text">Ready to Upgrade Your Bio?</h2>
            <p className="mb-10" style={{ color: 'var(--text-muted)' }}>Join the waitlist today and get early access to the Super Chat Killer.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
              <div className="flex items-center backdrop-blur-md rounded-full p-1.5 pr-2 pl-6 w-full sm:w-auto max-w-md mx-auto border transition" style={{ backgroundColor: 'rgba(30,30,30,0.9)', borderColor: 'rgba(255,255,255,0.15)' }}>
                <span className="font-medium mr-1" style={{ color: 'var(--text-muted)' }}>sygil.app/</span>
                <input 
                  type="text" 
                  placeholder="username" 
                  value={claimUsername}
                  onChange={(e) => setClaimUsername(e.target.value)}
                  className="bg-transparent border-none outline-none text-white font-bold w-28 placeholder-gray-500 focus:ring-0 p-0"
                />
                <button 
                  onClick={handleClaimLink}
                  className="text-white px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition whitespace-nowrap"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Reserve Now
                </button>
              </div>
            </div>
            <p className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>Free forever. No credit card required.</p>
          </div>
        </section>

        {/* Footer */}
        <Footer forceShow={true} />
      </div>
    </>
  );
}
