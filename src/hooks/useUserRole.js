"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/client";

const supabase = createClient();

export function useUserRole({ requireAdmin = false } = {}) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkRole() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ Failed to get session:", sessionError);
      }

      const user = session?.user;

      console.log("👤 Authenticated user:", user);

      const userId = user?.id;
      if (!userId) {
        console.warn("⚠️ No user ID found in session.");
        if (requireAdmin) router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role, email, fullname")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Error fetching role from profiles:", error);
        if (requireAdmin) router.push("/");
        return;
      }

      console.log("🔐 Fetched user profile:", data);

      if (!data?.role) {
        console.warn("⚠️ User has no role assigned.");
        if (requireAdmin) router.push("/");
        return;
      }

      setRole(data.role);

      if (requireAdmin && data.role !== "admin") {
        console.warn("⛔ Unauthorized access attempt by:", data);
        router.push("/");
      }

      setLoading(false);
    }

    checkRole();
  }, [requireAdmin, router]);

  return { role, loading };
}
