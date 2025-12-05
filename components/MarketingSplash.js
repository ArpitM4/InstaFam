"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';

// Floating Star Component
function Star({ style, size = 'sm', delay = 0 }) {
  const sizeClasses = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  return (
    <div
      className={`absolute ${sizeClasses[size]} rounded-full animate-twinkle`}
      style={{
        ...style,
        animationDelay: `${delay}s`,
        background: 'radial-gradient(circle, var(--star-white) 0%, transparent 70%)',
        boxShadow: '0 0 6px 2px rgba(255, 255, 255, 0.4)'
      }}
    />
  );
}

// Four-pointed Star Component
function FourPointStar({ style, color = 'gold', size = 20, delay = 0 }) {
  const colors = {
    gold: 'var(--star-gold)',
    white: 'var(--star-white)',
    orange: 'var(--secondary)',
    pink: 'var(--primary)'
  };

  return (
    <svg
      className="absolute animate-twinkle"
      style={{ ...style, animationDelay: `${delay}s` }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={colors[color]}
    >
      <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
    </svg>
  );
}

// Comet Component
function Comet({ style, delay = 0 }) {
  return (
    <div
      className="absolute animate-comet"
      style={{
        ...style,
        animationDelay: `${delay}s`,
        animationDuration: '4s'
      }}
    >
      <div
        className="w-20 h-1 rounded-full"
        style={{
          background: 'linear-gradient(90deg, var(--comet-orange), transparent)',
          transform: 'rotate(-45deg)'
        }}
      />
      <div
        className="absolute left-0 top-0 w-3 h-3 rounded-full"
        style={{
          background: 'radial-gradient(circle, var(--secondary-light) 0%, var(--comet-orange) 100%)',
          boxShadow: '0 0 10px 3px var(--comet-orange)'
        }}
      />
    </div>
  );
}

// Floating Planet/Orb Component
function FloatingOrb({ style, colors, size = 30, delay = 0 }) {
  return (
    <div
      className="absolute rounded-full animate-float"
      style={{
        ...style,
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${colors[0]}, ${colors[1]})`,
        boxShadow: `0 0 20px 5px ${colors[1]}40`,
        animationDelay: `${delay}s`
      }}
    />
  );
}

// Coin Character
function CoinIcon({ style, delay = 0 }) {
  return (
    <div
      className="absolute animate-float text-3xl"
      style={{ ...style, animationDelay: `${delay}s` }}
    >
      🪙
    </div>
  );
}

// Background with stars and cosmic elements
function CosmicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ background: 'linear-gradient(180deg, #0a0a15 0%, #151525 50%, #1a1020 100%)' }}>
      {/* Small twinkling stars */}
      <Star style={{ top: '5%', left: '10%' }} size="xs" delay={0} />
      <Star style={{ top: '8%', left: '25%' }} size="sm" delay={0.5} />
      <Star style={{ top: '3%', left: '40%' }} size="xs" delay={1} />
      <Star style={{ top: '12%', left: '55%' }} size="sm" delay={1.5} />
      <Star style={{ top: '6%', left: '70%' }} size="xs" delay={0.3} />
      <Star style={{ top: '15%', left: '85%' }} size="sm" delay={0.8} />
      <Star style={{ top: '20%', left: '5%' }} size="sm" delay={1.2} />
      <Star style={{ top: '25%', left: '15%' }} size="xs" delay={0.7} />
      <Star style={{ top: '18%', left: '92%' }} size="sm" delay={1.8} />
      <Star style={{ top: '35%', left: '8%' }} size="xs" delay={0.4} />
      <Star style={{ top: '45%', left: '3%' }} size="sm" delay={1.1} />
      <Star style={{ top: '55%', left: '12%' }} size="xs" delay={0.9} />
      <Star style={{ top: '40%', left: '95%' }} size="sm" delay={1.6} />
      <Star style={{ top: '60%', left: '88%' }} size="xs" delay={0.2} />
      <Star style={{ top: '70%', left: '92%' }} size="sm" delay={1.3} />
      <Star style={{ top: '75%', left: '5%' }} size="xs" delay={0.6} />
      <Star style={{ top: '85%', left: '15%' }} size="sm" delay={1.4} />
      <Star style={{ top: '90%', left: '80%' }} size="xs" delay={0.1} />

      {/* Four-pointed decorative stars */}
      <FourPointStar style={{ top: '8%', left: '30%' }} color="gold" size={16} delay={0.5} />
      <FourPointStar style={{ top: '15%', left: '75%' }} color="gold" size={20} delay={1.2} />
      <FourPointStar style={{ top: '25%', left: '5%' }} color="white" size={12} delay={0.8} />
      <FourPointStar style={{ top: '70%', left: '10%' }} color="gold" size={18} delay={1.5} />
      <FourPointStar style={{ top: '85%', left: '90%' }} color="gold" size={24} delay={0.3} />
      <FourPointStar style={{ top: '60%', left: '95%' }} color="white" size={14} delay={1.0} />

      {/* Comets */}
      <Comet style={{ top: '10%', left: '20%' }} delay={0} />
      <Comet style={{ top: '30%', left: '80%' }} delay={2} />

      {/* Floating orbs/planets */}
      <FloatingOrb 
        style={{ top: '5%', right: '25%' }} 
        colors={['#FFB347', '#FF6B35']} 
        size={25} 
        delay={0.5} 
      />
      <FloatingOrb 
        style={{ top: '8%', right: '30%' }} 
        colors={['#EC4899', '#8B5CF6']} 
        size={12} 
        delay={1.2} 
      />

      {/* Coin */}
      <CoinIcon style={{ top: '6%', right: '22%' }} delay={0.8} />

      {/* Bottom glow effect */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(ellipse, var(--star-gold) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
    </div>
  );
}

export default function MarketingSplash() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const handleCredentialsAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to create account');
          setLoading(false);
          return;
        }

        const result = await signIn('credentials', {
          email,
          password,
          redirect: false
        });

        if (result?.error) {
          setError('Account created! Please login.');
          setIsLogin(true);
        } else {
          router.push('/');
          router.refresh();
        }
      } catch (err) {
        setError('Something went wrong');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google');
  };

  return (
    <>
      <CosmicBackground />
      
      {/* Floating Logo */}
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
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-12 py-20 lg:py-0 gap-8 lg:gap-16">
          {/* Left Side - Branding */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl lg:max-w-2xl">
            {/* Headline */}
            <h1 className="text-4xl sm:text-7xl lg:text-6xl font-bold gradient-text tracking-wide mb-4">
              Ask More From Your Favourite Creators !
            </h1>
            
            {/* Tagline */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text mb-2">
              Connect. Create. Ascend.
            </h2>
            <p className="text-text-muted text-sm sm:text-base mb-8">
              The Ultimate Fan & Creator Nexus.
            </p>

            {/* Illustration */}
            <div className="relative w-full max-w-lg lg:max-w-xl">
              <Image
                src="/Illustration.png"
                alt="Sygil Characters"
                width={600}
                height={400}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Right Side - Auth Card */}
          <div className="w-full max-w-sm lg:max-w-md">
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium mb-6"
              >
                <FaGoogle className="text-lg" />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-card-border"></div>
                <span className="text-text-muted text-sm">or</span>
                <div className="flex-1 h-px bg-card-border"></div>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleCredentialsAuth} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-text text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="glass-input w-full px-4 py-3 rounded-lg text-text placeholder-text-muted"
                        required={!isLogin}
                      />
                    </div>
                    <div>
                      <label className="block text-text text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                        placeholder="username"
                        className="glass-input w-full px-4 py-3 rounded-lg text-text placeholder-text-muted"
                        required={!isLogin}
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-text text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="glass-input w-full px-4 py-3 rounded-lg text-text placeholder-text-muted"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="glass-input w-full px-4 py-3 pr-12 rounded-lg text-text placeholder-text-muted"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-error text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gradient w-full py-3 rounded-lg text-white font-semibold disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
                </button>
              </form>

              {/* Forgot Password (only for login) */}
              {isLogin && (
                <div className="text-right mt-3">
                  <Link href="/forgot-password" className="text-text-muted hover:text-text text-sm transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              )}

              {/* Toggle Login/Signup */}
              <p className="text-center mt-6 text-text">
                {isLogin ? "New User? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-primary hover:text-primary-light font-semibold transition-colors"
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>

              {/* Creator Link */}
              <div className="text-center mt-6 pt-6 border-t border-card-border">
                <Link 
                  href="/creators" 
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  Are you a Creator? →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
