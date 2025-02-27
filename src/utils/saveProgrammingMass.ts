import html2canvas from 'html2canvas'

declare global {
  interface Window {
    electronAPI: {
      readDir: (path: string) => Promise<string[]>
      joinPath: (path: string, file: string) => Promise<string>
      readImageFile: (path: string) => Promise<string>
      findPhoto: (
        dirPath: string,
        referencia: string
      ) => Promise<{ success: boolean; imageUrl?: string; message?: string }>
      saveProgrammingMass: (data: {
        fileName: string
        imageData: string
        writeFolderPath: string
      }) => Promise<{ success: boolean; message?: string }>
    }
  }
}

export async function saveProgrammingMass(
  fileName,
  writeFolderPath,
  photoSectionRef
) {
  if (!photoSectionRef.current) {
    console.error('Elemento photo-section não encontrado')
    // Retorne um objeto com success = false para evitar undefined
    return { success: false, message: 'Elemento photo-section não encontrado.' }
  }

  try {
    // Captura a imagem
    const canvas = await html2canvas(photoSectionRef.current, { useCORS: true })
    const imageData = canvas.toDataURL('image/jpeg', 1.0)

    // Chama o IPC
    const result = await window.electronAPI.saveProgrammingMass({
      fileName,
      imageData,
      writeFolderPath,
    })

    // Sempre retorne result
    return result
  } catch (error) {
    console.error('Erro ao capturar a imagem:', error)
    // Retorne um objeto com success = false
    return { success: false, message: error.message }
  }
}
