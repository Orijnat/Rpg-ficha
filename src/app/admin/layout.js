"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout({ children }) {
  const { isMaster, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isMaster)) {
      router.replace(isAuthenticated ? "/" : "/login");
    }
  }, [loading, isAuthenticated, isMaster, router]);

  if (loading || !isAuthenticated || !isMaster) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
