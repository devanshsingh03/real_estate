import { Mail, Phone, MapPin } from 'lucide-react';
import EnquiryForm from '../components/property/EnquiryForm';
import MapEmbed from '../components/ui/MapEmbed';
import { useConfig } from '../context/ConfigContext';

export default function Contact() {
  const { contactEmail, whatsappNumber } = useConfig();

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 lg:px-10">
      <div className="mb-12 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">Get in Touch</p>
        <h1 className="font-display text-4xl font-semibold text-forest sm:text-5xl">Contact Us</h1>
        <p className="mt-3 text-charcoal/60">Have a question about a plot, or want to schedule a visit? Reach out and we'll get back to you.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          {contactEmail && (
            <div className="flex items-start gap-4 rounded-2xl border border-forest/10 bg-white p-5">
              <Mail className="text-sage" />
              <div>
                <p className="font-medium text-forest">Email</p>
                <a href={`mailto:${contactEmail}`} className="text-sm text-charcoal/60 hover:text-forest">{contactEmail}</a>
              </div>
            </div>
          )}
          {whatsappNumber && (
            <div className="flex items-start gap-4 rounded-2xl border border-forest/10 bg-white p-5">
              <Phone className="text-sage" />
              <div>
                <p className="font-medium text-forest">Phone / WhatsApp</p>
                <a href={`tel:+${whatsappNumber}`} className="text-sm text-charcoal/60 hover:text-forest">+{whatsappNumber}</a>
              </div>
            </div>
          )}
          <div className="flex items-start gap-4 rounded-2xl border border-forest/10 bg-white p-5">
            <MapPin className="text-sage" />
            <div>
              <p className="font-medium text-forest">Office</p>
              <p className="text-sm text-charcoal/60">Katni, Madhya Pradesh, India</p>
            </div>
          </div>
          <MapEmbed address="Katni, Madhya Pradesh, India" label="Office location" zoom={11} className="aspect-[4/3]" />
        </div>

        <div className="rounded-2xl border border-forest/10 bg-white p-6">
          <EnquiryForm type="contact" title="Send Us a Message" />
        </div>
      </div>
    </div>
  );
}
