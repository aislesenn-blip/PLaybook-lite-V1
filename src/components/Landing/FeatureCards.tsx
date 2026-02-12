import { motion } from 'framer-motion';

const features = [
  {
    title: "The Sponge",
    desc: "Absorb sounds and words naturally.",
    icon: "https://images.unsplash.com/photo-1544367563-12123d8959f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "bg-blue-500/10 border-blue-500/30"
  },
  {
    title: "The Echo",
    desc: "Build confidence by repeating.",
    icon: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "bg-amber-500/10 border-amber-500/30"
  },
  {
    title: "The Performer",
    desc: "Stand up and lead.",
    icon: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    color: "bg-emerald-500/10 border-emerald-500/30"
  }
];

const FeatureCards = () => {
  return (
    <section className="relative z-10 -mt-32 px-6 pb-20">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className={`group relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-lg transition-all hover:-translate-y-2 hover:bg-white/20 hover:shadow-2xl ${f.color}`}
          >
            <div className="mb-6 h-16 w-16 overflow-hidden rounded-2xl shadow-lg">
              <img src={f.icon} alt={f.title} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">{f.title}</h3>
            <p className="text-white/80">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;
