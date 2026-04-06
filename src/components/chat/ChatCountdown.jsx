import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { apiCall } from '../../lib/api';

export default function ChatCountdown() {
  const [timeLeft, setTimeLeft] = useState('');
  const [targetDateStr, setTargetDateStr] = useState(null);

  useEffect(() => {
    // Fetch the target date from server once
    apiCall('getCountdownDate', {}, false)
      .then(res => {
        if (res && res.targetDate) {
          setTargetDateStr(res.targetDate); // e.g. "2026-12-31T23:59:59"
        }
      })
      .catch((err) => {
        console.error("No countdown date configured:", err);
      });
  }, []);

  useEffect(() => {
    if (!targetDateStr) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetDateStr);
      const diff = target - now;
      
      if (diff <= 0) return 'ถึงเป้าหมายแล้ว!';

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      if (d > 0) {
        return `${d} วัน ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr]);

  if (!targetDateStr) return null;

  return (
    <div className="bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-inner backdrop-blur-sm animate-pulse-slow shrink-0">
      <Timer size={14} />
      {timeLeft}
    </div>
  );
}
