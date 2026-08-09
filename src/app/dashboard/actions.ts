"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function saveVideo(title: string, url: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  await prisma.video.create({
    data: {
      title,
      url,
      userId: session.user.id
    }
  })
  
  revalidatePath("/dashboard")
}
