import React from 'react';

export const StoreSkeleton = () => {
  return (
    <div className="glass-panel rounded-2xl p-5 shimmer-effect flex flex-col space-y-4">
      <div className="h-44 w-full bg-slate-800 rounded-xl"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 w-1/2 bg-slate-800 rounded"></div>
        <div className="h-6 w-10 bg-slate-800 rounded"></div>
      </div>
      <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
      <div className="flex gap-4 pt-2">
        <div className="h-4 w-1/3 bg-slate-800 rounded"></div>
        <div className="h-4 w-1/3 bg-slate-800 rounded"></div>
      </div>
    </div>
  );
};

export const ProductSkeleton = () => {
  return (
    <div className="glass-panel rounded-2xl p-4 shimmer-effect flex flex-col space-y-3">
      <div className="h-36 w-full bg-slate-800 rounded-xl"></div>
      <div className="h-4 w-1/3 bg-slate-800 rounded"></div>
      <div className="h-5 w-3/4 bg-slate-800 rounded"></div>
      <div className="h-8 w-1/2 bg-slate-800 rounded-lg pt-1"></div>
      <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
        <div className="h-6 w-20 bg-slate-800 rounded"></div>
        <div className="h-8 w-8 bg-slate-800 rounded-full"></div>
      </div>
    </div>
  );
};

export const DashboardCardSkeleton = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 shimmer-effect flex flex-col space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-slate-800 rounded"></div>
        <div className="h-8 w-8 bg-slate-800 rounded-lg"></div>
      </div>
      <div className="h-8 w-20 bg-slate-800 rounded"></div>
      <div className="h-4 w-32 bg-slate-800 rounded"></div>
    </div>
  );
};
