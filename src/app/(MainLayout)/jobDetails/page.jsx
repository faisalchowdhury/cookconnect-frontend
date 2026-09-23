"use client";

// Legacy offer-detail route. The real detail page is /allJobs/[id], which the
// cards and search results all link to; nothing links here any more.
//
// The old version embedded a Jodit rich-text editor for job description,
// requirements and benefits. Change Requirements 08 replaced requirements and
// benefits with checkbox groups, so the editor had no purpose left and the
// dependency was dropped along with it.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JobDetailsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/allJobs");
  }, [router]);

  return null;
}
