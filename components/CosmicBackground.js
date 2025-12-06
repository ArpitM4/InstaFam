"use client";
import React from 'react';

// Floating Star Component
export function Star({ style, size = 'sm', delay = 0 }) {
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
export function FourPointStar({ style, color = 'gold', size = 20, delay = 0 }) {
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
export function Comet({ style, delay = 0 }) {
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
export function FloatingOrb({ style, colors, size = 30, delay = 0 }) {
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
export function CoinIcon({ style, delay = 0 }) {
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
export default function CosmicBackground() {
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
