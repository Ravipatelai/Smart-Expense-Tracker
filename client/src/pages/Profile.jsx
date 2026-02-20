import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { User, Mail, Lock, LogOut, ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Profile() {
  const [newEmail, setNewEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // OTP Flow
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const currentEmail = user?.email;

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isStrongPassword = (password) => password.length >= 6;
  const isValidOtp = (code) => /^\d{6}$/.test(code.trim());

  const handleEmailChange = async () => {
    setMessage(""); setError("");
    if (!isValidEmail(newEmail)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/profile/change-email`, { newEmail }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  const handlePasswordChange = async () => {
    setMessage(""); setError("");
    if (!oldPassword) { setError("Please enter your old password."); return; }
    if (!isStrongPassword(newPassword)) { setError("New password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/profile/change-password`, { oldPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  const sendOtp = async () => {
    setMessage(""); setError(""); setLoading(true);
    try {
      await axios.post(`${API_URL}/api/profile/forgot-password`, { email: currentEmail });
      setMessage("OTP sent to your email");
      setOtpSent(true);
      setTimer(600);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending OTP");
    } finally { setLoading(false); }
  };

  const resetPasswordWithOtp = async () => {
    setMessage(""); setError("");
    if (!isValidOtp(otp)) { setError("Please enter a valid 6-digit OTP."); return; }
    if (!isStrongPassword(newPassword)) { setError("New password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/profile/reset-password`, { email: currentEmail, otp, newPassword });
      setMessage("Password reset successful");
      setOtpMode(false); setOtpSent(false); setOtp(""); setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const inputClass = "w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm";

  return (
    <div className="min-h-screen bg-background text-foreground font-inter section-padding">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 mt-[10vh]">

        <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
          <div className="bg-primary/5 p-6 border-b border-border/50 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3 ring-4 ring-background shadow-sm">
              <User size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Profile Settings</h2>
            {currentEmail && (
              <div className="flex items-center gap-1.5 mt-1 bg-background/50 px-3 py-1 rounded-full border border-border/50 shadow-sm">
                <Mail size={12} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{currentEmail}</p>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            {/* Messages */}
            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-xl text-sm flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 size={18} />
                {message}
              </div>
            )}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {!otpMode && (
              <>
                {/* Change Email */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={18} className="text-primary" />
                    <h3 className="font-bold text-foreground">Update Email</h3>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      placeholder="New Email Address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>

                  <button
                    onClick={handleEmailChange}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all transform active:scale-[0.98] shadow-lg ${!isValidEmail(newEmail) || loading
                      ? "bg-[#00cc0e66] text-muted-foreground cursor-not-allowed"
                      : "bg-[#00cc0e66] text-primary-foreground hover:bg-primary-hover hover:shadow-primary/25"
                      }`}
                    disabled={!isValidEmail(newEmail) || loading}
                  >
                    {loading ? "Updating..." : "Update Email"}
                  </button>
                </div>

                <div className="border-t border-border/50 mb-8"></div>
              </>
            )}

            {/* Change Password */}
            {!otpMode ? (
              <div className="space-y-4 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound size={18} className="text-primary" />
                  <h3 className="font-bold text-foreground">Change Password</h3>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      placeholder="New Password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all transform active:scale-[0.98] shadow-lg ${(!oldPassword || !isStrongPassword(newPassword) || loading)
                    ? "bg-[#00aaff78] text-muted-foreground cursor-not-allowed"
                    : "bg-[#00aaff78] text-primary-foreground hover:bg-primary-hover hover:shadow-primary/25"
                    }`}
                  disabled={!oldPassword || !isStrongPassword(newPassword) || loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>

                <div className="text-center pt-2">
                  <button
                    onClick={() => { setOtpMode(true); setMessage(""); setError(""); }}
                    className="text-primary hover:text-primary-hover text-sm font-semibold hover:underline transition-colors"
                    disabled={loading}
                  >
                    Forgot current password?
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound size={18} className="text-primary" />
                  <h3 className="font-bold text-foreground">Reset Password</h3>
                </div>

                {!otpSent ? (
                  <>
                    <div className="bg-muted/30 p-4 rounded-xl text-center mb-2 border border-border/50">
                      <p className="text-muted-foreground text-sm">
                        We'll send a verification code to <span className="font-bold text-foreground block mt-1">{currentEmail}</span>
                      </p>
                    </div>

                    <button
                      onClick={sendOtp}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all transform active:scale-[0.98] shadow-lg ${loading ? "bg-[#00aaff78] text-muted-foreground cursor-not-allowed" : "bg-[#00aaff78] text-primary-foreground hover:bg-primary-hover hover:shadow-primary/25"}`}
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Verification Code"}
                    </button>

                    <div className="text-center">
                      <button
                        onClick={() => { setOtpMode(false); setMessage(""); setError(""); setOtpSent(false); setOtp(""); }}
                        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                          <ShieldCheck size={16} />
                        </div>
                        <input
                          type="text"
                          placeholder="Enter 6-digit Code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className={inputClass}
                          disabled={loading}
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                          <Lock size={16} />
                        </div>
                        <input
                          type="password"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={inputClass}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <button
                      onClick={resetPasswordWithOtp}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all transform active:scale-[0.98] shadow-lg ${!/^\d{6}$/.test(otp) || !isStrongPassword(newPassword) || loading
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-primary/25"
                        }`}
                      disabled={!/^\d{6}$/.test(otp) || !isStrongPassword(newPassword) || loading}
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>

                    <p className="text-muted-foreground text-xs text-center font-medium">
                      Code expires in: <span className="text-foreground">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</span>
                    </p>
                  </>
                )}
              </div>
            )}

            {!otpMode && (
              <>
                <div className="border-t border-border/50 my-8"></div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-destructive border border-destructive/20 py-3 rounded-xl hover:bg-destructive hover:text-white transition-all duration-300 font-bold active:scale-[0.98] flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 mb-4">
          &copy; {new Date().getFullYear()} Ravikant Kumar. Secure & Encrypted.
        </p>

      </div>
    </div>
  );
}
