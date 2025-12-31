export function SocialProof() {
  const logos = [
    { src: '/logos/aws.svg', alt: 'Amazon Web Services' },
    { src: '/logos/twilio.svg', alt: 'Twilio' },
    { src: '/logos/deepgram.svg', alt: 'Deepgram' },
    { src: '/logos/openai.svg', alt: 'OpenAI' },
  ];

  const scrollingLogos = [...logos, ...logos, ...logos];

  return (
    <section id="testimonials" className="relative bg-white overflow-hidden">
      {/* Top border */}
      <div className="border-t border-slate-200" />

      <div className="py-16">
        <div className="max-w-6xl mx-auto px-6 mb-10">
          <p className="text-sm text-slate-500 text-center">
            Trusted infrastructure powering Vocal Scale
          </p>
        </div>

        <div className="relative w-full overflow-hidden">
          {/* Edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-white to-transparent z-10" />

          <div className="flex w-max animate-scroll-left gap-32 px-12 items-center">
            {scrollingLogos.map((logo, index) => (
              <img
                key={index}
                src={logo.src}
                alt={logo.alt}
                className="h-12 md:h-14 object-contain"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="border-b border-slate-200" />
    </section>
  );
}
