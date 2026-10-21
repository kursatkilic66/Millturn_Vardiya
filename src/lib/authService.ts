import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from "firebase/auth";
import { auth } from "@/src/lib/firebase";

/** Firebase hata kodunu kullanıcıya gösterilecek Türkçe mesaja çevirir. */
export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "E-posta veya şifre hatalı. Lütfen kontrol ediniz.";
    case "auth/too-many-requests":
      return "Çok fazla hatalı deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.";
    case "auth/network-request-failed":
      return "Bağlantı hatası. İnternet bağlantınızı kontrol edin.";
    case "auth/user-disabled":
      return "Bu hesap devre dışı bırakılmış.";
    default:
      return "Giriş yapılamadı. Lütfen tekrar deneyin.";
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<void> {
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence,
  );
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export function logout(): Promise<void> {
  return signOut(auth);
}

/** Oturum değişimini dinler. Dönen fonksiyon aboneliği iptal eder. */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
