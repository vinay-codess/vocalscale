import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

const HelpCategoryCard = ({ icon: Icon, title, description, onClick }: Props) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300 cursor-pointer group"
    >
      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
        <Icon size={22} />
      </div>
      <h3 className="font-black text-slate-900 text-lg mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-[13px] font-medium mb-5 leading-relaxed h-10 line-clamp-2">{description}</p>
      <div className="flex items-center text-indigo-600 text-[13px] font-black group-hover:translate-x-1 transition-transform">
        View Articles <ArrowRight size={14} className="ml-1.5" />
      </div>
    </div>
  );
};

export default HelpCategoryCard;