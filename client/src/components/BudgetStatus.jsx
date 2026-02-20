import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Wallet, CreditCard, TrendingDown, ArrowRight, ArrowLeft, PieChart, Edit2, Trash2 } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const API_URL = import.meta.env.VITE_BACKEND_URL;

const BudgetSummaryCard = ({ title, amount, icon: Icon, color, bg }) => (
  <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-foreground tracking-tight">₹{new Intl.NumberFormat("en-IN").format(amount)}</h4>
      </div>
      <div className={`p-3 rounded-xl ${bg} text-${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const BudgetProgressCard = ({ s, onEdit, onDelete, month, year }) => {
  const percent = s.budget ? (s.spent / s.budget) * 100 : 0;
  let progressColor = "bg-primary";
  let statusText = "On Track";
  let statusColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

  if (percent >= 100) {
    progressColor = "bg-destructive";
    statusText = "Over Budget";
    statusColor = "bg-destructive/10 text-destructive border-destructive/20";
  } else if (percent >= 80) {
    progressColor = "bg-orange-500";
    statusText = "Close to Limit";
    statusColor = "bg-orange-500/10 text-orange-600 border-orange-500/20";
  } else {
    progressColor = "bg-emerald-500";
  }

  return (
    <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group relative">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg shadow-inner">
            {s.category.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong className="text-base font-bold text-foreground block">{s.category}</strong>
            <p className="text-xs text-muted-foreground">Budget: ₹{s.budget}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit({ ...s, month, year })}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title="Edit Budget"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(s)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
            title="Delete Budget"
          >
            <Trash2 size={14} />
          </button>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${statusColor}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-semibold text-foreground">₹{s.spent} <span className="text-muted-foreground font-normal text-xs">spent</span></span>
        <span className="text-xs text-muted-foreground font-medium">{Math.min(percent, 100).toFixed(0)}%</span>
      </div>

      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
};


const BudgetStatus = ({ month, year, refresh, onEdit, onDelete }) => {
  const [status, setStatus] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination state and constants
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const fetchStatus = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API_URL}/api/budget/status?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setStatus(Array.isArray(res.data.data) ? res.data.data : [res.data.data]);
        setCurrentPage(1);
      }
    } catch (err) { console.error(err); setError("Error fetching budget status."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStatus(); }, [month, year, refresh]);

  // Pagination controls
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = status.slice(startIndex, startIndex + itemsPerPage);

  const totalBudget = useMemo(() => status.reduce((acc, curr) => acc + curr.budget, 0), [status]);
  const totalSpent = useMemo(() => status.reduce((acc, curr) => acc + curr.spent, 0), [status]);
  const remainingBudget = totalBudget - totalSpent;

  const chartData = {
    labels: status.map((s) => s.category),
    datasets: [{
      label: "Budget",
      data: status.map((s) => s.budget),
      backgroundColor: status.map((s) => {
        const percent = s.budget ? (s.spent / s.budget) * 100 : 0;
        return percent >= 100 ? "rgba(239, 68, 68, 0.8)" : percent >= 80 ? "rgba(249, 115, 22, 0.8)" : "rgba(16, 185, 129, 0.8)";
      }),
      borderColor: "transparent",
      borderWidth: 0,
      hoverOffset: 10,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "rgb(148, 163, 184)", font: { family: "Inter", size: 11 }, usePointStyle: true, padding: 20 } },
      title: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
      }
    },
    cutout: "75%",
  };

  return (
    <div className="w-full animate-fade-in-up-1">
      {/* Month & Year Selectors are handled in parent page, using props here */}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
          <div className="w-12 h-12 bg-muted rounded-full mb-4"></div>
          <p>Loading budget data...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-center border border-destructive/20">{error}</div>
      ) : status.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/50 border-dashed">
          <Wallet size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground">No budget set for this month</h3>
          <p className="text-muted-foreground text-sm mt-1">Add a budget to start tracking your expenses.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary and Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BudgetSummaryCard title="Total Budget" amount={totalBudget} icon={Wallet} color="primary" bg="bg-primary/10" />
              <BudgetSummaryCard title="Total Spent" amount={totalSpent} icon={CreditCard} color="orange-500" bg="bg-orange-500/10" />
              <BudgetSummaryCard title="Remaining" amount={remainingBudget} icon={TrendingDown} color="emerald-500" bg="bg-emerald-500/10" />

              {/* Detailed Percentage Breakdown - mini stats */}
              <div className="col-span-1 sm:col-span-3 bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Usage</p>
                  <h4 className="text-xl font-bold text-foreground mt-1">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%</h4>
                </div>
                <div className="w-2/3 h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${totalSpent > totalBudget ? "bg-destructive" : "bg-primary"}`} style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center relative min-h-[300px]">
              <h3 className="text-sm font-bold text-muted-foreground absolute top-6 left-6 flex items-center gap-2"><PieChart size={16} /> Allocation</h3>
              <div className="w-full h-64 mt-4">
                <Doughnut data={chartData} options={options} />
              </div>
            </div>
          </div>

          <div className="border-t border-border/50"></div>

          {/* Detailed Breakdown Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground tracking-tight">Category Breakdown</h3>
              <div className="text-sm text-muted-foreground">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, status.length)} of {status.length}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedItems.map((s, idx) => (
                <BudgetProgressCard
                  key={idx + startIndex}
                  s={s}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  month={month}
                  year={year}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {status.length > itemsPerPage && (
              <div className="flex justify-center mt-8 gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-card border border-border rounded-xl text-foreground disabled:opacity-50 hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => (p * itemsPerPage < status.length ? p + 1 : p))}
                  disabled={currentPage * itemsPerPage >= status.length}
                  className="px-4 py-2 bg-card border border-border rounded-xl text-foreground disabled:opacity-50 hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetStatus;
