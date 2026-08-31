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
      className="px-5 py-2.5 text-sm font-bold text-red-300 bg-red-950/40 border border-red-900/50 hover:bg-red-900/60 rounded-xl transition shadow-md flex items-center justify-center h-[42px]"
    >
      Delete Member
    </button>
  );
}