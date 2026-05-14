"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/logo.webp" 
              alt="Gol Pe Cash" 
              className="w-32 h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white mt-2">
            Gol Pe <span className="text-primary">Cash</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Secure Gold Purchase Portal</p>
        </div>

        <div className="premium-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                placeholder="admin@goldpecash.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 flex items-center justify-center text-lg shadow-xl shadow-gold-500/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-primary hover:underline font-bold">
              Forgot password?
            </a>
          </div>
        </div>
        
        <p className="text-center text-slate-600 dark:text-slate-500 text-xs mt-8 font-medium">
          &copy; {new Date().getFullYear()} Gol Pe Cash. All rights reserved.
        </p>
      </div>
    </div>
  );
}
