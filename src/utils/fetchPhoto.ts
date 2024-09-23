export async function fetchPhoto(
  readFolderPath: string,
  reference: string
): Promise<string | null> {
  console.log('Pasta de leitura:', readFolderPath)
  console.log('Referência buscada:', reference)

  if (!readFolderPath || !reference) {
    console.error('Pasta de leitura ou referência não definidas')
    return null
  }

  try {
    const result = await window.electronAPI.findPhoto(readFolderPath, reference)

    if (result.success && result.imageUrl) {
      console.log('Foto encontrada:', result.imageUrl)
      return result.imageUrl
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      console.log('Nenhuma foto encontrada:', result.message)
      return null
    }
  } catch (error) {
    console.error('Erro ao buscar a foto:', error)
    return null
  }
}
