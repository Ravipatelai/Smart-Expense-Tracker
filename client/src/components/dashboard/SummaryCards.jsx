import { Link } from "react-router-dom";
import { Plus, Eye, EyeOff, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useState } from "react";

export default function SummaryCards({ totalIncome, totalExpense }) {
  const balance = totalIncome - totalExpense;

  const [showAmounts, setShowAmount] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showTotalAmount, setShowTotalAmount] = useState(false);

  // Toggle handlers
  const toggleVisibility = () => setShowAmount((prev) => !prev);
  const toggleVisibilityExpense = () => setShowExpense((prev) => !prev);
  const toggleVisibilityTotalAmount = () => setShowTotalAmount((prev) => !prev);

  // Reusable Card Component
  const Card = ({
    title,
    amount,
    isVisible,
    onToggle,
    icon: Icon,
    iconColor,
    iconBg,
    amountColor,
    actionLink,
    actionLabel,
    actionColor = "bg-primary hover:bg-primary-hover shadow-primary/25", // Default
    gradient,
    ring,
  }) => (
    <div
      className={`relative overflow-hidden bg-card p-6 rounded-2xl border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group ${gradient} ${ring}`}
    >
      {gradient && <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 pointer-events-none" />}

      <div className="flex items-center justify-between mb-5 relative z-10">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {title}
        </h3>
        <div className={`p-3 rounded-2xl ${iconBg} bg-opacity-10 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-6 relative z-10">
        <span className={`text-2xl md:text-3xl font-bold tracking-tight ${amountColor}`}>
          {isVisible ? `₹ ${amount?.toLocaleString("en-IN")}` : "••••••"}
        </span>
        <button
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 active:scale-95"
          aria-label="Toggle visibility"
        >
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {actionLink && (
        <Link
          to={actionLink}
          className={`relative z-10 inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl md:w-auto w-full justify-center ${actionColor}`}
        >
          <Plus size={14} strokeWidth={3} />
          {actionLabel}
        </Link>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 md:mb-12 animate-fade-in-up">
      {/* Income */}
      <Card
        title="Total Income"
        amount={totalIncome}
        isVisible={showAmounts}
        onToggle={toggleVisibility}
        icon={TrendingUp}
        iconColor="text-emerald-600 dark:text-emerald-400"
        iconBg="bg-emerald-500/10"
        amountColor="text-emerald-600 dark:text-emerald-400"
        actionLink="/manage-income"
        actionLabel="Add Income"
        actionColor="bg-success hover:bg-success-hover shadow-success/25"
      />

      {/* Expense */}
      <Card
        title="Total Expenses"
        amount={totalExpense}
        isVisible={showExpense}
        onToggle={toggleVisibilityExpense}
        icon={TrendingDown}
        iconColor="text-red-600 dark:text-red-400"
        iconBg="bg-red-500/10"
        amountColor="text-red-600 dark:text-red-400"
        actionLink="/manage-expense"
        actionLabel="Add Expense"
        actionColor="bg-destructive hover:bg-destructive-hover shadow-destructive/25"
      />

      {/* Balance */}
      <Card
        title="Net Balance"
        amount={balance}
        isVisible={showTotalAmount}
        onToggle={toggleVisibilityTotalAmount}
        icon={Wallet}
        iconColor="text-blue-600 dark:text-blue-400"
        iconBg="bg-blue-500/10"
        amountColor="text-foreground"
        gradient="bg-gradient-to-br from-card via-card to-blue-50/50 dark:to-blue-900/10"
        ring="ring-1 ring-blue-500/20"
      />
    </div>
  );
}
