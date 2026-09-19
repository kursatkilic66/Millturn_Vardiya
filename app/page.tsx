"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Dashboard bileşenini doğru yoldan çekiyoruz
import Dashboard from "@/src/components/dashboard";

export default function Page() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Çerezlerde auth_token var mı kontrol et
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("auth_token="),
    );
    const tokenValue = authCookie ? authCookie.split("=")[1] : null;

    if (tokenValue === "aliasker_logged_in") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthorized(true);
    } else {
      router.replace("/login");
    }
    setIsLoading(false);
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

  // Orijinal dashboard arayüzü yüklenir
  return <Dashboard />;
}
