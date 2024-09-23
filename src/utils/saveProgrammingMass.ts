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
  fileName: string, // Nome do arquivo a ser salvo
  writeFolderPath: string, // O caminho da pasta de escrita
  photoSectionRef: React.RefObject<HTMLDivElement> // Referência ao elemento photo-section
) {
  if (!photoSectionRef.current) {
    console.error('Elemento photo-section não encontrado')
    return
  }

  try {
    // Captura a imagem da programação
    const canvas = await html2canvas(photoSectionRef.current, { useCORS: true })
    const imageData = canvas.toDataURL('image/jpeg', 1.0)

    // Enviar para o backend salvar
    const result = await window.electronAPI.saveProgrammingMass({
      fileName,
      imageData,
      writeFolderPath,
    })

    if (result.success) {
      console.log(`Imagem ${fileName} salva com sucesso!`)
    } else {
      console.error(`Erro ao salvar a imagem ${fileName}:`, result.message)
    }
  } catch (error) {
    console.error('Erro ao capturar a imagem:', error)
  }
}
