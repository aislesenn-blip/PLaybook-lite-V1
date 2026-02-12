import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "I didn't just buy an app. I unlocked Jasmine's voice. She went from whispering to leading the room in just two weeks.",
    author: "Sarah M.",
    role: "Mother of Jasmine (Age 4)",
    tag: "The Classic"
  },
  {
    quote: "Andrew used to hide behind my legs when guests came. Now, he stands tall and introduces himself first. It is not just learning; it is a transformation.",
    author: "David K.",
    role: "Father of Andrew (Age 3)",
    tag: "The Transformation"
  },
  {
    quote: "The 10-minute ritual is magic. Mohammed speaks with a clarity and purpose I have never seen in a toddler. This is the best investment I have made for his future.",
    author: "Fatima A.",
    role: "Mother of Mohammed (Age 5)",
    tag: "The Ritual"
  },
  {
    quote: "Most apps teach children to swipe. Playbook taught my daughter to speak. She is now the most confident child in her playgroup.",
    author: "Jessica L.",
    role: "Mother of Elsie (Age 2)",
    tag: "The Leader"
  },
  {
    quote: "Simple, beautiful, and works completely offline. It feels like having a world-class speech coach in my pocket. My son is ready for the world.",
    author: "James O.",
    role: "Father of Baraka (Age 4)",
    tag: "The Private Tutor"
  }
];

const Testimonials = () => {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-16 text-center text-4xl font-bold tracking-tight text-slate-900">
          Parent Voices
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-6 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-amber-500">★</span>
                ))}
              </div>

              <blockquote className="mb-6 text-lg font-medium leading-relaxed text-slate-700">
                "{t.quote}"
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                  {t.author[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{t.author}</div>
                  <div className="text-sm text-slate-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
