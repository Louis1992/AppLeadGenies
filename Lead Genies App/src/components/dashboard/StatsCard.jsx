import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, subtitle, trend, color = "mint", icon: Icon }) {
  const colorMap = {
    mint: 'var(--clay-mint)',
    lavender: 'var(--clay-lavender)',
    peach: 'var(--clay-peach)',
    blue: 'var(--clay-blue)',
    pink: 'var(--clay-pink)'
  };

  return (
    <div className="clay-card p-6 relative overflow-hidden">
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-40 rounded-full blur-2xl"
        style={{ background: colorMap[color], transform: 'translate(30%, -30%)' }}
      />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          </div>
          {Icon && (
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: colorMap[color] }}
            >
              <Icon className="w-6 h-6 text-gray-700" />
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}