import { useEffect, useState } from "react";
import axios from "axios";

export default function useUpiPayment(API_URL, token, onSuccess) {
  const [pendingExpense, setPendingExpense] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // 1️⃣ Create pending expense
  const initiatePayment = async (payload) => {
    const res = await axios.post(
      `${API_URL}/api/expenses/upi/initiate`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setPendingExpense(res.data.data.expenseId);
  };

  // 2️⃣ User confirmation after comeback
  const confirmPayment = async (status) => {
    await axios.patch(
      `${API_URL}/api/expenses/upi/confirm/${pendingExpense}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setPendingExpense(null);
    setShowConfirm(false);
    onSuccess?.();
  };

  // 3️⃣ Detect return from UPI app
  useEffect(() => {
    const onFocus = () => {
      if (pendingExpense) setShowConfirm(true);
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [pendingExpense]);

  return {
    initiatePayment,
    confirmPayment,
    showConfirm,
  };
}
