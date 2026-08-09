"use client"
import { UploadDropzone } from "@/lib/uploadthing";
import { useState } from "react";
import { saveVideo } from "./actions";
import "@uploadthing/react/styles.css";

export default function DashboardPage() {
  const [title, setTitle] = useState("");
  const [success, setSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-indigo-400">Painel de Mídia (Uploadthing)</h1>
      
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Enviar Novo Vídeo</h2>
        
        <div className="mb-6">
          <label className="block text-sm text-zinc-400 mb-2">Título do Vídeo (Opcional)</label>
          <input 
            type="text" 
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-white"
            placeholder="Ex: O Senhor dos Anéis.mp4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {success ? (
          <div className="bg-green-900/50 border border-green-500 text-green-400 p-4 rounded-lg text-center">
            Vídeo processado e salvo com sucesso! Já pode ser acessado pelo Mobile.
            <button onClick={() => { setSuccess(false); setTitle("") }} className="block mx-auto mt-4 underline text-sm text-green-300">
              Fazer upload de outro
            </button>
          </div>
        ) : (
          <UploadDropzone
            endpoint="videoUploader"
            onClientUploadComplete={async (res) => {
              if (res?.[0]) {
                const url = res[0].url;
                const videoTitle = title.trim() || res[0].name;
                await saveVideo(videoTitle, url);
                setSuccess(true);
              }
            }}
            onUploadError={(error: Error) => {
              alert(`Erro no upload: ${error.message}`);
            }}
            appearance={{
              container: "border-zinc-700 bg-zinc-800/50 border-2 border-dashed rounded-xl p-8",
              uploadIcon: "text-zinc-500",
              label: "text-zinc-400 font-medium hover:text-indigo-400",
              allowedContent: "text-zinc-500 text-sm",
              button: "bg-indigo-600 px-6 py-2 rounded-lg text-white font-medium mt-4 after:bg-indigo-500"
            }}
          />
        )}
      </div>
    </div>
  )
}
