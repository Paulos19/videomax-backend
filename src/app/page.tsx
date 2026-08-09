import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 space-y-8 px-4">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
        Video-Max
      </h1>
      
      {session ? (
        <div className="text-center space-y-4 p-8 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-2xl">
          <p className="text-zinc-400">Autenticado como: <span className="text-white font-medium">{session.user?.email}</span></p>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="w-full px-4 py-2 bg-red-600/90 hover:bg-red-600 rounded-lg shadow-md transition-colors font-medium">
              Sair (Logout)
            </button>
          </form>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors font-medium">
            Entrar
          </Link>
          <Link href="/register" className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors font-medium">
            Cadastrar
          </Link>
        </div>
      )}
    </div>
  );
}
