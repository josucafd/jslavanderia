// src/hooks/useUpdate.jsx
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { useToast } from './use-toast'
import { AlertTriangle, CheckCircle } from 'lucide-react'

export function useUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    window.electronAPI.checkForUpdates()

    window.electronAPI.onUpdateAvailable(() => {
      setUpdateAvailable(true)
      toast({
        title: 'Atualização Disponível',
        description: 'Uma nova versão está disponível. Clique para atualizar.',
        action: (
          <Button
            onClick={simulateUpdate}
            className="bg-yellow-500 text-white hover:bg-yellow-600 flex items-center space-x-2"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Atualizar</span>
          </Button>
        ),
        className: 'bg-yellow-500 text-white',
      })
    })

    window.electronAPI.onDownloadProgress((event, percent) => {
      setProgress(percent)
    })

    window.electronAPI.onUpdateDownloaded(() => {
      toast({
        title: 'Atualização Baixada',
        description: 'A atualização foi concluída. Reinicie para aplicar.',
        action: (
          <Button
            onClick={() => window.electronAPI.restartApp()}
            className="bg-green-500 text-white hover:bg-green-600 flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Reiniciar e Atualizar</span>
          </Button>
        ),
        className: 'bg-green-800 text-white',
      })
    })
  }, [toast])

  const simulateUpdate = () => {
    setProgress(0)
    setIsDownloading(true)
    window.electronAPI.downloadUpdate()
  }

  return { updateAvailable, progress, isDownloading, simulateUpdate }
}
