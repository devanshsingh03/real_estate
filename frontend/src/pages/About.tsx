import { motion } from 'framer-motion';
import TrustSection from '../components/home/TrustSection';
import { useConfig } from '../context/ConfigContext';

export default function About() {
  const { brandName } = useConfig();

  return (
    <div>
      <section className="bg-forest px-6 pb-16 pt-32 text-ivory lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-champagne">
            About Us
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl font-semibold sm:text-5xl"
          >
            Helping you find ground you can build a future on
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-5 max-w-2xl text-ivory/70"
          >
            {brandName} connects buyers with verified, well-documented plots across promising locations.
            We believe the process of buying land should be clear, well-informed, and free of surprises.
          </motion.p>
        </div>
      </section>

      <TrustSection />
    </div>
  );
}
