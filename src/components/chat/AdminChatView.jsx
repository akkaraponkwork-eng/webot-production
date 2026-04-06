import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '../../lib/api';
import { X, Send, Image as ImageIcon } from 'lucide-react';
import TypingIndicator from './TypingIndicator';
import toast from 'react-hot-toast';

export default function AdminChatView({ userEmail, userName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch admin chat history
  const { data: history, isPending } = useQuery({
    queryKey: ['adminChatHistory', userEmail],
    queryFn: async () => {
      const res = await apiCall('adminGetChatHistory', { email: userEmail });
      return res?.messages || [];
    }
  });

  useEffect(() => {
    if (history) {
      setMessages(history);
    }
  }, [history]);

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !imageBase64) return;

    const newMessage = {
      id: Date.now().toString(),
      role: 'admin',
      content: input.trim(),
      image: imageBase64
    };

    // Optimistic UI
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setImageFile(null);
    setImageBase64(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    
    try {
      await apiCall('adminSendReply', { 
        email: userEmail,
        content: newMessage.content,
        image: newMessage.image
      });
    } catch (err) {
      toast.error('Failed to send reply');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="bg-slate-800 p-4 flex items-center justify-between text-white flex-shrink-0">
          <div>
            <h3 className="font-bold">Chat with {userName}</h3>
            <p className="text-sm text-slate-400">{userEmail}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
          {isPending && <div className="text-center text-slate-400 py-4">Loading history...</div>}
          
          {messages.map((msg, i) => {
             const isUser = msg.role === 'user';
             const isBot = msg.role === 'bot';
             const isAdmin = msg.role === 'admin';

             return (
               <div key={msg.id || i} className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
                 <span className={`text-[10px] uppercase font-bold mb-1 mx-1 ${isUser ? 'text-slate-500' : isBot ? 'text-orange-500' : 'text-red-500'}`}>
                   {msg.role}
                 </span>
                 <div className={`max-w-[80%] rounded-2xl p-3 px-4 shadow-sm ${
                   isUser ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm' : 
                   isAdmin ? 'bg-red-50 text-red-900 border border-red-100 rounded-tr-sm' :
                   'bg-orange-100 text-orange-900 border border-orange-200 rounded-tr-sm'
                 }`}>
                   {msg.image && (
                     <img src={msg.image} alt="uploaded" className="max-w-full rounded-xl mb-2 border border-black/10" />
                   )}
                   {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                 </div>
               </div>
             )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview Area */}
        {imageBase64 && (
          <div className="px-4 pt-3 pb-1 bg-white border-t border-slate-100 flex items-end relative">
             <div className="relative inline-block">
                <img src={imageBase64} alt="preview" className="h-16 w-16 object-cover rounded-xl border border-slate-200 shadow-sm" />
                <button 
                  onClick={() => { setImageFile(null); setImageBase64(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} 
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:scale-110 shadow-sm"
                >
                  <X size={12} />
                </button>
             </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100 relative">
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
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
            >
              <ImageIcon size={22} />
            </button>
            
            <div className="flex-1 bg-slate-100 rounded-2xl flex items-center pr-1 overflow-hidden min-h-[44px]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Reply as Admin..."
                className="w-full bg-transparent border-none outline-none resize-none py-2.5 px-3 text-sm text-slate-700 max-h-24 min-h-[44px]"
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
              className="w-11 h-11 bg-red-500 hover:bg-red-600 border-red-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors shadow-sm disabled:shadow-none"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
