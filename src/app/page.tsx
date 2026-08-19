import { auth } from "@/auth";
import { LandingPageClient } from "@/components/landing/landing-page-client";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return <LandingPageClient />;
}

