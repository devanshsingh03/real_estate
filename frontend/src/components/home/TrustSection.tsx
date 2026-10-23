import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileCheck, MapPinned, HeartHandshake, Users } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';

const pillars = [
  { icon: FileCheck, title: 'Transparent Information', desc: 'Every listing shows verified status, dimensions, and documentation clearly — no hidden details.' },
  { icon: MapPinned, title: 'Guided Site Visits', desc: 'Schedule a visit and walk the plot in person before you decide, with someone from our team alongside you.' },
  { icon: HeartHandshake, title: 'Responsive Assistance', desc: 'Our team responds to enquiries promptly and follows up until your questions are fully answered.' },
  { icon: Users, title: 'Documentation Support', desc: 'We help you understand the paperwork involved in a land purchase, step by step.' },
];

const faqs = [
  { q: 'How do I know a listing is verified?', a: 'Listings marked "Verified" have had their documentation and plot boundaries checked by our team. Unverified listings are clearly shown as such — we never claim verification that hasn\'t taken place.' },
  { q: 'Can I visit a plot before enquiring?', a: 'Yes. Use the "Schedule a Site Visit" option on any plot page or the contact page, and our team will arrange a convenient time.' },
  { q: 'What documents will I receive with a plot?', a: 'Documentation varies by listing and is shown on the plot\'s detail page only where it has been supplied and verified by the seller.' },
  { q: 'Is my enquiry information kept private?', a: 'Yes. We only collect what\'s needed to respond to your enquiry, and it is never shared publicly or with third parties.' },
];

export default function TrustSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">Our Approach</p>
            <h2 className="font-display text-4xl font-semibold text-forest sm:text-5xl">Built on Transparency</h2>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-forest/10 bg-white p-5"
              >
                <p.icon size={22} className="text-sage" />
                <h3 className="mt-3 font-display text-lg font-semibold text-forest">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal/60">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-forest/10 pt-8">
            <div>
              <AnimatedCounter value={24} suffix="+" />
              <p className="mt-1 text-sm text-charcoal/60">Active Plots</p>
            </div>
            <div>
              <AnimatedCounter value={5} />
              <p className="mt-1 text-sm text-charcoal/60">Locations</p>
            </div>
            <div>
              <AnimatedCounter value={3} />
              <p className="mt-1 text-sm text-charcoal/60">Property Types</p>
            </div>
          </div>
        </div>

        <div id="faq">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">FAQs</p>
          <h2 className="mb-8 font-display text-4xl font-semibold text-forest sm:text-5xl">Questions, Answered</h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="rounded-xl border border-forest/10 bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-ring"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-medium text-charcoal">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-forest transition-transform duration-250 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed text-charcoal/60">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
