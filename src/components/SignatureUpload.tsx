import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, PenLine } from "lucide-react"

export default function SignatureUpload() {
  const [firma, setFirma] = useState<string | null>(() => localStorage.getItem("recibo-firma-autorizada"))
  const [preview, setPreview] = useState<string | null>(firma)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPreview(result)
      localStorage.setItem("recibo-firma-autorizada", result)
      setFirma(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setFirma(null)
    localStorage.removeItem("recibo-firma-autorizada")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-2 mt-4">
      <label className="text-xs font-medium text-white/60 block">
        <PenLine className="inline h-3 w-3 mr-1" />
        Firma Autorizada
      </label>
      {preview && (
        <div className="relative">
          <img src={preview} alt="Firma" className="w-full h-16 object-contain rounded bg-white/5 p-2" />
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
        id="firma-upload"
      />
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-white/60 hover:text-white hover:bg-white/10"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {preview ? "Cambiar firma" : "Subir firma"}
      </Button>
    </div>
  )
}
