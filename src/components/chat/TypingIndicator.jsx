import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 p-3 px-4 bg-slate-100 rounded-2xl rounded-tl-sm w-fit shadow-xs">
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
    </div>
  );
}
