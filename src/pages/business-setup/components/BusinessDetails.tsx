import React from 'react';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { Building2, Mail, Phone, MapPin, Zap } from 'lucide-react';

// --- Reusable Styled Components (Editorial/Neubrutalist Aesthetic) ---

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props} 
    className={`
      w-full px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 text-sm font-medium rounded-lg
      focus:ring-0 focus:border-slate-800 focus:bg-slate-50
      transition-all duration-200 placeholder:text-slate-400
      ${props.className || ''}
    `}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select 
    {...props} 
    className={`
      w-full px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 text-sm font-medium rounded-lg
      focus:ring-0 focus:border-slate-800 focus:bg-slate-50
      transition-all duration-200 cursor-pointer appearance-none
      ${props.className || ''}
    `}
  />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    {...props} 
    className={`
      w-full px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 text-sm font-medium rounded-lg
      focus:ring-0 focus:border-slate-800 focus:bg-slate-50
      transition-all duration-200 placeholder:text-slate-400 resize-none
      ${props.className || ''}
    `}
  />
);

const Label = ({ children, optional }: { children: React.ReactNode, optional?: boolean }) => (
  <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
    {children}
    {optional && <span className="ml-2 font-normal text-slate-400 text-[10px]">(Optional)</span>}
  </label>
);

// --- Main Component ---

export const BusinessDetails: React.FC = () => {
  const { state, actions } = useBusinessSetup();
  const { data } = state;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    const fieldMap: { [key: string]: string } = {
      businessName: 'business_name',
      industry: 'category',
      address: 'address',
      phone: 'phone',
      email: 'email'
    };
    
    const fieldName = fieldMap[name];
    if (fieldName) {
      actions.updateBusiness({ [fieldName]: value });
    }
  };

  return (
    <div className="max-w-2xl font-sans">
      
      <div className="space-y-8">
        
        {/* Business Name Section */}
        <div className="group">
          <Label>Company Name</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <Building2 size={18} />
            </div>
            <Input
              type="text"
              name="businessName"
              value={data.business.business_name}
              onChange={handleChange}
              placeholder="e.g. Nexus Automations"
              className="pl-10"
            />
          </div>
        </div>

        {/* Industry Section */}
        <div className="group">
          <Label>Industry Vertical</Label>
          <div className="relative">
            <Select
              name="industry"
              value={data.business.category}
              onChange={handleChange}
              className="pl-4 pr-10" 
            >
              <option value="" disabled>Select your domain...</option>
              <option value="saas">Software & SaaS</option>
              <option value="agency">Agency & Consulting</option>
              <option value="healthcare">Healthcare & Telehealth</option>
              <option value="realestate">Real Estate</option>
              <option value="legal">Legal Services</option>
              <option value="retail">E-Commerce & Retail</option>
              <option value="hospitality">Hospitality & Travel</option>
              <option value="automotive">Automotive</option>
              <option value="other">Other</option>
            </Select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Phone */}
          <div className="group">
            <Label>Support Line</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Phone size={18} />
              </div>
              <Input
                type="tel"
                name="phone"
                value={data.business.phone}
                onChange={handleChange}
                placeholder="(555) 000-0000"
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Email */}
          <div className="group">
            <Label>Email Contact</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Mail size={18} />
              </div>
              <Input
                type="email"
                name="email"
                value={data.business.email || ''}
                onChange={handleChange}
                placeholder="hello@company.com"
                className="pl-10"
              />
            </div>
          </div>

        </div>

        {/* Address */}
        <div className="group">
          <Label optional>Physical Address</Label>
          <div className="relative">
             <div className="absolute top-3 left-3 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <MapPin size={18} />
            </div>
            <TextArea
              name="address"
              rows={2}
              value={data.business.address}
              onChange={handleChange}
              placeholder="123 Tech Blvd, San Francisco, CA 94107"
              className="pl-10"
            />
          </div>
          <p className="mt-2 text-xs text-slate-400 font-mono">
            Determines regional voice accent settings.
          </p>
        </div>

        {/* Configuration Tip */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex gap-4 text-slate-300 shadow-lg">
          <div className="p-2 bg-slate-800 rounded-lg text-slate-100 shrink-0">
             <Zap size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Next Step</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Customizing the AI personality and knowledge base happens in the upcoming configuration stages.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BusinessDetails;