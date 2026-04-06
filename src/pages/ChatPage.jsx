import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiCall } from '../lib/api';
import TypingIndicator from '../components/chat/TypingIndicator';
import ChatCountdown from '../components/chat/ChatCountdown';
import TopBar from '../components/layout/TopBar';

export default function ChatPage() {
  // Time formatter
  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch { return ''; }
  };

  // Safe localStorage save (strip images to save space)
  const saveChatCache = (msgs) => {
    try {
      const lite = msgs.map(m => ({ ...m, image: m.image ? '[img]' : '' }));
      localStorage.setItem('cached_chat_history', JSON.stringify(lite));
    } catch (e) {
      // Quota exceeded - clear old cache and try again
      try {
        localStorage.removeItem('cached_chat_history');
        const lite = msgs.slice(-50).map(m => ({ ...m, image: m.image ? '[img]' : '' }));
        localStorage.setItem('cached_chat_history', JSON.stringify(lite));
      } catch { /* give up silently */ }
    }
  };

  const [messages, setMessages] = useState(() => {
    const cached = localStorage.getItem('cached_chat_history');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [botEnabled, setBotEnabled] = useState(true);
  
  // Pull to refresh state
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 80;
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const hasUserSentMessage = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Auto-save to local cache any time messages change
    if (messages.length > 0) {
      saveChatCache(messages);
    }
  }, [messages, isLoading]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedHistory) {
      loadHistory();
    }
  }, [hasLoadedHistory]);

  const loadHistory = async () => {
    try {
      const res = await apiCall('getChatHistory', {}, false).catch(() => ({ messages: [] }));
      
      // If user hasn't typed anything new while loading, we can safely apply history
      if (!hasUserSentMessage.current) {
        if (res && res.messages && res.messages.length > 0) {
          setMessages(res.messages);
          saveChatCache(res.messages);
        } else if (messages.length === 0) { // Only set default if nothing is cached
          const defaultMsg = [{ id: '1', role: 'bot', content: 'เมี๊ยวว! มีอะไรให้ฉันช่วยไหมเมี้ยว?' }];
          setMessages(defaultMsg);
          saveChatCache(defaultMsg);
        }
      }
      setHasLoadedHistory(true);
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await apiCall('getChatHistory', {}, false);
      if (res && res.messages && res.messages.length > 0) {
        setMessages(res.messages);
        saveChatCache(res.messages);
        toast.success('Chat synced!');
        
        // Check for new messages and notify
        const cached = localStorage.getItem('cached_chat_history');
        const oldCount = cached ? JSON.parse(cached).length : 0;
        if (res.messages.length > oldCount && 'Notification' in window && Notification.permission === 'granted') {
          const lastMsg = res.messages[res.messages.length - 1];
          if (lastMsg.role !== 'user') {
            new Notification('Meow Chat 🐱', { body: lastMsg.content?.substring(0, 80) || 'New message!', icon: '/pwa-192x192.png' });
          }
        }
      } else {
        toast('No new messages', { icon: '💬' });
      }
    } catch (err) {
      toast.error('Failed to sync');
    } finally {
      setIsRefreshing(false);
      setPullProgress(0);
    }
  };

  // Pull to refresh logic
  const handleTouchStart = (e) => {
    if (scrollContainerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].pageY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling.current) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && scrollContainerRef.current.scrollTop <= 0) {
      // Apply resistance
      const progress = Math.min(diff * 0.4, PULL_THRESHOLD + 40);
      setPullProgress(progress);
      
      // Prevent default scrolling when pulling
      if (diff > 10) e.preventDefault();
    } else {
      isPulling.current = false;
      setPullProgress(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    
    if (pullProgress >= PULL_THRESHOLD) {
      handleRefresh();
    } else {
      setPullProgress(0);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear all chat history from this device?')) {
      setMessages([{ id: '1', role: 'bot', content: 'เมี๊ยวว! มีอะไรให้ฉันช่วยไหมเมี้ยว?' }]);
      localStorage.removeItem('cached_chat_history');
      hasUserSentMessage.current = false;
      toast.success('Chat cleared!');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !imageBase64) return;

    const newMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      image: imageBase64,
      timestamp: new Date().toISOString()
    };

    hasUserSentMessage.current = true;
    
    // อัปเดตผังแชททันทีที่กดส่ง!
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    removeImage();
    setIsLoading(true);

    try {
      const res = await apiCall('sendChatMessage', { 
        content: newMessage.content, 
        image: newMessage.image 
      }, false).catch(() => null);

      if (res && res.paused) {
        // Bot is disabled by admin, no auto-reply
        return;
      }

      if (res && res.reply) {
        const botMsg = {
          id: Date.now().toString() + '_bot',
          role: res.role || 'bot',
          content: res.reply,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMsg]);
        
        // Show notification if app not focused
        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Meow Chat 🐱', { body: res.reply.substring(0, 80), icon: '/pwa-192x192.png' });
        }
      } else {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + '_bot',
            role: 'bot',
            content: 'เมี๊ยว... ระบบหลังบ้านกำลังปรับปรุงอยู่ ฝากข้อความไว้ก่อนได้เลยเมี้ยว!'
          }]);
          setIsLoading(false);
        }, 1500);
        return;
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_error',
        role: 'bot',
        content: 'ง่าว แย่แล้ว! การสื่อสารล้มเหลว ลองใหม่อีกครั้งนะ'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <TopBar />

      <div className="flex-1 flex flex-col overflow-hidden px-4 md:px-6 pt-4 pb-32 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="bg-orange-500 rounded-t-3xl p-4 flex items-center justify-between text-white shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl shadow-inner">
              🐱
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Meow Chat</h2>
              <p className="text-orange-100 text-xs">ผู้ช่วยขนปุยของคุณ</p>
            </div>
          </div>
          <ChatCountdown />
          <div className="flex items-center gap-1">
            {/* Manual refresh button removed in favor of pull-to-refresh */}
          </div>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 overflow-y-auto p-4 bg-white border-x border-slate-100 flex flex-col gap-4 relative"
        >
          {/* Pull to refresh indicator */}
          <div 
            className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 pointer-events-none"
            style={{ 
              height: `${pullProgress}px`, 
              opacity: pullProgress / PULL_THRESHOLD,
              transform: `translateY(${pullProgress > PULL_THRESHOLD ? (pullProgress - PULL_THRESHOLD) / 2 : 0}px)` 
            }}
          >
            <div className={`p-2 bg-orange-500 rounded-full shadow-lg text-white transition-transform ${pullProgress >= PULL_THRESHOLD ? 'rotate-180 scale-110' : ''}`}>
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </div>
          </div>
          
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const isAdmin = msg.role === 'admin';
            
            return (
              <div key={msg.id || i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {isAdmin && <span className="text-[10px] uppercase font-bold text-red-500 mb-1 ml-1">Admin</span>}
                
                <div className={`max-w-[85%] rounded-2xl p-3 px-4 shadow-sm ${
                  isUser ? 'bg-orange-500 text-white rounded-tr-sm' : 
                  isAdmin ? 'bg-red-50 text-red-900 border border-red-100 rounded-tl-sm' :
                  'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-sm'
                }`}>
                  {msg.image && (
                    <img src={msg.image} alt="uploaded" className="max-w-full rounded-xl mb-2 border border-black/10 object-cover max-h-64" />
                  )}
                  {msg.content && <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                  {msg.timestamp && (
                    <p className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-white/60' : isAdmin ? 'text-red-300' : 'text-slate-400'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex flex-col items-start">
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview Area */}
        {imageBase64 && (
          <div className="px-4 pt-3 pb-2 bg-white border-x border-slate-100 flex items-end relative shrink-0">
             <div className="relative inline-block">
                <img src={imageBase64} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-slate-200 shadow-sm" />
                <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110 shadow-sm">
                  <X size={14} />
                </button>
             </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 bg-white border-x border-b border-t-0 border-slate-100 rounded-b-3xl shadow-sm shrink-0">
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors flex-shrink-0"
            >
              <ImageIcon size={24} />
            </button>
            
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-3xl flex items-center pr-1.5 overflow-hidden min-h-[50px]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="คุยกับเหมียวสิ..."
                className="w-full bg-transparent border-none outline-none resize-none py-3 px-4 text-[15px] text-slate-700 max-h-32 min-h-[50px]"
                rows="1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
            </div>

            <button 
              type="submit"
              disabled={!input.trim() && !imageBase64}
              className="w-12 h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors shadow-sm disabled:shadow-none"
            >
              <Send size={20} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
