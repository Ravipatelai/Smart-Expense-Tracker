import { ArrowUpRight, ArrowDownLeft, Edit2, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function TransactionsTable({
  transactions,
  onEdit,
  onDelete,
  currentPage,
  totalItems,
  itemsPerPage,
  paginate,
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card shadow-xl rounded-2xl border border-border/50 overflow-hidden animate-fade-in-up-2">
      <div className="px-6 py-5 border-b border-border/50 flex justify-between items-center bg-card/50 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-foreground tracking-tight">Recent Transactions</h2>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          {totalItems} total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20">
              <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Category
              </th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                Amount
              </th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr
                  key={tx._id}
                  className="group hover:bg-muted/30 transition-colors duration-200"
                >
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2 md:gap-4">
                      <div
                        className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl shadow-sm ${tx.type === "income"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                          }`}
                      >
                        {tx.type === "income" ? (
                          <ArrowDownLeft size={16} md:size={18} strokeWidth={2.5} />
                        ) : (
                          <ArrowUpRight size={16} md:size={18} strokeWidth={2.5} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-[11px] md:text-sm truncate max-w-[80px] sm:max-w-[150px] md:max-w-xs">
                          {tx.description || "No Description"}
                        </p>
                        <p className="text-[9px] md:text-xs text-muted-foreground capitalize font-medium mt-0.5">
                          {tx.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg text-[9px] md:text-xs font-medium bg-secondary/50 text-secondary-foreground border border-border/50">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-sm text-muted-foreground tabular-nums font-medium">
                    {new Date(tx.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                    <span className="hidden md:inline">
                      , {new Date(tx.date).getFullYear()}
                    </span>
                  </td>
                  <td
                    className={`px-3 md:px-6 py-3 md:py-4 text-[11px] md:text-sm font-bold text-right tabular-nums tracking-tight ${tx.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground"
                      }`}
                  >
                    {tx.type === "expense" && "-"} {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                    <div className="flex items-center justify-end gap-1 md:gap-2 transition-opacity duration-200">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 md:p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg md:rounded-xl transition-all active:scale-90"
                        title="Edit"
                      >
                        <Edit2 size={14} md:size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        className="p-1.5 md:p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg md:rounded-xl transition-all active:scale-90"
                        title="Delete"
                      >
                        <Trash2 size={14} md:size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4 ring-1 ring-border/50">
                      <Search size={24} />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No transactions found</p>
                    <p className="text-xs mt-1">
                      Try adjusting your filters or add a new transaction.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-muted/10 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium">
            Page <span className="text-foreground">{currentPage}</span> of{" "}
            <span className="text-foreground">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
