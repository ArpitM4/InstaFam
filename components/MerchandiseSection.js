import React from 'react';

const MerchandiseSection = () => {
  return (
    <div className="w-full max-w-5xl mt-8 flex justify-center">
      <div className="rounded-2xl p-12 text-center border border-white/10 shadow-lg" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)'}}>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-rose-400 bg-clip-text text-transparent mb-2">Merchandise</h2>
        <p className="text-text/60 text-lg">Coming Soon</p>
        <p className="text-text/40 text-sm mt-2">Showcase and sell your custom merchandise to your community</p>
        <p className="text-text/40 text-sm mt-2">Get Discounts using FamPoints.</p>
      </div>
    </div>
  );
};

export default MerchandiseSection;
