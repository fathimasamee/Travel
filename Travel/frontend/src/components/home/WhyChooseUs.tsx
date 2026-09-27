import React from "react";
import { ShieldCheck, Tag, Compass, Headphones, Award, Sparkles } from "lucide-react";

export const WhyChooseUs = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: "Secure Booking",
      desc: "Bank-grade 256-bit encryption, ATOL financial bonding, and 100% verified luxury operators for complete peace of mind.",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Tag,
      title: "Best Price Guarantee",
      desc: "Direct exclusive partnerships with ultra-luxury properties worldwide guaranteeing best available commercial rates without hidden markups.",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      icon: Compass,
      title: "Expert Local Guides",
      desc: "Certified cultural historians, master naturalists, and seasoned local insiders providing private access beyond standard tourist trails.",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Headphones,
      title: "24/7 Concierge Support",
      desc: "A dedicated personal travel specialist is on standby day and night throughout your journey from departure to safe return.",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest mb-2">
            <Award className="w-3.5 h-3.5" /> Unmatched Excellence
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose TravelSphere
          </h2>
          <p className="mt-3 text-slate-500 text-sm sm:text-base">
            We redefine global travel by harmonizing effortless digital booking with bespoke white-glove hospitality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
