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
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50/60 via-slate-100/80 to-rose-50/50 dark:from-slate-900 dark:via-[#0e1626] dark:to-slate-900 border-b border-slate-200/90 dark:border-slate-800/80 px-4 py-3 sm:py-3.5 transition-colors">
      {/* Background glow in dark mode */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-red-500/10 dark:bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        
        {/* Left side info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">
                {language === 'ne' ? '१००% विज्ञापन-रहित शुद्ध फुटबल अनुभव' : '100% Ad-Free Football Experience'}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-300">
                <NepaliFlag size="sm" className="w-3 h-3.5" />
                <span>नेपाल</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {language === 'ne'
                ? 'कुनै जुवा वा क्यासिनोको विज्ञापन छैन। कुनै कष्टकर पप-अप छैन। केवल रियल-टाइम स्कोर र सम्पूर्ण डेटा।'
                : 'Zero betting banners. Zero video popups. Zero trackers. Just lightning-fast live scores & in-depth match data.'}
            </p>
          </div>
        </div>

        {/* Right side highlights */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0 self-end sm:self-center">
          <div className="hidden lg:flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'ne' ? 'वास्तविक समय' : 'Instant Live Updates'}</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
            <Zap className="w-4 h-4" />
            <span>{language === 'ne' ? 'सम्पूर्ण खेल तथ्यांक' : 'Full Match Stats & Lineups'}</span>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
