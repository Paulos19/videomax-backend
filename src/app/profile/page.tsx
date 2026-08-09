"use client"
import { UploadDropzone } from "@/lib/uploadthing";
import { useState, useEffect } from "react";
import { updateProfile } from "./actions";
import "@uploadthing/react/styles.css";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4f46e5");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, chatColor: color, image: imageUrl || undefined });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-indigo-400">Meu Perfil</h1>
      
      <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        
        <div className="mb-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 mb-4 border-2 border-indigo-500">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">Sem Foto</div>
            )}
          </div>
          <div className="w-full">
            <UploadDropzone
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]) setImageUrl(res[0].url);
              }}
              appearance={{
                container: "border-zinc-700 bg-zinc-800/30 border-dashed rounded-lg p-4 h-32",
                allowedContent: "hidden",
                button: "bg-indigo-600 text-xs px-4 py-1"
              }}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-zinc-400 mb-2">Nome de Exibição no Chat</label>
          <input 
            type="text" 
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-white"
            placeholder="Ex: Joãozinho"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm text-zinc-400 mb-2">Cor da Bolha de Chat</label>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              className="w-12 h-12 rounded cursor-pointer bg-transparent border-0"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <span className="text-zinc-500 font-mono">{color}</span>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-bold py-3 rounded-xl"
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>

        {success && <p className="text-green-400 text-center mt-4">Perfil atualizado com sucesso!</p>}
      </div>
    </div>
  )
}
