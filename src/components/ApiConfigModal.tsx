import React, { useState } from 'react';
import { X, Key, Check, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import type { Language } from '../utils/translations';
import { liveEngine } from '../services/liveEngine';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [apiKey, setApiKey] = useState(liveEngine.apiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    liveEngine.apiKey = apiKey;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white transition-colors">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-600 dark:text-red-500" />
            <h3 className="font-extrabold text-lg">
              {language === 'ne' ? 'डेटा स्रोत र सेटिङहरू' : 'Data Engine & Settings'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Engine Info */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">
              {language === 'ne' ? 'रियल-टाइम इन्जिन सक्रिय छ' : 'Real-Time Pulse Engine is Active'}
            </p>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300">
              {language === 'ne'
                ? 'भाकुण्डोले लाइभ खेलहरू, वास्तविक समयमा गोलहरू, कार्डहरू र कमेन्ट्री तुरुन्त देखाउँछ।'
                : 'Bhakundo delivers real-time match events, live ticking match clocks, goal sound alerts, and full match data without any external API friction or rate limits.'}
            </p>
          </div>
        </div>

        {/* Optional External API Key */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {language === 'ne' ? 'वैकल्पिक बाह्य API कुञ्जी (Optional Football-Data.org Key)' : 'Optional Football-Data.org API Key'}
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste football-data.org API key (optional)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'ne'
              ? 'यदि तपाईं आफ्नो बाह्य API प्रयोग गर्न चाहनुहुन्छ भने यहाँ कुञ्जी राख्न सक्नुहुन्छ।'
              : 'You can freely leave this blank! Bhakundo runs in high-fidelity live real-time mode out of the box.'}
          </p>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
            <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigModal;
