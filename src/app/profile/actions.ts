"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

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
