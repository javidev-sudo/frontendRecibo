import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

export default function LogoUpload() {
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem("recibo-logo"))
  const [preview, setPreview] = useState<string | null>(logo)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPreview(result)
      localStorage.setItem("recibo-logo", result)
      setLogo(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setLogo(null)
    localStorage.removeItem("recibo-logo")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/60 block">Logo del Recibo</label>
      {preview && (
        <div className="relative">
          <img src={preview} alt="Logo" className="w-full h-20 object-contain rounded bg-white/5 p-2" />
          <button
            onClick={handleRemove}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="logo-upload"
      />
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-white/60 hover:text-white hover:bg-white/10"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {preview ? "Cambiar logo" : "Subir logo"}
      </Button>
    </div>
  )
}
