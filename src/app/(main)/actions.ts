"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const SaveVideoSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres"),
  url: z.string().url("URL inválida").refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    "Apenas URLs HTTP/HTTPS são permitidas"
  ),
  folderId: z.string().nullable().optional(),
})

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(40, "Nome deve ter no máximo 40 caracteres").optional(),
  chatColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida. Use o formato #RRGGBB").optional(),
  image: z.string().url("URL de imagem inválida").optional(),
})

const SendFriendRequestSchema = z.object({
  target: z.string().min(1, "Insira um e-mail ou nome de usuário"),
})

const FolderNameSchema = z.string().min(1, "Nome da pasta é obrigatório").max(50, "Nome da pasta deve ter no máximo 50 caracteres")
const IdSchema = z.string().min(1, "ID é obrigatório").max(128, "ID inválido")
const IdOrNullSchema = z.string().min(1, "ID inválido").max(128, "ID inválido").nullable()

import { fetchYouTubeMetadata, isYouTubeUrl } from "@/lib/youtube"

export async function saveVideo(title: string, url: string, folderId?: string | null) {
  const result = SaveVideoSchema.safeParse({ title, url, folderId })
  if (!result.success) {
    throw new Error(result.error.issues[0].message)
  }

  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true }
  })

  if (!dbUser?.emailVerified) {
    throw new Error("Por favor, confirme seu e-mail antes de criar uma sala.")
  }

  let finalTitle = result.data.title
  if (isYouTubeUrl(result.data.url)) {
    const meta = await fetchYouTubeMetadata(result.data.url)
    if (meta?.title && (!finalTitle || finalTitle === result.data.url || finalTitle === 'Sem título')) {
      finalTitle = meta.title
    }
  }

  await prisma.video.create({
    data: {
      title: finalTitle,
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
  const nameResult = FolderNameSchema.safeParse(name.trim())
  if (!nameResult.success) {
    throw new Error(nameResult.error.issues[0].message)
  }
  const trimmed = nameResult.data

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
  const idResult = IdSchema.safeParse(folderId)
  const nameResult = FolderNameSchema.safeParse(newName.trim())
  if (!idResult.success) throw new Error(idResult.error.issues[0].message)
  if (!nameResult.success) throw new Error(nameResult.error.issues[0].message)

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const folder = await prisma.folder.findFirst({
    where: { id: idResult.data, userId: session.user.id }
  })
  if (!folder) {
    throw new Error("Pasta não encontrada")
  }

  await prisma.folder.update({
    where: { id: idResult.data },
    data: { name: nameResult.data }
  })

  revalidatePath("/dashboard/videos")
}

export async function deleteFolder(folderId: string) {
  const idResult = IdSchema.safeParse(folderId)
  if (!idResult.success) throw new Error(idResult.error.issues[0].message)

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const folder = await prisma.folder.findFirst({
    where: { id: idResult.data, userId: session.user.id }
  })
  if (!folder) {
    throw new Error("Pasta não encontrada")
  }

  // Move videos to root (unset folderId)
  await prisma.video.updateMany({
    where: { folderId: idResult.data },
    data: { folderId: null }
  })

  await prisma.folder.delete({ where: { id: idResult.data } })

  revalidatePath("/dashboard/videos")
}

export async function moveVideoToFolder(videoId: string, folderId: string | null) {
  const videoIdResult = IdSchema.safeParse(videoId)
  if (!videoIdResult.success) throw new Error(videoIdResult.error.issues[0].message)
  if (folderId !== null) {
    const fidResult = IdSchema.safeParse(folderId)
    if (!fidResult.success) throw new Error(fidResult.error.issues[0].message)
  }

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const video = await prisma.video.findFirst({
    where: { id: videoIdResult.data, userId: session.user.id }
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
    where: { id: videoIdResult.data },
    data: { folderId: folderId || null }
  })

  revalidatePath("/dashboard/videos")
}

export async function deleteVideo(videoId: string) {
  const idResult = IdSchema.safeParse(videoId)
  if (!idResult.success) throw new Error(idResult.error.issues[0].message)

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const video = await prisma.video.findFirst({
    where: { id: idResult.data, userId: session.user.id }
  })
  if (!video) {
    throw new Error("Vídeo não encontrado")
  }

  await prisma.video.delete({ where: { id: idResult.data } })

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

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true }
  })

  if (!currentUser?.emailVerified) {
    throw new Error("Por favor, confirme seu e-mail para enviar solicitações de amizade.")
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
    throw new Error("Nenhum usuário encontrado com esse e-mail ou nome.")
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

  await prisma.notification.create({
    data: {
      userId: targetUser.id,
      type: 'FRIEND_REQUEST',
      title: 'Pedido de Amizade',
      message: `${session.user.name || session.user.email} enviou um pedido de amizade para você.`,
      data: JSON.stringify({ senderId: session.user.id, requestId: newRequest.id })
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
  const idResult = IdSchema.safeParse(requestId)
  if (!idResult.success) throw new Error(idResult.error.issues[0].message)

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const request = await prisma.friendRequest.findFirst({
    where: { id: idResult.data, receiverId: session.user.id },
    include: { sender: true }
  })

  if (!request) {
    throw new Error("Pedido de amizade não encontrado")
  }

  await prisma.friendRequest.update({
    where: { id: idResult.data },
    data: { status: 'ACCEPTED' }
  })

  await prisma.notification.create({
    data: {
      userId: request.senderId,
      type: 'SYSTEM',
      title: 'Pedido de Amizade Aceito',
      message: `${session.user.name || session.user.email} aceitou seu pedido de amizade.`,
      data: JSON.stringify({ receiverId: session.user.id })
    }
  })

  revalidatePath("/dashboard/friends")

  return {
    senderId: request.senderId,
    senderName: request.sender.name || request.sender.email,
    receiverName: session.user.name || session.user.email
  }
}

export async function rejectFriendRequest(requestId: string) {
  const idResult = IdSchema.safeParse(requestId)
  if (!idResult.success) throw new Error(idResult.error.issues[0].message)

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const request = await prisma.friendRequest.findFirst({
    where: { id: idResult.data, receiverId: session.user.id }
  })

  if (!request) {
    throw new Error("Pedido de amizade não encontrado")
  }

  await prisma.friendRequest.delete({ where: { id: idResult.data } })

  revalidatePath("/dashboard/friends")
}

export async function ensureAndAcceptFriendship(targetUserId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")
  const currentUserId = session.user.id

  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: currentUserId },
      ]
    }
  })

  if (existing) {
    if (existing.status !== 'ACCEPTED') {
      await prisma.friendRequest.update({
        where: { id: existing.id },
        data: { status: 'ACCEPTED' }
      })
    }
  } else {
    await prisma.friendRequest.create({
      data: {
        senderId: targetUserId,
        receiverId: currentUserId,
        status: 'ACCEPTED'
      }
    })
  }

  revalidatePath("/dashboard/friends")
  return { success: true }
}

export async function removeFriend(friendId: string) {
  const idResult = IdSchema.safeParse(friendId)
  if (!idResult.success) throw new Error(idResult.error.issues[0].message)

  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const request = await prisma.friendRequest.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId: session.user.id, receiverId: idResult.data },
        { senderId: idResult.data, receiverId: session.user.id }
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

export async function getFriendSuggestions() {
  const session = await auth()
  if (!session?.user?.id) return []

  const userId = session.user.id

  const existingRequests = await prisma.friendRequest.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }]
    },
    select: { senderId: true, receiverId: true }
  })

  const excludedUserIds = new Set<string>([userId])
  for (const req of existingRequests) {
    excludedUserIds.add(req.senderId)
    excludedUserIds.add(req.receiverId)
  }

  const suggestions = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludedUserIds) }
    },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  })

  return suggestions.map(s => ({
    id: s.id,
    name: s.name || s.email.split('@')[0],
    username: `@${(s.name || s.email.split('@')[0]).toLowerCase().replace(/\s+/g, '')}`,
    email: s.email,
    image: s.image || undefined,
    mutualCount: 0
  }))
}

// --- Notifications ---

export async function getNotifications() {
  const session = await auth()
  if (!session?.user?.id) return []

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return notifications
}

export async function markNotificationAsRead(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  await prisma.notification.update({
    where: { id, userId: session.user.id },
    data: { read: true }
  })
}

export async function markAllNotificationsAsRead() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true }
  })
}

export async function deleteNotification(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  await prisma.notification.delete({
    where: { id, userId: session.user.id }
  })
}

import { sendRoomInviteEmail } from "@/lib/email"

export async function createRoomInviteNotification(targetUserId: string, roomId: string, senderName: string, roomTitle?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const [notif, targetUser] = await Promise.all([
    prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'ROOM_INVITE',
        title: 'Convite para Sala',
        message: `${senderName} convidou você para assistir vídeos em sincronia.`,
        data: JSON.stringify({ roomId, senderId: session.user.id }),
      }
    }),
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: { email: true }
    })
  ])

  if (targetUser?.email) {
    sendRoomInviteEmail({
      toEmail: targetUser.email,
      inviterName: senderName,
      roomTitle: roomTitle || 'Sala de Transmissão',
      roomCode: roomId,
    }).catch((err) => {
      console.error("Erro ao enviar e-mail de convite para sala:", err)
    })
  }

  return notif
}
