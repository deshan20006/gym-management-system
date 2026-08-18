// app/dashboard/members/[id]/DeleteButton.tsx
"use client";

export default function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        // Confirmation message in English
        if (!window.confirm("Are you sure you want to delete this member? All associated payment history will also be permanently deleted!")) {
          e.preventDefault(); // Cancels the deletion if 'Cancel' is clicked
        }
      }}
      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 font-medium transition text-sm border border-red-100"
    >
      Delete Member
    </button>
  );
}