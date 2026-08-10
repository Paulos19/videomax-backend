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

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(40, "Nome deve ter no máximo 40 caracteres").optional(),
  chatColor: z.string().optional(),
  image: z.string().optional(),
})

const SendFriendRequestSchema = z.object({
  target: z.string().min(1, "Insira um e-mail ou nome de usuário"),
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

  const result = UpdateProfileSchema.safeParse(data)
  if (!result.success) {
    throw new Error(result.error.issues[0].message)
  }

  const trimmedName = data.name?.trim()

  if (trimmedName) {
    // Check if name is taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
        NOT: { id: session.user.id }
      }
    })

    if (existingUser) {
      throw new Error("O nome de usuário " + trimmedName + " já pertence a outra pessoa.")
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(trimmedName ? { name: trimmedName } : {}),
      ...(data.chatColor ? { chatColor: data.chatColor } : {}),
      ...(data.image ? { image: data.image } : {}),
    }
  })

  revalidatePath("/profile")
  revalidatePath("/dashboard/friends")
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

// --- Friend Actions ---

export async function sendFriendRequest(target: string) {
  const parsed = SendFriendRequestSchema.safeParse({ target })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const trimmed = target.trim()

  // Find target user by email or name
  const targetUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: trimmed, mode: 'insensitive' } },
        { name: { equals: trimmed, mode: 'insensitive' } },
      ]
    }
  })

  if (!targetUser) {
    throw new Error(`Nenhum usuário encontrado com o e-mail ou nome "${trimmed}"`)
  }

  if (targetUser.id === session.user.id) {
    throw new Error("Você não pode enviar um convite de amizade para si mesmo")
  }

  // Check if a request already exists
  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: targetUser.id },
        { senderId: targetUser.id, receiverId: session.user.id },
      ]
    }
  })

  if (existingRequest) {
    if (existingRequest.status === 'ACCEPTED') {
      throw new Error(`Você e ${targetUser.name || targetUser.email} já são amigos!`)
    }
    if (existingRequest.status === 'PENDING') {
      throw new Error("Já existe um pedido de amizade pendente entre vocês.")
    }
    // If REJECTED, update to PENDING
    await prisma.friendRequest.update({
      where: { id: existingRequest.id },
      data: { senderId: session.user.id, receiverId: targetUser.id, status: 'PENDING' }
    })

    revalidatePath("/dashboard/friends")
    return {
      requestId: existingRequest.id,
      receiverId: targetUser.id,
      receiverName: targetUser.name || targetUser.email,
      senderName: session.user.name || session.user.email
    }
  }

  const newRequest = await prisma.friendRequest.create({
    data: {
      senderId: session.user.id,
      receiverId: targetUser.id,
      status: 'PENDING'
    }
  })

  revalidatePath("/dashboard/friends")
  return {
    requestId: newRequest.id,
    receiverId: targetUser.id,
    receiverName: targetUser.name || targetUser.email,
    senderName: session.user.name || session.user.email
  }
}

export async function acceptFriendRequest(requestId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const request = await prisma.friendRequest.findFirst({
    where: { id: requestId, receiverId: session.user.id },
    include: { sender: true }
  })

  if (!request) {
    throw new Error("Pedido de amizade não encontrado")
  }

  await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: 'ACCEPTED' }
  })

  revalidatePath("/dashboard/friends")

  return {
    senderId: request.senderId,
    senderName: request.sender.name || request.sender.email,
    receiverName: session.user.name || session.user.email
  }
}

export async function rejectFriendRequest(requestId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const request = await prisma.friendRequest.findFirst({
    where: { id: requestId, receiverId: session.user.id }
  })

  if (!request) {
    throw new Error("Pedido de amizade não encontrado")
  }

  await prisma.friendRequest.delete({ where: { id: requestId } })

  revalidatePath("/dashboard/friends")
}

export async function removeFriend(friendId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const request = await prisma.friendRequest.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId: session.user.id, receiverId: friendId },
        { senderId: friendId, receiverId: session.user.id }
      ]
    }
  })

  if (request) {
    await prisma.friendRequest.delete({ where: { id: request.id } })
  }

  revalidatePath("/dashboard/friends")
}

export async function getFriendsAndRequests() {
  const session = await auth()
  if (!session?.user?.id) {
    return { friends: [], receivedRequests: [], sentRequests: [] }
  }

  const userId = session.user.id

  const [receivedRequests, sentRequests, acceptedRequests] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: { sender: { select: { id: true, name: true, email: true, image: true, chatColor: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.friendRequest.findMany({
      where: { senderId: userId, status: 'PENDING' },
      include: { receiver: { select: { id: true, name: true, email: true, image: true, chatColor: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.friendRequest.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true, chatColor: true } },
        receiver: { select: { id: true, name: true, email: true, image: true, chatColor: true } }
      },
      orderBy: { updatedAt: 'desc' }
    })
  ])

  const friends = acceptedRequests.map(req => {
    return req.senderId === userId ? req.receiver : req.sender
  })

  return {
    friends,
    receivedRequests: receivedRequests.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString()
    })),
    sentRequests: sentRequests.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString()
    }))
  }
}
