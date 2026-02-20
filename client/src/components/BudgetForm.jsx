import React, { useState } from "react";
import axios from "axios";
import { FiDollarSign, FiCalendar, FiEdit3 } from "react-icons/fi";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const BudgetForm = ({ onBudgetAdded, editingData = null }) => {
  const [category, setCategory] = useState(editingData?.category || "");
  const [amount, setAmount] = useState(editingData?.budget || "");
  const [month, setMonth] = useState(editingData?.month || new Date().getMonth() + 1);
  const [year, setYear] = useState(editingData?.year || new Date().getFullYear());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const url = editingData
        ? `${API_URL}/api/budget/${editingData.id}`
        : `${API_URL}/api/budget`;
      const method = editingData ? "put" : "post";

      const res = await axios[method](
        url,
        { category, amount: Number(amount), month, year },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.success) {
        setMessage(editingData ? "Budget updated successfully!" : "Budget set successfully!");
        onBudgetAdded();
        if (!editingData) {
          setCategory("");
          setAmount("");
        }
      }
    } catch (err) {
      console.error(err);
      setError(editingData ? "Error updating budget." : "Error setting budget.");
    }
  };

  return (
    <div className="w-full">
      {/* Dynamic message and error display */}
      {message && (
        <p className="bg-emerald-500/10 text-emerald-600 p-3 rounded-xl text-sm mb-4 border border-emerald-500/20 font-medium text-center">
          {message}
        </p>
      )}
      {error && (
        <p className="bg-red-500/10 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-500/20 font-medium text-center">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Category
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              <FiEdit3 />
            </div>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="e.g. Food, Travel..."
            />
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Amount
          </label>
          <div className="relative">
            {/* <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              <FiDollarSign />
            </div> */}
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full pl-4 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground font-bold text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="month" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Month
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                <FiCalendar />
              </div>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
              >
                {months.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="year" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Year
            </label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="YYYY"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#40c79a] text-primary-foreground py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover shadow-lg hover:shadow-primary/20 transition-all transform active:scale-[0.98] mt-2"
        >
          {editingData ? "Update Budget" : "Save Budget"}
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;
