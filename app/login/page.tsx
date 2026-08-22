"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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
      setError("Hatalı kullanıcı adı veya şifre!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Millturn Vardiya Girişi
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-black"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-900"
            >
              Beni Hatırla (30 Gün)
            </label>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-slate-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-800 transition duration-200"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
