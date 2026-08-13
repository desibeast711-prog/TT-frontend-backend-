import React from 'react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', showTagline = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 text-lg',
    md: 'h-8 text-xl',
    lg: 'h-10 text-2xl',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Sleek Minimalist Geometric Shield Monogram */}
      <div className={`relative flex items-center justify-center bg-black text-white rounded-lg shadow-sm font-bold tracking-tighter ${iconSizes[size]}`}>
        <svg viewBox="0 0 32 32" fill="none" className="w-3/5 h-3/5 text-white" xmlns="http://www.w3.org/2000/svg">
          {/* Dual T interlocking geometry */}
          <path d="M4 8H28V12H18V26H14V12H4V8Z" fill="currentColor" />
          <circle cx="22" cy="20" r="3" fill="#00C8FF" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-black tracking-tight text-black ${sizeClasses[size]}`}>
          TRULY<span className="font-light text-neutral-500">TRUE</span>
        </span>
        {showTagline && (
          <span className="text-[10px] tracking-widest uppercase font-semibold text-neutral-400">
            Truth You Can Trust
          </span>
        )}
      </div>
    </div>
  );
};
