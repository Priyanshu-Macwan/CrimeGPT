import React from 'react';

const StatCard = ({ title, value, icon, isHighlighted = false }) => {
  return (
    <div className={`bg-bureau-bg p-md border border-bureau-navy flex items-center justify-between ${isHighlighted ? 'border-l-[8px]' : ''}`}>
      <div>
        <p className="text-label-md font-label-md text-bureau-navy uppercase tracking-wider mb-1 font-bold">
          {title}
        </p>
        <h3 className="text-display font-display text-bureau-navy font-bold">
          {value}
        </h3>
      </div>
      <div className="w-12 h-12 border border-bureau-navy bg-bureau-bg flex items-center justify-center text-bureau-navy">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
    </div>
  );
};

export default StatCard;
