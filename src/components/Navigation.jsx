import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Shirt,
  Sparkles,
  MessageCircle,
  ShoppingBag,
  Info,
  LogIn,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { path: "/recommendations", label: "Outfit Suggestions", icon: Sparkles },
  { path: "/chatbot", label: "Style Assistant", icon: MessageCircle },
  { path: "/shopping", label: "What to Buy", icon: ShoppingBag },
  { path: "/about", label: "About", icon: Info },
];

function Navigation() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <>
      {/* Auth Modal */}
      <AuthModal open={authOpen} setOpen={setAuthOpen} />

      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Shirt className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SmartWardrobe</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth",
                      "hover:bg-secondary/80",
                      isActive &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {/* Login / Logout */}
              {!user ? (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary/70 transition"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="text-sm font-medium">Login</span>
                </button>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground mr-2">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary/70 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-2">
              {!user ? (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="p-2 rounded-lg hover:bg-secondary/80 transition"
                >
                  <LogIn className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-secondary/80 transition"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              )}

              {navItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "p-2 rounded-lg transition-smooth",
                      "hover:bg-secondary/80",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navigation;
