import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(data.message || "Registration successful!");
        setFormData({ name: "", email: "", password: "" });

        if (data.data?.token) {
          localStorage.setItem("token", data.data.token);
        }
      } else {
        setError(data.message || "Something went wrong during registration.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-inter transition-colors duration-300">
      <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up border border-border">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-1">
          Create Account
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Start tracking your expenses today
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute mt-2 left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-surface text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute mt-2 left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-surface text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute mt-2 left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
                className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-surface text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00aaff] text-primary-foreground py-3 rounded-xl font-semibold
                       hover:brightness-110 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
