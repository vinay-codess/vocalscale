import { Twitter, Linkedin, Github } from 'lucide-react';

export function Footer() {
  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Use Cases', href: '#' },
      { label: 'Integrations', href: '#' },
      { label: 'API', href: '#' }
    ],
    Company: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contact', href: '#' }
    ],
    Legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'GDPR', href: '#' }
    ]
  };

  return (
    <footer className="bg-gradient-to-b from-white to-slate-50/50 border-t border-slate-200 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo-icon1.2.png" alt="Vocal Scale Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Vocal Scale</span>
            </div>
            <p className="text-slate-600 mb-8 max-w-sm leading-relaxed">
              The AI-powered voice solution that helps your business scale without the chaos. Available 24/7, always professional.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-slate-900 mb-5 tracking-tight">{category}</h4>
              <ul className="space-y-3.5">
                {links.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-slate-600 hover:text-slate-900 transition-colors text-[15px]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2025 Vocal Scale. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Status
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Changelog
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
