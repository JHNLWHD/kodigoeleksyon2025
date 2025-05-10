
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Preview from "./pages/Preview";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import CebuCity from "./pages/CebuCity";
import MakatiCity from "./pages/MakatiCity";
import TaguigCity from "./pages/TaguigCity";
import SamalBataan from "./pages/SamalBataan";
import CaintaRizal from "./pages/CaintaRizal";
import TaytayRizal from "./pages/TaytayRizal";
import PasigCity from "./pages/PasigCity";
import National from "./pages/National";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Header from "./components/Header";
import BackToTop from "./components/BackToTop";
import AnalyticsTracker from "./components/analytics/AnalyticsTracker";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { AlertTriangle } from "lucide-react";

const queryClient = new QueryClient();

// Create a layout component that includes the Header and disclaimer
const Layout = ({ children, showAlert = true, cityName }: { children: React.ReactNode, showAlert?: boolean, cityName?: string }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {showAlert && (
        <div className="container mx-auto max-w-6xl px-6 mt-24 mb-2">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-800" />
            <AlertTitle className="text-yellow-800">Important Note</AlertTitle>
            <AlertDescription className="text-yellow-700">
              This tool is currently available for <strong>{cityName || "Zamboanga City"}</strong> only. 
              If you want something similar for your city, please email{' '}
              <a href="mailto:aljhoenilw+kodigoeleksyon2025@gmail.com" className="font-medium underline hover:text-yellow-900">
                aljhoenilw@gmail.com
              </a>
              <br />
              If you only want to see national candidates (Senators and Party List), <Link to="/national" className="font-medium underline hover:text-yellow-900">click here</Link>.
            </AlertDescription>
          </Alert>
        </div>
      )}
      {children}
      <BackToTop />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsTracker />
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/samal-bataan" element={<Layout cityName="Samal, Bataan"><SamalBataan /></Layout>} />
            <Route path="/cebu-city" element={<Layout cityName="Cebu City"><CebuCity /></Layout>} />
            <Route path="/makati-city" element={<Layout cityName="Makati City"><MakatiCity /></Layout>} />
            <Route path="/pasig-city" element={<Layout cityName="Pasig City"><PasigCity /></Layout>} />
            <Route path="/taguig-city" element={<Layout cityName="Taguig City"><TaguigCity /></Layout>} />
            <Route path="/cainta-rizal" element={<Layout cityName="Cainta, Rizal"><CaintaRizal /></Layout>} />
            <Route path="/taytay-rizal" element={<Layout cityName="Taytay, Rizal"><TaytayRizal /></Layout>} />
            <Route path="/national" element={<Layout cityName="National" showAlert={false}><National /></Layout>} />
            <Route path="/preview" element={<Layout showAlert={false}><Preview /></Layout>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
