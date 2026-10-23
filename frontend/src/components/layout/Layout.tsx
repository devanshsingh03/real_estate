import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CompareBar from '../property/CompareBar';
import AssistantWidget from '../assistant/AssistantWidget';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <AssistantWidget />
      <CompareBar />
    </div>
  );
}
