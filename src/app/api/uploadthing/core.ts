import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Configuração para aceitar apenas vídeos (até 1GB por exemplo)
  videoUploader: f({ video: { maxFileSize: "1GB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Usamos a sessão do Next Auth para garantir que apenas usuários logados façam upload
      const session = await auth();
      
      if (!session || !session.user) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File url:", file.url);
      
      return { uploadedBy: metadata.userId, url: file.url, name: file.name };
    }),
    
  // Configuração para fotos de perfil
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await auth();
      if (!session || !session.user) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
