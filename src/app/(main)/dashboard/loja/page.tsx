'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag, Crown, Sparkles, Palette, Smile, Zap,
  Check, ShieldCheck, Grid, ArrowRight, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShopItem {
  id: string
  title: string
  category: 'plan' | 'theme' | 'border' | 'emote'
  price: string
  description: string
  badge?: string
  gradient: string
  icon: any
}

const shopItems: ShopItem[] = [
  {
    id: 'pro-plan',
    title: 'Assinatura Plano PRO ⭐',
    category: 'plan',
    price: 'R$ 19,90 /mês',
    description: 'Salas para até 6 pessoas, transmissão HD, selo de Host PRO e salas ilimitadas.',
    badge: 'MAIS VENDIDO',
    gradient: 'from-amber-500/20 via-orange-500/20 to-amber-500/10',
    icon: Crown
  },
  {
    id: 'gold-border',
    title: 'Moldura Dourada VIP',
    category: 'border',
    price: 'R$ 4,90',
    description: 'Destaque seu avatar nas salas com uma borda dourada reluzente animada.',
    badge: 'NOVO',
    gradient: 'from-[#FF5A00]/20 to-amber-500/10',
    icon: Sparkles
  },
  {
    id: 'cyber-border',
    title: 'Moldura Cyberpunk Neon',
    category: 'border',
    price: 'R$ 4,90',
    description: 'Borda com efeito neon ciano e roxo dinâmico para perfis futuristas.',
    gradient: 'from-cyan-500/20 to-purple-500/10',
    icon: Sparkles
  },
  {
    id: 'neon-chat-pack',
    title: 'Pacote Cores Neon Chat',
    category: 'theme',
    price: 'R$ 3,50',
    description: 'Desbloqueie 8 novas cores neon exclusivas para destacar suas mensagens no chat.',
    gradient: 'from-purple-500/20 to-pink-500/10',
    icon: Palette
  },
  {
    id: 'anime-emotes',
    title: 'Pacote Emotes de Anime',
    category: 'emote',
    price: 'R$ 2,90',
    description: 'Coleção com 12 figurinhas e reações animadas de animes populares.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    icon: Smile
  },
  {
    id: 'legend-badge',
    title: 'Selo Host Lendário',
    category: 'border',
    price: 'R$ 5,90',
    description: 'Selo exclusivo ao lado do seu nome em todas as salas que você apresentar.',
    gradient: 'from-red-500/20 to-orange-500/10',
    icon: ShieldCheck
  }
]

export default function LojaPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<'all' | 'plan' | 'theme' | 'border' | 'emote'>('all')
  const [loadingCheckout, setLoadingCheckout] = useState(false)

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

    toast.info(`Em breve! O item "${item.title}" estará disponível no lançamento oficial da loja.`, {
      description: 'Estamos preparando o sistema de inventário para os próximos dias.'
    })
  }

  const filteredItems = shopItems.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#242424] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center text-white brand-glow-strong shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
                  Loja VideoMax
                </h1>
                <span className="flex items-center gap-1 bg-[#FF5A00]/10 border border-[#FF5A00]/30 px-2.5 py-0.5 rounded-full text-[#FF5A00] text-[10px] font-extrabold uppercase tracking-wider">
                  <Zap className="w-3 h-3 fill-[#FF5A00]" /> OFICIAL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8A8A8A]">
                Personalize seu perfil, adquira molduras exclusivas e assine o Plano PRO para transmissões ilimitadas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Featured Plan Card (Plano PRO ⭐) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0B0B0B] via-[#111118] to-[#0B0B0B] border border-amber-500/40 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 fill-amber-400" />
            <span>Plano Recomendado</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Assinatura Plano PRO ⭐
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A0B0] mt-1 leading-relaxed">
              Suba de nível e ofereça a melhor experiência para os seus amigos. Salas maiores, transmissões em alta qualidade e selo exclusivo de criador!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Salas para até 6 participantes</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Transmissão HD sem travamentos</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Selo exclusivo Host PRO ⭐</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Suporte prioritário e salas ilimitadas</span>
            </div>
          </div>
        </div>

        {/* Pricing & Checkout Action */}
        <div className="p-6 rounded-2xl bg-[#0F0F17] border border-amber-500/30 text-center space-y-4 w-full lg:w-80 shrink-0 shadow-xl">
          <div>
            <span className="text-xs text-[#8A8A8A] font-semibold uppercase tracking-wider block">Por apenas</span>
            <span className="text-3xl font-extrabold text-white font-mono">R$ 19,90</span>
            <span className="text-xs text-[#8A8A8A] font-medium"> / mês</span>
          </div>

          <button
            onClick={handleCheckoutPro}
            disabled={loadingCheckout}
            className="w-full py-3.5 px-4 rounded-xl brand-gradient text-white font-extrabold text-xs sm:text-sm shadow-xl brand-glow-strong hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-400/40"
          >
            {loadingCheckout ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Crown className="w-4 h-4 fill-white" />
                <span>Assinar Plano PRO Agora</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-[#8A8A8A]">
            Pagamento 100% seguro via Stripe. Cancele a qualquer momento.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#242424] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
            activeCategory === 'all'
              ? "brand-gradient text-white shadow-md"
              : "bg-[#0B0B0B] text-[#8A8A8A] hover:text-[#F5F5F5] border border-[#242424]"
          )}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Todos os Itens</span>
        </button>

        <button
          onClick={() => setActiveCategory('plan')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
            activeCategory === 'plan'
              ? "brand-gradient text-white shadow-md"
              : "bg-[#0B0B0B] text-[#8A8A8A] hover:text-[#F5F5F5] border border-[#242424]"
          )}
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Planos & Assinaturas</span>
        </button>

        <button
          onClick={() => setActiveCategory('border')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
            activeCategory === 'border'
              ? "brand-gradient text-white shadow-md"
              : "bg-[#0B0B0B] text-[#8A8A8A] hover:text-[#F5F5F5] border border-[#242424]"
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Molduras de Avatar</span>
        </button>

        <button
          onClick={() => setActiveCategory('theme')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
            activeCategory === 'theme'
              ? "brand-gradient text-white shadow-md"
              : "bg-[#0B0B0B] text-[#8A8A8A] hover:text-[#F5F5F5] border border-[#242424]"
          )}
        >
          <Palette className="w-3.5 h-3.5 text-purple-400" />
          <span>Cores de Chat</span>
        </button>

        <button
          onClick={() => setActiveCategory('emote')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
            activeCategory === 'emote'
              ? "brand-gradient text-white shadow-md"
              : "bg-[#0B0B0B] text-[#8A8A8A] hover:text-[#F5F5F5] border border-[#242424]"
          )}
        >
          <Smile className="w-3.5 h-3.5 text-emerald-400" />
          <span>Emotes & Reações</span>
        </button>
      </div>

      {/* Grid of Marketplace Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const IconComp = item.icon

          return (
            <div
              key={item.id}
              className="bg-[#0B0B0B] border border-[#242424] hover:border-[#FF5A00]/50 rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group relative overflow-hidden"
            >
              {/* Item Header / Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br border border-white/10 flex items-center justify-center text-white shadow-lg", item.gradient)}>
                    <IconComp className="w-6 h-6 text-white" />
                  </div>

                  {item.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FF5A00]/10 border border-[#FF5A00]/30 text-[#FF5A00] text-[10px] font-extrabold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#FF5A00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#8A8A8A] mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Price & Buy Button */}
              <div className="pt-4 border-t border-[#242424] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-[#8A8A8A] block font-semibold uppercase tracking-wider">Preço</span>
                  <span className="text-sm font-extrabold text-white font-mono">{item.price}</span>
                </div>

                <button
                  onClick={() => handleBuyItem(item)}
                  className="px-4 py-2 rounded-xl brand-gradient text-white text-xs font-bold flex items-center gap-1.5 brand-glow-strong hover:scale-105 active:scale-95 transition-all"
                >
                  <span>{item.id === 'pro-plan' ? 'Assinar' : 'Adquirir'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
