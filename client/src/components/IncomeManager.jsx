import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Trash2,
  X,
  PlusCircle,
  IndianRupee,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const IncomeManager = () => {
  const [incomes, setIncomes] = useState([]);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('one-time');
  const [frequency, setFrequency] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState(null);
  const [showMonthlyIncome, setShowMonthlyIncome] = useState(false);

  /* NEW */
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleAmounts, setVisibleAmounts] = useState({});

  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  const fetchIncomes = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/income`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncomes(res.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load incomes.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMonthlyIncome = async () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    try {
      const res = await axios.get(
        `${API_URL}/api/income/monthly?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMonthlyIncome(res.data.totalIncome);
    } catch (err) { }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!amount || !source || !date || !type) {
      setError('Amount, Source, Date, and Type are required.');
      return;
    }

    const incomeData = {
      amount: parseFloat(amount),
      source,
      date,
      type,
      ...(type === 'recurring' && frequency && { frequency }),
    };

    try {
      await axios.post(`${API_URL}/api/income`, incomeData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAmount('');
      setSource('');
      setDate('');
      setType('one-time');
      setFrequency('');
      setMessage('Income added successfully!');
      fetchIncomes();
      fetchMonthlyIncome();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add income.');
    }
  };

  const confirmDelete = (income) => {
    setIncomeToDelete(income);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!incomeToDelete) return;
    try {
      await axios.delete(`${API_URL}/api/income/${incomeToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsModalOpen(false);
      fetchIncomes();
      fetchMonthlyIncome();
    } catch (err) {
      setError('Failed to delete income.');
    }
  };

  useEffect(() => {
    fetchIncomes();
    fetchMonthlyIncome();
  }, [token]);

  /* PAGINATION */
  const totalPages = Math.ceil(incomes.length / ITEMS_PER_PAGE);
  const paginatedIncomes = incomes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleAmountVisibility = (id) => {
    setVisibleAmounts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const inputClass = "p-3 rounded-xl bg-surface text-foreground border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none transition-all duration-200 text-sm placeholder:text-muted-foreground";

  return (
    <div className="bg-background min-h-screen text-foreground p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors duration-200 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-3xl font-bold text-foreground text-center mb-8">
          Manage Your <span className="text-primary">Income</span>
        </h1>

        {/* MONTHLY INCOME */}
        <div className="bg-card p-6 rounded-2xl mb-6 shadow-md border border-border bg-gradient-to-br from-card to-primary/5 relative group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <IndianRupee size={18} className="text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Monthly Income</h2>
          </div>
          <div className="flex items-baseline gap-4">
            <p className="text-4xl font-bold text-primary">
              {showMonthlyIncome ? `₹${monthlyIncome}` : "••••••"}
            </p>
            <button
              onClick={() => setShowMonthlyIncome(!showMonthlyIncome)}
              className="rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-95"
              aria-label="Toggle Monthly Income Visibility"
            >
              {showMonthlyIncome ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* ADD INCOME FORM */}
        <div className="bg-card p-6 rounded-2xl mb-6 shadow-md border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Add New Income</h2>

          {message && (
            <div className="bg-success/10 border border-success/20 text-success p-3 rounded-xl text-sm mb-3">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleAddIncome} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />

            <input
              type="text"
              placeholder="Source (e.g. Salary)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={inputClass}
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />

            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                if (e.target.value === 'one-time') setFrequency('');
              }}
              className={inputClass}
            >
              <option value="one-time">One-time</option>
              <option value="recurring">Recurring</option>
            </select>

            {type === 'recurring' && (
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className={`${inputClass} md:col-span-2`}
              >
                <option value="">Select Frequency</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}

            <button
              type="submit"
              className="md:col-span-2 bg-[#22c55e] text-primary-foreground hover:bg-primary/90 p-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 font-semibold shadow-md active:scale-[0.99]"
            >
              <PlusCircle size={18} /> Add Income
            </button>
          </form>
        </div>

        {/* INCOME LIST */}
        <div className="bg-card p-6 rounded-2xl shadow-md border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">All Income Entries</h2>

          {isLoading ? (
            <p className="text-center text-muted-foreground py-6">Loading...</p>
          ) : (
            <>
              <ul className="space-y-3">
                {paginatedIncomes.map((income) => (
                  <li
                    key={income._id}
                    className="bg-surface p-4 rounded-xl flex justify-between items-center border border-border hover:border-primary/30 transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <IndianRupee size={16} className="text-primary" />
                        <span className="text-lg font-bold text-foreground">
                          {visibleAmounts[income._id] ? income.amount : '•••••'}
                        </span>
                        <button onClick={() => toggleAmountVisibility(income._id)} className="text-muted-foreground hover:text-foreground transition-colors">
                          {visibleAmounts[income._id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        {income.source} • <span className="capitalize">{income.type}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(income.date).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => confirmDelete(income)}
                      className="bg-destructive/10 text-destructive hover:bg-destructive/20 p-2.5 rounded-xl border border-destructive/20 transition-all duration-200 active:scale-95"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${currentPage === i + 1
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-card text-card-foreground p-8 rounded-2xl border border-border shadow-2xl w-full max-w-sm relative text-center animate-scale-in">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Trash2 size={24} className="text-destructive" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Delete Income?</h3>
            <p className="text-muted-foreground text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-muted border border-border px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeManager;
