export default function UpiPayButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-purple-600 text-white p-5 py-3.5 rounded-2xl shadow-lg
                 hover:bg-purple-700 transition hover:scale-105"
      title="Pay & Track (UPI)"
    >
      ₹
    </button>
  );
}
