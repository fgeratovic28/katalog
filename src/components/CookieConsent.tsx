import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center pointer-events-none">
      <div className="bg-slate-900 text-white p-4 md:px-6 md:py-4 rounded-lg shadow-lg max-w-4xl w-full flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 pointer-events-auto animate-in slide-in-from-bottom-2 fade-in duration-500">
        <p className="text-sm text-center sm:text-left leading-relaxed">
          Naš sajt koristi kolačiće kako bi vam pružio najbolje iskustvo. Korišćenjem sajta prihvatate našu politiku privatnosti.
        </p>
        <Button 
          onClick={handleAccept} 
          variant="secondary" 
          className="whitespace-nowrap min-w-[100px] hover:bg-slate-200 transition-colors"
        >
          Prihvatam
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;
