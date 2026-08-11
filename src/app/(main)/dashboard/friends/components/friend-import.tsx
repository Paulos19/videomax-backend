'use client'

import { Globe, Gamepad2, Disc as DiscordIcon } from 'lucide-react'

export function FriendImport() {
  return (
    <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl p-4 space-y-3">
      <div>
        <h3 className="text-[#F5F5F5] font-bold text-sm">Importar amigos</h3>
        <p className="text-[11px] text-[#8A8A8A] mt-0.5">Conecte suas contas para encontrar amigos</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex-1 py-2.5 rounded-xl bg-[#151515] border border-[#242424] hover:border-[#FF5A00]/40 text-[#F5F5F5] hover:text-[#FF5A00] flex items-center justify-center transition-all"
          title="Google"
        >
          <Globe className="w-4 h-4 text-emerald-400" />
        </button>

        <button
          className="flex-1 py-2.5 rounded-xl bg-[#151515] border border-[#242424] hover:border-[#FF5A00]/40 text-[#F5F5F5] hover:text-[#FF5A00] flex items-center justify-center transition-all"
          title="Discord"
        >
          <DiscordIcon className="w-4 h-4 text-indigo-400" />
        </button>

        <button
          className="flex-1 py-2.5 rounded-xl bg-[#151515] border border-[#242424] hover:border-[#FF5A00]/40 text-[#F5F5F5] hover:text-[#FF5A00] flex items-center justify-center transition-all"
          title="Steam"
        >
          <Gamepad2 className="w-4 h-4 text-sky-400" />
        </button>
      </div>
    </div>
  )
}
