import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Flow
  const [showForgot, setShowForgot] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [timer, setTimer] = useState(0);

  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success && data.data.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data));
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/profile/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OTP sent to your email");
        setStep(2);
        setTimer(600);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Error sending OTP");
    }
  };

  const resetPassword = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/profile/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password reset successful! Please login.");
        setShowForgot(false);
        setStep(1);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Error resetting password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-inter transition-colors duration-300">
      <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up border border-border">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-1">
          {showForgot ? "Reset Password" : "Welcome back"}
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-6">
          {showForgot ? "We'll help you recover your account" : "Sign in to your account"}
        </p>

        {message && (
          <div className="bg-success/10 border border-success/30 text-success p-3 rounded-lg text-sm text-center mb-4">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-lg text-sm text-center mb-4">
            {error}
          </div>
        )}

        {!showForgot ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 mt-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-surface text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute mt-2 left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 border border-input rounded-xl bg-surface text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 mt-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold text-primary-foreground flex justify-center items-center gap-2 transition-all ${loading ? "bg-[#00aaff]/60 cursor-not-allowed" : "bg-[#00aaff] hover:brightness-110 shadow-md hover:shadow-lg"
                }`}
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-input rounded-xl bg-surface text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all duration-200"
                  />
                </div>
                <button
                  onClick={sendOtp}
                  className="w-full bg-[#00aaff] text-primary-foreground py-3 rounded-xl font-semibold hover:brightness-110 shadow-md transition-all"
                >
                  Send OTP
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">OTP Code</label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2.5 border border-input rounded-xl bg-surface text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-input rounded-xl bg-surface text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all duration-200"
                  />
                </div>
                <button
                  onClick={resetPassword}
                  className="w-full bg-success text-white py-3 rounded-xl font-semibold hover:brightness-110 shadow-md transition-all"
                >
                  Reset Password
                </button>
                <p className="text-muted-foreground text-sm text-center">
                  ⏱ Time left: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                </p>
              </>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          {!showForgot ? (
            <button
              className="text-primary text-sm hover:underline transition"
              onClick={() => setShowForgot(true)}
            >
              Forgot Password?
            </button>
          ) : (
            <button
              className="inline-flex items-center gap-1 text-primary text-sm hover:underline transition"
              onClick={() => { setShowForgot(false); setStep(1); }}
            >
              <ArrowLeft size={14} />
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
