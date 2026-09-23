"use client";

// /allCooks is the older entry point to the candidate directory. The client's
// change list only describes one candidate search area, so this route now
// forwards to it rather than maintaining a second, diverging copy.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AllCooksPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/jobProfile");
  }, [router]);

  return null;
}
