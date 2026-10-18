import React, { useState } from 'react';
import { ShieldCheck, Zap, X, CheckCircle2 } from 'lucide-react';
import NepaliFlag from './NepaliFlag';
import type { Language } from '../utils/translations';

interface AdFreeBannerProps {
  language: Language;
}

export const AdFreeBanner: React.FC<AdFreeBannerProps> = ({ language }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-[#0e1626] to-slate-900 border-b border-slate-800/80 px-4 py-3 sm:py-3.5 transition-all">
      {/* Subtle background glow effect in Nepali crimson */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        
        {/* Left side info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                {language === 'ne' ? '१००% विज्ञापन-रहित शुद्ध फुटबल अनुभव' : '100% Ad-Free Football Experience'}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/60 border border-red-500/30 text-red-300">
                <NepaliFlag size="sm" className="w-3 h-3.5" />
                <span>नेपाल</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ne'
                ? 'कुनै जुवा वा क्यासिनोको विज्ञापन छैन। कुनै कष्टकर पप-अप छैन। केवल रियल-टाइम स्कोर र सम्पूर्ण डेटा।'
                : 'Zero betting banners. Zero video popups. Zero trackers. Just lightning-fast live scores & in-depth match data.'}
            </p>
          </div>
        </div>

        {/* Right side highlights */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300 shrink-0 self-end sm:self-center">
          <div className="hidden lg:flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'ne' ? 'वास्तविक समय' : 'Instant Live Updates'}</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-blue-400">
            <Zap className="w-4 h-4" />
            <span>{language === 'ne' ? 'सम्पूर्ण खेल तथ्यांक' : 'Full Match Stats & Lineups'}</span>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdFreeBanner;
