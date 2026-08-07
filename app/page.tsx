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
      setIsAuthorized(true);
    } else {
      router.replace("/login");
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 font-medium">Yükleniyor...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  // Orijinal dashboard arayüzü yüklenir
  return <Dashboard />;
}
