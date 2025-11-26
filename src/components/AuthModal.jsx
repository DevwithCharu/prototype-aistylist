import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function AuthModal({ open, setOpen }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast.success("Logged in successfully!");
        setOpen(false);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        toast.success("Account created! Check your email.");
        setOpen(false);
      }
    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
          max-w-sm 
          rounded-xl 
          border border-[#D9CBB8]
          bg-[#F8F4EC]
          p-6 shadow-2xl
          text-[#e17730]
        "
      >
        <DialogHeader className="text-center mb-2">
          <DialogTitle className="text-3xl font-bold text-[#e17730]">
            {mode === "login" ? "Login" : "Register"}
          </DialogTitle>

          <DialogDescription className="text-[#7A614F]">
            {mode === "login"
              ? "Access your SmartWardrobe account."
              : "Create a new SmartWardrobe account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            required
            className="
              w-full 
              bg-white 
              border border-[#C5B8A1]
              text-[#e17730]
              placeholder:text-[#9C8F80]
            "
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            required
            className="
              w-full 
              bg-white 
              border border-[#C5B8A1]
              text-[#e17730]
              placeholder:text-[#9C8F80]
            "
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className="
              w-full 
              bg-[#e17730] 
              text-[#F8F4EC]
              hover:bg-[#4A301F]
              transition
            "
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-[#e17730]">
          {mode === "login" ? (
            <p>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("register")}
                className="underline text-[#e17730]"
              >
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="underline text-[#e17730]"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;

