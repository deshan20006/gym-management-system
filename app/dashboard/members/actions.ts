// app/dashboard/members/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Action to create a new member
export async function createMember(formData: FormData) {
  // Extracting data from the form
  const fullName = formData.get("fullName") as string;
  const age = parseInt(formData.get("age") as string);
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const emergencyPhone = formData.get("emergencyPhone") as string;

  // Saving the new member to the PostgreSQL database via Prisma
  await prisma.member.create({
    data: {
      fullName,
      age,
      address,
      phone,
      emergencyPhone,
    },
  });

  // Refresh the members page to show the new data
  revalidatePath("/dashboard/members");
  
  // Redirect back to the members list
  redirect("/dashboard/members");
}