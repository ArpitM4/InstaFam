import React from 'react';

const CommunitySection = () => {
  return (
    <div className="w-full max-w-5xl mt-8 flex justify-center">
      <div className="rounded-2xl p-12 text-center border border-white/10 shadow-lg" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)'}}>
        <h2 className="text-2xl font-bold text-gradient-primary mb-2">Community</h2>
        <p className="text-text/60 text-lg mb-4">Coming Soon</p>
        
        {/* Feature Preview */}
        <div className="mt-6 space-y-4 text-left max-w-md mx-auto">
          <div className="rounded-xl p-4 border border-white/10" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'}}>
            <h3 className="text-sm font-semibold text-primary mb-2">Loyalty Badges</h3>
            <p className="text-text/60 text-xs leading-relaxed">
              Earn exclusive badges based on your leaderboard ranks in past events
            </p>
          </div>
          
          <div className="rounded-xl p-4 border border-white/10" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'}}>
            <h3 className="text-sm font-semibold text-primary mb-2">Creator Posts & Announcements</h3>
            <p className="text-text/60 text-xs leading-relaxed">
              Stay updated with exclusive posts, polls, and announcements from your favorite creators
            </p>
          </div>
          
          <div className="rounded-xl p-4 border border-white/10" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'}}>
            <h3 className="text-sm font-semibold text-primary mb-2">Tiered Access</h3>
            <p className="text-text/60 text-xs leading-relaxed">
              Unlock voting rights and even direct messaging with creators (top 1% supporters)
            </p>
          </div>
          
          <div className="rounded-xl p-4 border border-white/10" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'}}>
            <h3 className="text-sm font-semibold text-primary mb-2">Loyalty Points</h3>
            <p className="text-text/60 text-xs leading-relaxed">
              Accumulate loyalty points across all events to unlock exclusive perks and recognition
            </p>
          </div>
        </div>
        
        <p className="text-text/40 text-xs mt-6">
          A private community space where true fans connect and engage
        </p>
      </div>
    </div>
  );
};

export default CommunitySection;
