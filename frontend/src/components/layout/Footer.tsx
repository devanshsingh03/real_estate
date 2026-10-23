import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

export default function Footer() {
  const { brandName, contactEmail, whatsappNumber } = useConfig();

  return (
    <footer className="border-t border-forest/10 bg-charcoal text-ivory/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-4 lg:px-10">
        <div>
          <p className="font-display text-2xl font-semibold text-ivory">{brandName}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory/60">
            Discover exceptional plots in promising locations. Explore the land, understand the details, and take the next step toward owning your future.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-champagne">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/plots" className="hover:text-ivory">Explore Plots</Link></li>
            <li><Link to="/explorer" className="hover:text-ivory">3D Plot Explorer</Link></li>
            <li><Link to="/locations" className="hover:text-ivory">Locations</Link></li>
            <li><Link to="/list-your-plot" className="hover:text-ivory">List Your Plot</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-champagne">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/about" className="hover:text-ivory">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-ivory">Contact</Link></li>
            <li><Link to="/about#faq" className="hover:text-ivory">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-champagne">Get in touch</h4>
          <ul className="space-y-3 text-sm">
            {contactEmail && (
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-sage" />
                <a href={`mailto:${contactEmail}`} className="hover:text-ivory">{contactEmail}</a>
              </li>
            )}
            {whatsappNumber && (
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-sage" />
                <a href={`tel:+${whatsappNumber}`} className="hover:text-ivory">+{whatsappNumber}</a>
              </li>
            )}
            <li className="flex items-center gap-2">
              <MapPin size={15} className="text-sage" />
              <span>Katni, Madhya Pradesh, India</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10 px-6 py-6 text-center text-xs text-ivory/40">
        © {new Date().getFullYear()} {brandName}. All rights reserved.
      </div>
    </footer>
  );
}
