import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = [
  "#2563eb", // Royal Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
];

function ExpenseChart({ transactions }) {
  const data = {};

  transactions
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      data[tx.category] = (data[tx.category] || 0) + tx.amount;
    });

  const chartData = Object.keys(data).map((key) => ({
    name: key,
    value: data[key],
  }));

  return (
    <div className="bg-card p-6 md:p-8 rounded-2xl shadow-xl border border-border/50 mb-8 animate-fade-in-up">
      <h2 className="text-lg font-bold text-foreground mb-6 text-center tracking-tight">
        Expense Breakdown
      </h2>

      {chartData.length ? (
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                stroke="none"
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: "13px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "8px 12px",
                }}
                itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Custom Scrollable Legend */}
          <div className="mt-4 w-full max-h-40 overflow-y-auto px-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {chartData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground truncate font-medium">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-bold text-foreground ml-auto">
                    ₹{item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center ring-1 ring-border/50">
            <span className="text-2xl grayscale opacity-50">📊</span>
          </div>
          <p className="text-sm font-medium">No expense data to visualize</p>
        </div>
      )}
    </div>
  );
}

export default ExpenseChart;
