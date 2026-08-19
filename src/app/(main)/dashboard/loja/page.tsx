'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  Crown,
  Sparkles,
  Palette,
  Smile,
  Zap,
  Check,
  ShieldCheck,
  Grid,
  ArrowRight,
  Loader2,
  Lock,
  Star,
  Flame,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ShopVault3DView } from '@/components/dashboard/shop-vault-3d'
import { useSession } from 'next-auth/react'

interface ShopItem {
  id: string
  title: string
  category: 'plan' | 'theme' | 'border' | 'emote'
  price: string
  description: string
  badge?: string
  borderColor: string
  icon: any
}

const shopItems: ShopItem[] = [
  {
    id: 'pro-plan',
    title: 'ASSINATURA PLANO PRO ⭐',
    category: 'plan',
    price: 'R$ 19,90 /mês',
    description: 'Salas para até 6 pessoas simultâneas, transmissão 1080p sem anúncios, selo de Host VIP e salas ilimitadas.',
    badge: 'MAIS POPULAR',
    borderColor: 'border-[#FFE600]/60',
    icon: Crown,
  },
  {
    id: 'gold-border',
    title: 'MOLDURA DOURADA VIP',
    category: 'border',
    price: 'R$ 4,90',
    description: 'Destaque seu avatar nas salas com uma moldura cibernética dourada reluzente animada.',
    badge: 'NOVO',
    borderColor: 'border-[#FFE600]/40',
    icon: Sparkles,
  },
  {
    id: 'cyber-border',
    title: 'MOLDURA CYBERPUNK NEON',
    category: 'border',
    price: 'R$ 4,90',
    description: 'Borda com efeito neon ciano e roxo pulsante dinâmico para perfis futuristas.',
    borderColor: 'border-[#00F0FF]/40',
    icon: Sparkles,
  },
  {
    id: 'neon-chat-pack',
    title: 'PACOTE CORES NEON CHAT',
    category: 'theme',
    price: 'R$ 3,50',
    description: 'Desbloqueie 8 novas cores neon exclusivas para destacar suas mensagens no chat da sala.',
    badge: 'DESTAQUE',
    borderColor: 'border-[#A855F7]/40',
    icon: Palette,
  },
  {
    id: 'anime-emotes',
    title: 'PACOTE EMOTES ANIMADOS',
    category: 'emote',
    price: 'R$ 2,90',
    description: 'Coleção com 12 figurinhas e reações animadas exclusivas para interagir durante as transmissões.',
    borderColor: 'border-[#22C55E]/40',
    icon: Smile,
  },
  {
    id: 'legend-badge',
    title: 'SELO HOST LENDÁRIO',
    category: 'border',
    price: 'R$ 5,90',
    description: 'Selo holográfico permanente ao lado do seu nome em todas as salas que você criar ou participar.',
    badge: 'EXCLUSIVO',
    borderColor: 'border-[#FF5A00]/40',
    icon: ShieldCheck,
  },
]

const categories = [
  { id: 'all', label: 'TODOS OS ITENS' },
  { id: 'plan', label: 'PLANOS & ASSINATURAS' },
  { id: 'border', label: 'MOLDURAS DE AVATAR' },
  { id: 'theme', label: 'CORES DE CHAT' },
  { id: 'emote', label: 'EMOTES & REAÇÕES' },
]

export default function LojaPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeCategory, setActiveCategory] = useState<'all' | 'plan' | 'theme' | 'border' | 'emote'>('all')
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [liveUser, setLiveUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/user/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setLiveUser(data.user)
      })
      .catch(() => {})
  }, [])

  const user = liveUser || session?.user
  const userPlan = (user?.plan || 'FREE').toUpperCase()
  const isPro = userPlan === 'PRO' || userPlan === 'MAXPRO'

  const handleCheckoutPro = async () => {
    setLoadingCheckout(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        toast.error(data?.error || 'Erro ao conectar com o Stripe')
      }
    } catch {
      toast.error('Erro ao processar o checkout')
    } finally {
      setLoadingCheckout(false)
    }
  }

  const handleBuyItem = (item: ShopItem) => {
    if (item.id === 'pro-plan') {
      handleCheckoutPro()
      return
    }

    toast.info(`O item "${item.title}" estará disponível no lançamento oficial da loja.`, {
      description: 'Inventário e personalização de itens em desenvolvimento.',
    })
  }

  const filteredItems = shopItems.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  )

  return (
    <div className="space-y-8">
      
      {/* ── HEADER COMMAND BANNER ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#09090D] border border-[#222] p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div
          className={cn(
            'absolute top-0 right-0 w-80 h-full blur-3xl pointer-events-none opacity-20 transition-colors',
            isPro ? 'bg-[#FFE600]' : 'bg-[#FF5A00]'
          )}
        />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-[#FF5A00] flex items-center justify-center font-black shrink-0 text-black shadow-[0_0_20px_rgba(255,90,0,0.3)]">
            <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-[#FF5A00] uppercase font-bold tracking-widest bg-[#14141E] px-2 py-0.5 border border-[#222]">
                [ LOJA OFICIAL // UPGRADES ]
              </span>
              <span className="text-[9px] font-mono text-[#22C55E] uppercase font-bold bg-[#061508] border border-[#16381C] px-2 py-0.5">
                ● STRIPE SECURE
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-mono text-white uppercase tracking-tight">
              LOJA VIDEOMAX & PLANOS VIP
            </h1>
            <p className="text-[11px] font-mono text-[#888]">
              Personalize seu perfil com molduras holográficas, cores exclusivas e assine o Plano MAXPRO.
            </p>
          </div>
        </div>

        {/* 3D Diamond Gem */}
        <div className="hidden sm:flex items-center justify-center relative z-10">
          <ShopVault3DView className="w-24 h-24 relative" />
        </div>
      </div>

      {/* ── HERO VIP PLAN BLOCK (HIGH VOLTAGE) ────────────────────── */}
      <div
        className={cn(
          'relative overflow-hidden p-6 sm:p-8 border transition-all duration-300 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8',
          isPro
            ? 'bg-gradient-to-r from-[#1A1308] via-[#0E0C0A] to-[#070605] border-[#FFE600]/60 shadow-[0_0_35px_rgba(255,230,0,0.15)]'
            : 'bg-gradient-to-r from-[#160E08] via-[#0E0C0A] to-[#070605] border-[#FF5A00]/50 shadow-[0_0_35px_rgba(255,90,0,0.15)]'
        )}
      >
        <div className="space-y-4 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 font-mono font-black text-[10px] uppercase tracking-widest shadow-md',
                isPro
                  ? 'bg-[#FFE600] text-black shadow-[0_0_12px_rgba(255,230,0,0.4)]'
                  : 'bg-[#FF5A00] text-black shadow-[0_0_12px_rgba(255,90,0,0.4)]'
              )}
            >
              <Crown className="w-3.5 h-3.5 fill-black" />
              <span>{isPro ? '👑 SEU PLANO VIP ATIVO ATUALMENTE' : '★ PLANO RECOMENDADO'}</span>
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-mono text-white uppercase tracking-tight flex items-center gap-2">
              ASSINATURA PLANO MAXPRO <span className="text-[#FFE600]">⭐</span>
            </h2>
            <p className="text-[11px] font-mono text-[#AAA] max-w-xl mt-1 leading-relaxed">
              Suba de nível e ofereça a melhor experiência para seus amigos com infraestrutura Mesh 6X em alta resolução e baixa latência.
            </p>
          </div>

          {/* Telemetry Bullets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-[#E5E5E5]">
              <span className="text-[#FFE600] font-bold">✓</span>
              <span>Salas para até 6 participantes simultâneos</span>
            </div>
            <div className="flex items-center gap-2 text-[#E5E5E5]">
              <span className="text-[#FFE600] font-bold">✓</span>
              <span>Transmissão HD 1080p sem travamentos</span>
            </div>
            <div className="flex items-center gap-2 text-[#E5E5E5]">
              <span className="text-[#FFE600] font-bold">✓</span>
              <span>Selo exclusivo de Host VIP nas salas</span>
            </div>
            <div className="flex items-center gap-2 text-[#E5E5E5]">
              <span className="text-[#FFE600] font-bold">✓</span>
              <span>Salas privadas ilimitadas e suporte prioritário</span>
            </div>
          </div>
        </div>

        {/* Pricing Box & Checkout Action */}
        <div className="w-full lg:w-72 bg-[#050507] border border-[#2A2A35] p-6 flex flex-col items-center text-center space-y-4 shrink-0 shadow-xl">
          <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest">
            {isPro ? 'VALOR DA ASSINATURA' : 'POR APENAS'}
          </span>

          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-sm font-bold text-[#FF5A00]">R$</span>
            <span className="text-3xl font-black text-white">19,90</span>
            <span className="text-[11px] text-[#777]">/mês</span>
          </div>

          {isPro ? (
            <button
              onClick={() => router.push('/profile')}
              className="w-full py-3.5 bg-[#FFE600] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_20px_rgba(255,230,0,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Crown className="w-4 h-4 fill-black" />
              <span>[ GERENCIAR PLANO VIP ]</span>
            </button>
          ) : (
            <button
              onClick={handleCheckoutPro}
              disabled={loadingCheckout}
              className="w-full py-3.5 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_25px_rgba(255,90,0,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {loadingCheckout ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Crown className="w-4 h-4 fill-black" />
              )}
              <span>[ ASSINAR PLANO PRO ]</span>
            </button>
          )}

          <span className="text-[9px] font-mono text-[#666]">
            Pagamento 100% seguro via Stripe. Cancele a qualquer momento.
          </span>
        </div>
      </div>

      {/* ── CATEGORY FILTER TABS ───────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[#222]">
        {categories.map((cat) => {
          const active = activeCategory === cat.id
          const count =
            cat.id === 'all'
              ? shopItems.length
              : shopItems.filter((i) => i.category === cat.id).length

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={cn(
                'px-3.5 py-2 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap',
                active
                  ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_12px_rgba(255,90,0,0.3)]'
                  : 'bg-[#09090D] text-[#777] border-[#222] hover:text-white hover:border-[#333]'
              )}
            >
              <span>[ {cat.label} ]</span>
              <span
                className={cn(
                  'text-[9px] px-1 py-0.2 rounded-xs font-mono font-bold',
                  active ? 'bg-black text-[#FF5A00]' : 'bg-[#151520] text-[#888]'
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── ITEMS CATALOG GRID ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const IconComp = item.icon
          const isItemProPlan = item.id === 'pro-plan'

          return (
            <div
              key={item.id}
              className={cn(
                'group relative bg-[#09090D] border p-5 flex flex-col justify-between space-y-4 transition-all duration-200 hover:scale-[1.01]',
                item.borderColor,
                'hover:border-white/60 shadow-xl'
              )}
            >
              <div className="space-y-3">
                
                {/* Header: Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-[#121218] border border-[#222] flex items-center justify-center text-[#FFE600] group-hover:text-white transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>

                  {item.badge && (
                    <span className="text-[8px] font-mono font-bold bg-[#FF5A00] text-black px-2 py-0.5 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-[13px] font-mono font-bold text-white uppercase group-hover:text-[#FF5A00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[10px] font-mono text-[#888] mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Footer: Price & Buy Action */}
              <div className="pt-3 border-t border-[#1C1C24] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] font-mono text-[#666] block">PREÇO</span>
                  <span className="text-sm font-mono font-black text-white">
                    {item.price}
                  </span>
                </div>

                <button
                  onClick={() => handleBuyItem(item)}
                  className={cn(
                    'px-4 py-2 text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer',
                    isItemProPlan
                      ? isPro
                        ? 'bg-[#222] text-[#FFE600] border border-[#FFE600]/40'
                        : 'bg-[#FFE600] hover:bg-white text-black font-black shadow-[0_0_12px_rgba(255,230,0,0.3)]'
                      : 'bg-[#151520] hover:bg-[#FF5A00] text-white hover:text-black border border-[#333] hover:border-[#FF5A00]'
                  )}
                >
                  {isItemProPlan && isPro ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>ATIVO</span>
                    </>
                  ) : (
                    <span>[ ADQUIRIR ]</span>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
