// src/hooks/usePhotoLoader.jsx
import { useState, useEffect, useRef } from 'react'
import { useToast } from './use-toast'
import { fetchPhoto } from '../utils/fetchPhoto'

export function usePhotoLoader(selectedRow, readFolderPath) {
  const [photoUrl, setPhotoUrl] = useState(null)
  const { toast } = useToast()
  const lastReferenciaRef = useRef(null)

  useEffect(() => {
    // console.log('usePhotoLoader:', { selectedRow, readFolderPath })
    async function loadPhoto(row) {
      if (!row?.Referencia || !readFolderPath) return
      if (row.Referencia === lastReferenciaRef.current) return
      lastReferenciaRef.current = row.Referencia
      try {
        const photoPath = await fetchPhoto(readFolderPath, row.Referencia)
        if (photoPath) {
          const url = await window.electronAPI.getPhotoUrl(photoPath)
          setPhotoUrl(url)
        } else {
          setPhotoUrl(null)
        }
      } catch (error) {
        toast({
          title: 'Erro ao carregar a foto:',
          description: error.message,
          variant: 'destructive',
        })
        setPhotoUrl(null)
      }
    }
    if (selectedRow?.Referencia && readFolderPath) {
      loadPhoto(selectedRow)
    }
  }, [selectedRow, readFolderPath, toast])

  return { photoUrl }
}
