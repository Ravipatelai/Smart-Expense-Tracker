import React, { useState } from "react";
import BudgetForm from "../components/BudgetForm";
import BudgetStatus from "../components/BudgetStatus";
import Navbar from "../components/Navbar";
import axios from "axios";
import DeleteConfirmModal from "../components/dashboard/DeleteConfirmModal";
import { Sparkles, PlusCircle, X } from "lucide-react";

const BudgetPage = () => {
  const [refresh, setRefresh] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const confirmDeleteBudget = async () => {
    if (!budgetToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/budget/${budgetToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRefresh(!refresh);
      setShowDeleteModal(false);
      setBudgetToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete budget.");
    }
  };

  const handleDeleteClick = (budget) => {
    setBudgetToDelete(budget);
    setShowDeleteModal(true);
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const closeFormModal = () => {
    setShowModal(false);
    setEditingBudget(null);
  };
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const year = new Date().getFullYear();

  // Parses AI suggestion text into JSX with headings, lists, and highlights
  const parseSuggestions = (text) => {
    if (!text) return null;
    const cleanText = text.replace(/\*/g, "");
    const lines = cleanText.split("\n").filter(line => line.trim() !== "");
    const elements = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("###")) {
        elements.push(<h3 key={key++} className="text-lg font-bold text-primary mt-4 mb-2">{line.replace(/^###\s*/, "")}</h3>);
        continue;
      }
      if (/^\d+\./.test(line)) {
        const items = [];
        while (i < lines.length && /^\d+\./.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+\.\s*/, ""));
          i++;
        }
        i--;
        elements.push(
          <ol key={key++} className="list-decimal list-inside mb-4 text-muted-foreground space-y-1.5 pl-2">
            {items.map((item, idx) => <li key={idx} className="text-sm leading-relaxed">{item}</li>)}
          </ol>
        );
        continue;
      }
      if (/^- /.test(line)) {
        const items = [];
        while (i < lines.length && /^- /.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^- /, ""));
          i++;
        }
        i--;
        elements.push(
          <ul key={key++} className="list-disc list-inside mb-4 text-muted-foreground space-y-1.5 pl-2">
            {items.map((item, idx) => <li key={idx} className="text-sm leading-relaxed">{item}</li>)}
          </ul>
        );
        continue;
      }
      let formattedLine = line.replace(/(Overspending|Action|Budget|Spent|unused|critical issue)/gi,
        (match) => `<span class="font-bold text-orange-500">${match}</span>`
      );
      elements.push(<p key={key++} className="text-muted-foreground mb-2 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />);
    }
    return elements;
  };

  const fetchSuggestion = async () => {
    setSuggestions(null); setError(null); setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");
      const res = await fetch(`${API_URL}/api/budget/suggestion?month=${month}&year=${year}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setSuggestions(data);
    } catch (err) { console.error("Error fetching suggestion:", err); setError("Failed to fetch suggestions. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-inter section-padding">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-[10vh]">

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Budget <span className="text-primary">Management</span></h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2">Track spending and stay on top of your financial goals.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#47b1e294] text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-hover shadow-lg hover:shadow-primary/25 transition-all transform active:scale-95"
            >
              <PlusCircle size={18} strokeWidth={2.5} /> Add Budget
            </button>
            <button
              onClick={fetchSuggestion} disabled={loading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/20 font-semibold text-sm shadow-sm transition-all transform active:scale-95 ${loading ? "bg-emerald-500/10 text-emerald-600 cursor-wait" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                }`}
            >
              <Sparkles size={18} /> {loading ? "Analyzing..." : "AI Insights"}
            </button>
          </div>
        </div>

        {/* AI Suggestions Panel */}
        {(loading || error || suggestions) && (
          <div className="mb-8 animate-fade-in-up">
            <div className="bg-card/50 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-sm">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Sparkles className="text-emerald-500 animate-pulse mb-3" size={32} />
                  <p className="text-foreground font-medium">Analyzing your spending patterns...</p>
                  <p className="text-xs text-muted-foreground mt-1">This uses Google Gemini to provide personalized tips.</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium border border-destructive/20 text-center">
                  {error}
                </div>
              ) : suggestions?.data?.suggestion ? (
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                    <Sparkles size={20} className="text-emerald-500" fill="currentColor" fillOpacity={0.2} />
                    AI Financial Insights
                  </h3>
                  <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
                    {parseSuggestions(suggestions.data.suggestion.content || suggestions.data.suggestion)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <BudgetStatus
          month={month}
          year={year}
          refresh={refresh}
          onEdit={openEditModal}
          onDelete={handleDeleteClick}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border/50 animate-scale-in overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-muted/10 flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {editingBudget ? "Edit Monthly Budget" : "Set Monthly Budget"}
              </h2>
              <button onClick={closeFormModal} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <BudgetForm
                editingData={editingBudget}
                onBudgetAdded={() => {
                  setRefresh(!refresh);
                  closeFormModal();
                }}
              />
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <DeleteConfirmModal
          open={showDeleteModal}
          title="Delete Budget?"
          description="Are you sure you want to delete this budget category tracking? This won't delete your expenses."
          itemDetails={{
            title: budgetToDelete?.category,
            subtitle: "Monthly Budget",
            value: `₹ ${budgetToDelete?.budget}`
          }}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteBudget}
        />
      )}
    </div>
  );
};

export default BudgetPage;
