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
      className="text-red-500 hover:text-red-700 font-medium text-xs bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition border border-red-100"
    >
      Remove
    </button>
  );
}