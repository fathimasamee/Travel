import React from "react";
import { Star, Quote } from "lucide-react";

export const Testimonials = () => {
  const reviews = [
    {
      name: "Victoria & David Sterling",
      role: "Global Travelers, New York",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      tour: "Swiss Alps & Glacier Express Grand Expedition",
      comment:
        "The level of thought and seamless execution by TravelSphere was unprecedented. From our private champagne transfer in Zurich to Excellence Class on the Glacier Express, we did not have to lift a finger. Truly five-star luxury.",
    },
    {
      name: "Lord Julian Vance",
      role: "Architect, London",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      tour: "Ultimate Bali Heavenly Escape",
      comment:
        "Our honeymoon in Bali exceeded our wildest imaginations. The private catamaran to Nusa Penida and dinner overlooking Uluwatu's cliffs during the sunset Kecak dance was ethereal. We are already booking our next trip.",
    },
    {
      name: "Elena Rostova",
      role: "Venture Partner, Geneva",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      tour: "Santorini Sunsets & Private Aegean Romance",
      comment:
        "Every single detail was dialed to absolute perfection. Our suite with a private plunge pool in Oia was out of a magazine. TravelSphere's concierge answered all our special requests within five minutes.",
    },
  ];

  return (
    <section className="py-24 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
            Client Accolades
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Loved By Discerning Travelers
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Read authentic words from travelers who trust TravelSphere with their most cherished milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="bg-slate-800/80 rounded-2xl p-8 border border-slate-700/80 shadow-xl flex flex-col justify-between hover:border-slate-600 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  {r.tour}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed italic mb-8">
                  "{r.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-700">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{r.name}</h4>
                  <p className="text-xs text-slate-400">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
