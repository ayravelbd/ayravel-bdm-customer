"use client";

import { redirect } from "next/navigation";

export default function SubcategoryIndexPage() {
  // Redirect to home - old route is deprecated
  redirect("/");
}