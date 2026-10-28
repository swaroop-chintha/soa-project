import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  tag?: string;
  icon?: React.ReactNode;
  dark?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  tag,
  icon,
  dark = false,
  className = '',
  children,
}) => {
  return (
    <div
      className={`rounded-3xl p-8 sm:p-10 transition-all duration-300 flex flex-col justify-between border ${
        dark
          ? 'bg-[#2B2644] text-white border-[#3A3358] shadow-xl'
          : 'bg-white text-[#111111] border-[#E5DDF5] hover:border-[#D4C5EF] hover:shadow-lavender-md hover:-translate-y-0.5'
      } ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          {icon && (
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                dark ? 'bg-white/10 text-white' : 'bg-[#F4F0FC] text-[#2B2644] border border-[#E5DDF5]/80'
              }`}
            >
              {icon}
            </div>
          )}
          {tag && (
            <span
              className={`text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full ${
                dark
                  ? 'bg-white/10 text-white/90 border border-white/20'
                  : 'bg-blue-50 text-[#1E40AF] border border-blue-100'
              }`}
            >
              {tag}
            </span>
          )}
        </div>

        <h3
          className={`text-xl sm:text-2xl font-medium tracking-tight mb-3 ${
            dark ? 'text-white' : 'text-[#111111]'
          }`}
        >
          {title}
        </h3>

        <p
          className={`text-sm sm:text-base leading-relaxed ${
            dark ? 'text-white/80' : 'text-[#666666]'
          }`}
        >
          {description}
        </p>
      </div>

      {children && <div className="mt-8 pt-4">{children}</div>}
    </div>
  );
};
