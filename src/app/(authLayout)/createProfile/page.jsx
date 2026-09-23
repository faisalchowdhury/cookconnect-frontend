"use client";

// Change Requirements 06 collapses profile completion into a single screen:
// "After sign-up, redirect the candidate directly to the Edit My Profile page."
//
// This route used to be a second, partial profile form. Keeping both would mean
// two places to complete the same fields, so it now forwards to Edit My Profile.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/editProfile");
  }, [router]);

  return null;
}
