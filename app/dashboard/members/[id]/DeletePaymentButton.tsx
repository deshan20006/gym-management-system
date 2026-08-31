// app/dashboard/members/[id]/DeletePaymentButton.tsx
"use client";

export default function DeletePaymentButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        // Confirmation popup for deleting a payment
        if (!window.confirm("Are you sure you want to delete this payment record?")) {
          e.preventDefault(); // Stop form submission if user clicks 'Cancel'
        }
      }}
      className="text-red-300 hover:text-red-200 font-bold text-xs bg-red-950/40 hover:bg-red-900/60 px-3 py-1.5 rounded-lg transition border border-red-900/50 shadow-sm"
    >
      Remove
    </button>
  );
}