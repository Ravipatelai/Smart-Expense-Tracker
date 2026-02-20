import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt } from "lucide-react";

// helper to get today in YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const AddExpense = () => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayDate()); // ✅ AUTO TODAY
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const handleAddExpense = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/api/expenses`,
        { type: "expense", category, amount, date, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("Expense added successfully!");
      setError("");
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(getTodayDate()); // ✅ reset back to today
    } catch (err) {
      setError(err.response?.data?.message || "Error adding expense");
      setMessage("");
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-surface text-foreground border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none transition-all duration-200 text-sm placeholder:text-muted-foreground";

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground transition-colors duration-300 p-4">
      <div className="bg-card p-8 rounded-2xl shadow-md border border-border w-full max-w-md">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Receipt size={16} className="text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Add Expense</h2>
          </div>
        </div>

        {message && (
          <div className="bg-success/10 border border-success/20 text-success p-3 rounded-xl text-sm text-center mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm text-center mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="e.g. Food, Transport"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional note"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#ef4444] text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 active:scale-[0.99] transition-all duration-200 shadow-md mt-2"
          >
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
