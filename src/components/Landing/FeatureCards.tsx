import { motion } from 'framer-motion';
import { useState } from 'react';

const features = [
  {
    title: "The Sponge",
    desc: "Absorb sounds and words naturally.",
    icon: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Changed to a reliable 'child' image
    color: "from-blue-50/80 to-blue-100/20",
    fallbackColor: "bg-blue-100"
  },
  {
    title: "The Echo",
    desc: "Build confidence by repeating.",
    icon: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "from-amber-50/80 to-amber-100/20",
    fallbackColor: "bg-amber-100"
  },
  {
    title: "The Performer",
    desc: "Stand up and lead.",
    icon: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "from-emerald-50/80 to-emerald-100/20",
    fallbackColor: "bg-emerald-100"
  }
];

const FeatureCards = () => {
  return (
    <section className="relative z-10 -mt-32 px-6 pb-20">
      <div className="mx-auto grid max-w-7xl gap-y-6 gap-x-8 md:grid-cols-3">
        {features.map((f, i) => (
          <FeatureCard key={i} f={f} i={i} />
        ))}
      </div>
    </section>
  );
};

const FeatureCard = ({ f, i }: { f: any, i: number }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.2, duration: 0.6 }}
      viewport={{ once: true }}
      className={`group relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent p-8 shadow-xl backdrop-blur-lg transition-all hover:-translate-y-2 hover:shadow-2xl`}
    >
      <div className={`mb-6 h-16 w-16 overflow-hidden rounded-2xl shadow-lg ${f.fallbackColor} flex items-center justify-center`}>
        {!imgError ? (
          <img
            src={f.icon}
            alt={f.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-2xl">✨</div>
        )}
      </div>
      <h3 className="mb-2 text-2xl font-bold text-slate-900">{f.title}</h3>
      <p className="text-slate-600 font-medium">{f.desc}</p>
    </motion.div>
  );
};

export default FeatureCards;
