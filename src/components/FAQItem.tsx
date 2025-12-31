import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ question, answer, defaultOpen = false }: { question: string, answer: string, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-100 rounded-xl bg-white overflow-hidden mb-3 hover:border-indigo-100 transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors"
      >
        <span className="font-bold text-slate-900 text-[13px]">{question}</span>
        {isOpen ? <Minus size={16} className="text-indigo-600" /> : <Plus size={16} className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-[13px] text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
};

export default FAQItem;