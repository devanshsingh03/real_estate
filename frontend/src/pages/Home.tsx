import Hero from '../components/home/Hero';
import FeaturedPlots from '../components/home/FeaturedPlots';
import LocationsSection from '../components/home/LocationsSection';
import TrustSection from '../components/home/TrustSection';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedPlots />
      <LocationsSection />
      <TrustSection />
    </>
  );
}
