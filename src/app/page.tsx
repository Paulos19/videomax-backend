import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-room-bg text-room-text px-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Logo */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-room-accent flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-2xl">VM</span>
          </div>
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-room-accent to-room-accent-secondary bg-clip-text text-transparent">
              Video Max
            </span>
          </h1>
          <p className="text-room-text-secondary text-sm">
            Assista vídeos sincronizados com seus amigos em salas compartilhadas.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full px-6 py-3 bg-room-accent hover:bg-room-accent/90 rounded-xl shadow-lg shadow-room-accent/20 transition-all font-medium text-white text-sm active:scale-[0.98] text-center"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="w-full px-6 py-3 bg-room-surface hover:bg-room-surface-2 border border-room-border rounded-xl transition-all font-medium text-room-text text-sm text-center"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
