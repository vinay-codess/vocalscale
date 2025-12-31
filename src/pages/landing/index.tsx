import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SocialProof } from './components/SocialProof';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { 
  SiTwilio, 
  SiOpenai,
  SiGooglecloud,
  SiAmazon 
} from 'react-icons/si';

export function PoweredBy() {
  const integrations = [
    { name: 'Twilio', icon: SiTwilio },
    { name: 'Deepgram', icon: null }, // Use image or text
    { name: 'OpenAI', icon: SiOpenai },
    { name: 'Google Cloud', icon: SiGooglecloud },
    { name: 'AWS', icon: SiAmazon },
  ];

  return (
    <section className="py-16 px-6 border-t border-slate-100">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-slate-500 mb-8">
          Powered by industry-leading technology
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-10">
          {integrations.map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              <span className="font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <PoweredBy />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
