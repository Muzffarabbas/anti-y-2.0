
import React, { useState, useEffect } from 'react';
import { getAIBrief } from '../services/geminiService';

interface BriefAIProps {
  topic: string;
  context?: string;
  isOpenDefault?: boolean;
}

const BriefAI: React.FC<BriefAIProps> = ({ topic, context, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [brief, setBrief] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (topic && isOpen) {
      handleFetchBrief();
    }
  }, [topic, isOpen]);

  const handleFetchBrief = async () => {
    setLoading(true);
    const result = await getAIBrief(topic, context);
    setBrief(result);
    setLoading(false);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'w-80 sm:w-96' : 'w-14'}`}>
      {isOpen ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-4 bg-zinc-800 flex justify-between items-center border-b border-zinc-700">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h3 className="font-bold text-sm tracking-wide text-zinc-100 uppercase">Brief AI</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="p-5 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-400 text-xs animate-pulse">Analyzing topic...</p>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm">
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{brief}</p>
              </div>
            )}
          </div>
          <div className="p-3 bg-zinc-900/50 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest">Powered by FocusStream AI</p>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
        >
          <span className="text-2xl">✨</span>
        </button>
      )}
    </div>
  );
};

export default BriefAI;
