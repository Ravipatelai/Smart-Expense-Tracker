import { X, Edit3, Calendar, IndianRupee, FileText, Tag } from "lucide-react";
import { useState, useEffect } from "react";

export default function EditTransactionModal({
  transaction,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (transaction) {
      setForm(transaction);
    }
  }, [transaction]);

  if (!form) return null;

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleClose = () => {
    setForm(null);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    handleClose();
  };

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl bg-background text-foreground border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-200 text-sm placeholder:text-muted-foreground";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-card p-8 rounded-2xl shadow-2xl border border-border/50 w-full max-w-lg relative animate-scale-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-full transition-all duration-200"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-border/50 pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <Edit3 size={20} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Edit Transaction
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                  <Calendar size={16} />
                </div>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                  <IndianRupee size={16} />
                </div>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => handleChange("amount", Number(e.target.value))}
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>


          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                <FileText size={16} />
              </div>
              <input
                type="text"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={inputClass}
                placeholder="Enter description"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                <Tag size={16} />
              </div>
              <input
                type="text"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className={inputClass}
                placeholder="Enter category"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-muted border border-border transition-all duration-200 font-semibold text-sm active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary-hover transition-all duration-200 font-bold text-sm shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
