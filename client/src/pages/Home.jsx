import React from "react";
import { Link } from "react-router-dom";
import { Users, DollarSign, Lock, Sparkles } from "lucide-react";

function Home() {
  const features = [
    {
      icon: Users,
      title: "Group Expense Split",
      desc: "Easily split bills and settle debts with friends or colleagues.",
    },
    {
      icon: DollarSign,
      title: "Custom Budgets",
      desc: "Set spending limits for categories and let the app intelligently guide your finances.",
    },
    {
      icon: Lock,
      title: "Secure & Private",
      desc: "Your data is encrypted with industry-leading security. Privacy is our top priority.",
    },
    {
      icon: Sparkles,
      title: "AI Budget Tips",
      desc: "Get AI-powered suggestions to optimize your monthly spending and save more.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16 md:py-24 font-inter bg-background text-foreground transition-colors duration-300">

      {/* Hero */}
      <div className="text-center max-w-3xl mb-16 md:mb-20">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-fade-in-up-1">
          <Sparkles size={14} />
          Smart Expense Tracker
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 leading-tight animate-fade-in-up-2">
          Take Control of
          <span className="text-primary"> Your Money</span>
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in-up-3">
          Track spending, manage budgets, and achieve financial freedom — all in one beautiful dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl shadow-lg
                       hover:shadow-xl hover:brightness-110 transition-all duration-300
                       focus:outline-none focus:ring-4 focus:ring-ring/30"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-secondary text-secondary-foreground font-semibold px-8 py-3.5 rounded-xl border border-border
                       hover:bg-muted transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full text-center px-4">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            className={`group bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border
                        hover:shadow-lg hover:border-primary/30 transition-all duration-300
                        hover:-translate-y-1 animate-fade-in-up-${i + 3}`}
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Icon size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
