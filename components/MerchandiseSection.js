import React from 'react';

const MerchandiseSection = () => {
  return (
    <div className="w-full max-w-5xl mt-8 flex justify-center">
      <div className="bg-dropdown-hover rounded-2xl p-12 text-center border border-text/10">
        <div className="text-6xl mb-4">👕</div>
        <h2 className="text-2xl font-bold text-text mb-2">Merchandise</h2>
        <p className="text-text/60 text-lg">Coming Soon</p>
        <p className="text-text/40 text-sm mt-2">Showcase and sell your custom merchandise to your community</p>
        <p className="text-text/40 text-sm mt-2">🪙Get Discounts using FamPoints.</p>
      </div>
    </div>
  );
};

export default MerchandiseSection;
