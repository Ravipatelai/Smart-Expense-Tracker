import { Link } from "react-router-dom";
import { PlusCircle, Wallet, GripVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import UpiPayButton from "../payments/UpiPayButton";

export default function FloatingActions({ onUpiPay }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    // Only drag if clicking the container or the grip, not the buttons/links directly
    // but the user asked to make the "entire div" movable.
    // To allow links to work, we'll track movement.
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    // Optional: Add boundaries here if needed
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50 bg-[#7d7d7dab] p-2 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 transition-shadow active:shadow-primary/20"
    >
      {/* Hande for better UX */}
      <div className="flex justify-center pb-1 border-b border-white/10 mb-1 opacity-50">
        <GripVertical size={16} className="text-white rotate-90" />
      </div>

      {/* UPI Pay */}
      <div onPointerDown={(e) => e.stopPropagation()}>
        <UpiPayButton onClick={onUpiPay} />
      </div>

      {/* Add Income */}
      <Link
        to="/manage-income"
        onPointerDown={(e) => e.stopPropagation()} // Allow clicking the link without dragging
        className="group relative bg-success text-white p-3.5 rounded-2xl shadow-lg hover:shadow-xl
                   transition-all duration-300 hover:scale-105
                   focus:outline-none focus:ring-4 focus:ring-success/30
                   flex items-center justify-center"
        title="Add Income"
      >
        <PlusCircle size={22} />
      </Link>

      {/* Add Expense */}
      <Link
        to="/manage-expense"
        onPointerDown={(e) => e.stopPropagation()} // Allow clicking the link without dragging
        className="group relative bg-destructive text-white p-3.5 rounded-2xl shadow-lg hover:shadow-xl
                   transition-all duration-300 hover:scale-105
                   focus:outline-none focus:ring-4 focus:ring-destructive/30
                   flex items-center justify-center"
        title="Add Expense"
      >
        <Wallet size={22} />
      </Link>
    </div>
  );
}
