import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Wardrobe from "./pages/Wardrobe";
import OutfitRecommendation from "./pages/OutfitRecommendation";
import Chatbot from "./pages/Chatbot";
import Shopping from "./pages/Shopping";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import RequireAuth from "@/components/RequireAuth";  // <-- ADD THIS

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Navigation />

        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Home />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/wardrobe"
            element={
              
                <Wardrobe />
              
            }
          />

          <Route
            path="/recommendations"
            element={
              
                <OutfitRecommendation />
              
            }
          />

          <Route
            path="/chatbot"
            element={
              
                <Chatbot />
              
            }
          />

          <Route
            path="/shopping"
            element={
             
                <Shopping />
              
            }
          />

          {/* Public pages */}
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

