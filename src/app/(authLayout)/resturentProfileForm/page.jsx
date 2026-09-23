"use client";

// Where employer sign-up lands. Same reasoning as createProfile: the employer
// profile is edited in one place, so this forwards to the real editor rather
// than duplicating the establishment fields.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompleteEmployerProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/editOwnerProfile");
  }, [router]);

  return null;
}
