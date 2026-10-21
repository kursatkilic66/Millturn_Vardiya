"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/src/components/dashboard";
import { subscribeToAuth } from "@/src/lib/authService";

export default function Page() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Firebase Auth oturumunu dinle (sahte çerez kontrolü kaldırıldı)
    const unsubscribe = subscribeToAuth((user) => {
      if (user) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.replace("/login");
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 p-2.5 flex items-center justify-center mb-4 shadow-xl">
          <img
            src="/millturn-logo-transparent.png"
            alt="Millturn"
            className="w-full h-full object-contain brightness-110 animate-pulse"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Oturum Doğrulanıyor...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <Dashboard />;
}
