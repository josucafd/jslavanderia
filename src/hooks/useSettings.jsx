// src/hooks/useSettings.jsx
import { useState, useEffect } from 'react'
import { useToast } from './use-toast'

export function useSettings() {
  const [readFolderPath, setReadFolderPath] = useState('')
  const [writeFolderPath, setWriteFolderPath] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    async function loadSettings() {
      try {
        const result = await window.electronAPI.loadSettings()
        if (result.success && result.settings) {
          setReadFolderPath(result.settings.readFolderPath || '')
          setWriteFolderPath(result.settings.writeFolderPath || '')
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }
    loadSettings()
  }, [])

  const selectReadFolder = async () => {
    try {
      const result = await window.electronAPI.selectReadFolder()
      if (result.success) {
        setReadFolderPath(result.path)
        toast({
          title: 'Pasta de leitura selecionada com sucesso!',
          className: 'bg-green-800 text-white',
        })
      } else {
        toast({
          title: 'Erro ao selecionar pasta de leitura',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao selecionar pasta de leitura',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const selectWriteFolder = async () => {
    try {
      const result = await window.electronAPI.selectWriteFolder()
      if (result.success) {
        setWriteFolderPath(result.path)
        toast({
          title: 'Pasta de gravação selecionada com sucesso!',
          className: 'bg-green-800 text-white',
        })
      } else {
        toast({
          title: 'Erro ao selecionar pasta de gravação',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao selecionar pasta de gravação',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const saveSettings = async () => {
    try {
      const settings = { readFolderPath, writeFolderPath }
      const result = await window.electronAPI.saveSettings(settings)
      if (result.success) {
        toast({
          title: 'Configurações salvas com sucesso!',
          className: 'bg-green-800 text-white',
        })
      } else {
        toast({
          title: 'Erro ao salvar configurações',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return {
    readFolderPath,
    writeFolderPath,
    selectReadFolder,
    selectWriteFolder,
    saveSettings,
  }
}
