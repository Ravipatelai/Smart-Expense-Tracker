import { Filter, Calendar, Search, RotateCcw } from "lucide-react";

export default function FiltersBar({
  categories,
  selectedCategory,
  setSelectedCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchTerm,
  setSearchTerm,
  onReset,
}) {
  const inputClass =
    "w-full px-3 sm:px-4 py-2.5 text-sm bg-background text-foreground rounded-xl border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-200 placeholder:text-muted-foreground shadow-sm";

  const labelClass =
    "block text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5";

  return (
    <div className="bg-card p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-border/50 mb-8 animate-fade-in-up-1">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Category */}
        <div className="space-y-1">
          <label className={labelClass}>
            <Filter size={14} /> Category
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="">All Categories</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <label className={labelClass}>
            <Calendar size={14} /> Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            onClick={(e) => e.target.showPicker?.()}
            className={`${inputClass} cursor-pointer`}
          />
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <label className={labelClass}>
            <Calendar size={14} /> End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onClick={(e) => e.target.showPicker?.()}
            className={`${inputClass} cursor-pointer`}
          />
        </div>

        {/* Search */}
        <div className="space-y-1">
          <label className={labelClass}>
            <Search size={14} /> Search
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="    Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-10`}
            />
            <Search
              size={16}
              className="absolute left-3 mt-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Reset Actions */}
      <div className="mt-6 flex justify-end border-t border-border/50 pt-4">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted/50 rounded-xl transition-all border border-transparent hover:border-border active:scale-95"
        >
          <RotateCcw size={16} />
          Reset Filters
        </button>
      </div>
    </div>
  );
}
