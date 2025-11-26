// src/components/RequireAuth.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";

export default function RequireAuth({ children }) {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!data.user) {
        setAuthOpen(true);
      } else {
        setUser(data.user);
      }
    }
    check();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setAuthOpen(false);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!user) {
    return <AuthModal open={authOpen} setOpen={setAuthOpen} />;
  }

  return children;
}
