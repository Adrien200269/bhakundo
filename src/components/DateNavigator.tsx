import React, { useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, RefreshCw, Radio, Clock } from 'lucide-react';
import { getOneMonthDateRange, getMonthRangeBounds, getKathmanduMidnight } from '../utils/dateRange';
import type { Language } from '../utils/translations';
import { soundEffects } from '../utils/soundEffects';

interface DateNavigatorProps {
  selectedDate: string; // ISO format 'YYYY-MM-DD'
  onSelectDate: (dateIso: string) => void;
  language: Language;
  isLiveFeedConnected?: boolean;
  lastUpdatedTime?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  totalMatchesCount?: number;
  liveMatchesCount?: number;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onSelectDate,
  language,
  isLiveFeedConnected = true,
  lastUpdatedTime = 'Just now',
  isRefreshing = false,
  onRefresh,
  totalMatchesCount,
  liveMatchesCount = 0,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  const days = useMemo(() => {
    return getOneMonthDateRange(language);
  }, [language]);

  const { minIso, maxIso, todayIso } = useMemo(() => {
    return getMonthRangeBounds();
  }, []);

  const isTodaySelected = selectedDate === todayIso;

  // Auto-scroll selected date into view smoothly
  useEffect(() => {
    if (selectedItemRef.current && scrollContainerRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedDate]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Find Saturday of current week for "This Weekend" jump
  const thisWeekendIso = useMemo(() => {
    const today = getKathmanduMidnight();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    const sat = new Date(today);
    sat.setDate(today.getDate() + daysUntilSaturday);
    const y = sat.getFullYear();
    const m = String(sat.getMonth() + 1).padStart(2, '0');
    const d = String(sat.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-3 sm:p-4 space-y-3 transition-colors">
      
      {/* 1. Header Bar: Month Range Info & Live Auto-Update Status */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        
        {/* Title & Date Window Info */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-[#DC143C] dark:text-[#ff385c]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {language === 'ne' ? '१ महिनाको खेल तालिका' : '1-Month Match Schedule'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {language === 'ne' ? '-१ हप्ता ➔ +३ हप्ता' : '-1 Week ➔ +3 Weeks'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/50 text-[#DC143C] dark:text-[#ff385c] border border-red-200 dark:border-red-900/40 inline-flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                <span>Kathmandu Time (NPT UTC+5:45)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'ne'
                ? 'विगतका नतिजा र आगामी फिक्सचरहरू (काठमाडौँ समय)'
                : 'Full archive of past results & upcoming fixtures in Kathmandu Time (NPT)'}
            </p>
          </div>
        </div>

        {/* Live Auto-Sync Status & Refresh Trigger */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-600/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">
              {isLiveFeedConnected ? (language === 'ne' ? 'प्रत्यक्ष अद्यावधिक' : 'Live Syncing') : 'Offline'}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80">
              ({lastUpdatedTime})
            </span>
          </div>

          {onRefresh && (
            <button
              onClick={() => {
                onRefresh();
                soundEffects.playClick();
              }}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title={language === 'ne' ? 'डेटा ताजा गर्नुहोस्' : 'Refresh match data now'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
            </button>
          )}

          {/* Native HTML5 Calendar Picker Shortcut */}
          <label className="relative p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5" />
            <input
              type="date"
              min={minIso}
              max={maxIso}
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  onSelectDate(e.target.value);
                  soundEffects.playClick();
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title={language === 'ne' ? 'क्यालेन्डरबाट छान्नुहोस्' : 'Pick from calendar'}
            />
          </label>
        </div>
      </div>

      {/* 2. Quick Jump Preset Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
        <button
          onClick={() => {
            onSelectDate(days[0].iso);
            soundEffects.playClick();
          }}
          className={`shrink-0 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            selectedDate === days[0].iso
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {language === 'ne' ? '१ हप्ता अघि (-७)' : '◀ 1 Wk Ago'}
        </button>

        <button
          onClick={() => {
            const yesterdayItem = days.find((d) => d.offsetDays === -1);
            if (yesterdayItem) {
              onSelectDate(yesterdayItem.iso);
              soundEffects.playClick();
            }
          }}
          className={`shrink-0 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            selectedDate === days.find((d) => d.offsetDays === -1)?.iso
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {language === 'ne' ? 'हिजो' : 'Yesterday'}
        </button>

        <button
          onClick={() => {
            onSelectDate(todayIso);
            soundEffects.playClick();
          }}
          className={`shrink-0 px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            isTodaySelected
              ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
              : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 hover:bg-red-100'
          }`}
        >
          <Radio className="w-3 h-3 animate-pulse" />
          <span>{language === 'ne' ? 'आज (Today)' : 'Today (Live)'}</span>
          {liveMatchesCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-white animate-ping" />
          )}
        </button>

        <button
          onClick={() => {
            const tomorrowItem = days.find((d) => d.offsetDays === 1);
            if (tomorrowItem) {
              onSelectDate(tomorrowItem.iso);
              soundEffects.playClick();
            }
          }}
          className={`shrink-0 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            selectedDate === days.find((d) => d.offsetDays === 1)?.iso
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {language === 'ne' ? 'भोलि' : 'Tomorrow'}
        </button>

        <button
          onClick={() => {
            onSelectDate(thisWeekendIso);
            soundEffects.playClick();
          }}
          className={`shrink-0 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            selectedDate === thisWeekendIso
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {language === 'ne' ? 'यो सप्ताहन्त' : 'This Weekend'}
        </button>

        <button
          onClick={() => {
            const nextWeekItem = days.find((d) => d.offsetDays === 7);
            if (nextWeekItem) {
              onSelectDate(nextWeekItem.iso);
              soundEffects.playClick();
            }
          }}
          className={`shrink-0 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            selectedDate === days.find((d) => d.offsetDays === 7)?.iso
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {language === 'ne' ? 'अर्को हप्ता (+७)' : 'Next Week (+7d)'}
        </button>

        <button
          onClick={() => {
            const threeWeeksItem = days.find((d) => d.offsetDays === 21);
            if (threeWeeksItem) {
              onSelectDate(threeWeeksItem.iso);
              soundEffects.playClick();
            }
          }}
          className={`shrink-0 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            selectedDate === days.find((d) => d.offsetDays === 21)?.iso
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {language === 'ne' ? '३ हप्ता पछि (+२१)' : '+3 Weeks Ahead'}
        </button>
      </div>

      {/* 3. Horizontal Scrollable 29-Day Ribbon */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          aria-label="Scroll dates left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1.5"
        >
          {days.map((item) => {
            const isSelected = item.iso === selectedDate;
            const isToday = item.isToday;

            return (
              <button
                key={item.iso}
                ref={isSelected ? selectedItemRef : undefined}
                onClick={() => {
                  onSelectDate(item.iso);
                  soundEffects.playClick();
                }}
                className={`shrink-0 flex flex-col items-center justify-center w-15 sm:w-16 h-18 sm:h-19 rounded-2xl transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/35 scale-102 ring-2 ring-red-500/50'
                    : isToday
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800/80 hover:bg-red-100/70'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {/* Status indicator dot / tag */}
                {isToday && (
                  <span
                    className={`absolute -top-1 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isSelected
                        ? 'bg-white text-red-600'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {language === 'ne' ? 'आज' : 'Live'}
                  </span>
                )}

                {item.offsetDays === -7 && (
                  <span className="absolute -top-1 px-1 py-0.2 rounded-full text-[8px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    -7d
                  </span>
                )}

                {item.offsetDays === 21 && (
                  <span className="absolute -top-1 px-1 py-0.2 rounded-full text-[8px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    +21d
                  </span>
                )}

                {/* Day of Week */}
                <span
                  className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'text-white/90'
                      : isToday
                      ? 'text-red-600 dark:text-red-400 font-extrabold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.dayName}
                </span>

                {/* Date Number */}
                <span
                  className={`text-base sm:text-lg font-black leading-tight ${
                    isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {item.dayNumber}
                </span>

                {/* Month Name */}
                <span
                  className={`text-[9px] sm:text-[10px] font-medium leading-none ${
                    isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {item.monthName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          aria-label="Scroll dates right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Active Date Summary Line */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {language === 'ne' ? 'छानिएको मिति: ' : 'Viewing: '}
          </span>
          <span className="font-black text-slate-900 dark:text-white">
            {days.find((d) => d.iso === selectedDate)?.dayName},{' '}
            {days.find((d) => d.iso === selectedDate)?.dayNumber}{' '}
            {days.find((d) => d.iso === selectedDate)?.monthName}{' '}
            {selectedDate.split('-')[0]}
          </span>
          {isTodaySelected && (
            <span className="ml-2 text-red-600 dark:text-red-400 font-bold">
              ({language === 'ne' ? 'आजका खेलहरू' : "Today's Games"})
            </span>
          )}
        </div>

        {totalMatchesCount !== undefined && (
          <div className="font-bold text-slate-600 dark:text-slate-400">
            {totalMatchesCount}{' '}
            {language === 'ne'
              ? 'खेलहरू फेला परे'
              : totalMatchesCount === 1
              ? 'Match'
              : 'Matches'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateNavigator;
