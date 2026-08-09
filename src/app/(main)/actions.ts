"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const SaveVideoSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres"),
  url: z.string().url("URL inválida"),
  folderId: z.string().nullable().optional(),
})

export async function saveVideo(title: string, url: string, folderId?: string | null) {
  const result = SaveVideoSchema.safeParse({ title, url, folderId })
  if (!result.success) {
    throw new Error(result.error.issues[0].message)
  }

  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  await prisma.video.create({
    data: {
      title: result.data.title,
      url: result.data.url,
      userId: session.user.id,
      folderId: result.data.folderId || null,
    }
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/videos")
}

export async function updateProfile(data: { name?: string; chatColor?: string; image?: string }) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data
  })

  revalidatePath("/profile")
}

// --- Folder actions ---

export async function createFolder(name: string) {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > 50) {
    throw new Error("Nome da pasta deve ter entre 1 e 50 caracteres")
  }

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  // Check for duplicate name
  const existing = await prisma.folder.findFirst({
    where: { userId: session.user.id, name: trimmed }
  })
  if (existing) {
    throw new Error("Já existe uma pasta com esse nome")
  }

  await prisma.folder.create({
    data: {
      name: trimmed,
      userId: session.user.id,
    }
  })

  revalidatePath("/dashboard/videos")
}

export async function renameFolder(folderId: string, newName: string) {
  const trimmed = newName.trim()
  if (!trimmed || trimmed.length > 50) {
    throw new Error("Nome da pasta deve ter entre 1 e 50 caracteres")
  }

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId: session.user.id }
  })
  if (!folder) {
    throw new Error("Pasta não encontrada")
  }

  await prisma.folder.update({
    where: { id: folderId },
    data: { name: trimmed }
  })

  revalidatePath("/dashboard/videos")
}

export async function deleteFolder(folderId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId: session.user.id }
  })
  if (!folder) {
    throw new Error("Pasta não encontrada")
  }

  // Move videos to root (unset folderId)
  await prisma.video.updateMany({
    where: { folderId },
    data: { folderId: null }
  })

  await prisma.folder.delete({ where: { id: folderId } })

  revalidatePath("/dashboard/videos")
}

export async function moveVideoToFolder(videoId: string, folderId: string | null) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const video = await prisma.video.findFirst({
    where: { id: videoId, userId: session.user.id }
  })
  if (!video) {
    throw new Error("Vídeo não encontrado")
  }

  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: session.user.id }
    })
    if (!folder) {
      throw new Error("Pasta não encontrada")
    }
  }

  await prisma.video.update({
    where: { id: videoId },
    data: { folderId: folderId || null }
  })

  revalidatePath("/dashboard/videos")
}

export async function deleteVideo(videoId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const video = await prisma.video.findFirst({
    where: { id: videoId, userId: session.user.id }
  })
  if (!video) {
    throw new Error("Vídeo não encontrado")
  }

  await prisma.video.delete({ where: { id: videoId } })

  revalidatePath("/dashboard/videos")
}

export async function getVideosWithFolders() {
  const session = await auth()
  if (!session?.user?.id) {
    return { videos: [], folders: [] }
  }

  const [videos, folders] = await Promise.all([
    prisma.video.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, url: true, folderId: true, createdAt: true },
    }),
    prisma.folder.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, createdAt: true },
    }),
  ])

  return { videos, folders }
}
