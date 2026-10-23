import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext';
import { CompareProvider } from './context/CompareContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';

const ExplorePlots = lazy(() => import('./pages/ExplorePlots'));
const PlotDetail = lazy(() => import('./pages/PlotDetail'));
const Explorer3D = lazy(() => import('./pages/Explorer3D'));
const Locations = lazy(() => import('./pages/Locations'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ListYourPlot = lazy(() => import('./pages/ListYourPlot'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const MyEnquiries = lazy(() => import('./pages/MyEnquiries'));
const SavedSearches = lazy(() => import('./pages/SavedSearches'));
const ComparePlots = lazy(() => import('./pages/ComparePlots'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProperties = lazy(() => import('./pages/admin/Properties'));
const AdminPropertyForm = lazy(() => import('./pages/admin/PropertyForm'));
const AdminEnquiries = lazy(() => import('./pages/admin/Enquiries'));
const AdminEnquiryDetail = lazy(() => import('./pages/admin/EnquiryDetail'));
const AdminLocations = lazy(() => import('./pages/admin/Locations'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <AuthProvider>
          <CompareProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/plots" element={<ExplorePlots />} />
                  <Route path="/plots/:slug" element={<PlotDetail />} />
                  <Route path="/compare" element={<ComparePlots />} />
                  <Route path="/explorer" element={<Explorer3D />} />
                  <Route path="/locations" element={<Locations />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/list-your-plot" element={<ListYourPlot />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/account/wishlist" element={<Wishlist />} />
                    <Route path="/account/enquiries" element={<MyEnquiries />} />
                    <Route path="/account/saved-searches" element={<SavedSearches />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/properties" element={<AdminProperties />} />
                    <Route path="/admin/properties/new" element={<AdminPropertyForm />} />
                    <Route path="/admin/properties/:id" element={<AdminPropertyForm />} />
                    <Route path="/admin/enquiries" element={<AdminEnquiries />} />
                    <Route path="/admin/enquiries/:id" element={<AdminEnquiryDetail />} />
                    <Route path="/admin/locations" element={<AdminLocations />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </CompareProvider>
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}
