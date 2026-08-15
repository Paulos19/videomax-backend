'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getStickerPacks() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const packs = await prisma.stickerPack.findMany({
    where: { userId: session.user.id },
    include: { stickers: true },
    orderBy: { createdAt: 'desc' }
  })

  // Retorna um pacote padrão caso o usuário não tenha nenhum
  if (packs.length === 0) {
    const newPack = await prisma.stickerPack.create({
      data: {
        name: 'Favoritos',
        userId: session.user.id
      },
      include: { stickers: true }
    })
    return [newPack]
  }

  return packs
}

export async function createStickerPack(name: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const pack = await prisma.stickerPack.create({
    data: {
      name,
      userId: session.user.id
    },
    include: { stickers: true }
  })

  revalidatePath('/room/[id]', 'page')
  return pack
}

export async function saveSticker(packId: string, url: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  // Verifica se o pacote pertence ao usuário
  const pack = await prisma.stickerPack.findUnique({
    where: { id: packId }
  })

  if (!pack || pack.userId !== session.user.id) {
    throw new Error('Pack not found or unauthorized')
  }

  const sticker = await prisma.sticker.create({
    data: {
      url,
      packId
    }
  })

  revalidatePath('/room/[id]', 'page')
  return sticker
}
