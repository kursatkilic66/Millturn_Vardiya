"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const aliasker =
      username === process.env.NEXT_PUBLIC_USER1_USERNAME &&
      password === process.env.NEXT_PUBLIC_USER1_PASSWORD;

    const ramazan =
      username === process.env.NEXT_PUBLIC_USER2_USERNAME &&
      password === process.env.NEXT_PUBLIC_USER2_PASSWORD;

    const admin =
      username === process.env.NEXT_PUBLIC_ADMIN_USERNAME &&
      password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (aliasker || ramazan || admin) {
      setError("");

      const days = rememberMe ? 30 : 1;
      const expirationDate = new Date();
      expirationDate.setTime(
        expirationDate.getTime() + days * 24 * 60 * 60 * 1000,
      );

      // Çerezi kaydet ve ana sayfaya yönlendir
      document.cookie = `auth_token=aliasker_logged_in; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
      router.push("/");
    } else {
      setIsLoading(false);
      setError("Kullanıcı adı veya şifre hatalı. Lütfen kontrol ediniz.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 px-4 py-12 relative overflow-hidden selection:bg-slate-700 selection:text-white">
      {/* Arka Plan Kurumsal Işık Efektleri */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-radial from-slate-800/40 via-slate-900/10 to-transparent pointer-events-none blur-3xl" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Kart Yapısı */}
        <div className="bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-xl rounded-2xl p-8 sm:p-10 transition-all">
          {/* Logo ve Başlık */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-4 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 shadow-inner">
              <img
                src="/millturn-logo-transparent.png"
                alt="Millturn Logo"
                className="h-12 w-auto object-contain brightness-110 drop-shadow-md"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Millturn Portal
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Kurumsal Vardiya ve Mesai Yönetim Sistemi
            </p>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-3 text-red-300 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle size={18} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-800/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-slate-200 focus:ring-slate-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <span className="text-xs text-slate-400 font-medium">
                  Beni Hatırla (30 Gün)
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-slate-100/10 transition-all duration-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Kurumsal Alt Dipnot */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={14} className="text-slate-400" />
          <span>Millturn Endüstriyel Üretim Sistemleri © {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}

