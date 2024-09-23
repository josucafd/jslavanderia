import React, { useState, useEffect, useRef } from 'react'
import { Button } from './components/ui/button'
import { Toaster } from './components/ui/toaster'
import { useToast } from './hooks/use-toast'
import { Progress } from './components/ui/progress'
import Header from './components/gerador-fotos/Header'
import TableSection from './components/gerador-fotos/TableSection'
import PhotoSection from './components/gerador-fotos/PhotoSection'
import Footer from './components/gerador-fotos/Footer'
import SettingsDialog from './components/gerador-fotos/SettingsDialog'
import { fetchPhoto } from './utils/fetchPhoto'
import { saveProgrammingMass } from './utils/saveProgrammingMass'

function App() {
  const [version, setVersion] = useState('')
  const [excelData, setExcelData] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)
  const [readFolderPath, setReadFolderPath] = useState('')
  const [writeFolderPath, setWriteFolderPath] = useState('')
  const [photoUrl, setPhotoUrl] = useState(null)
  const photoSectionRef = useRef(null)
  const photoBoxRef = useRef(null)
  const { toast } = useToast()
  const [progress, setProgress] = useState(0)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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

    // Escuta o evento de progresso do download
    window.electronAPI.onDownloadProgress((event, percent) => {
      console.log(`Progresso: ${percent}%`) // Log para depuração
      setProgress(percent) // Atualiza o estado de progresso
    })

    // Escuta o evento de atualização baixada
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
    setProgress(0) // Reinicia o progresso
    setIsDownloading(true) // Ativa o estado de download para exibir a barra
    window.electronAPI.downloadUpdate() // Chama a função para baixar a atualização
  }

  useEffect(() => {
    async function fetchVersion() {
      const appVersion = await window.electronAPI.getVersion()
      setVersion(appVersion)
    }
    fetchVersion()
  }, [])

  useEffect(() => {
    if (selectedRow?.Referencia && readFolderPath) {
      loadPhoto(selectedRow)
    }
  }, [selectedRow, readFolderPath])

  const loadPhoto = async row => {
    if (row?.Referencia && readFolderPath) {
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
  }

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

  const [isOpen, setIsOpen] = useState(false)

  const handleSelectFile = async () => {
    try {
      const result = await window.electronAPI.openExcelFile()
      if (result.success) {
        setExcelData(result.data)
        if (result.data.length > 0) {
          setSelectedRow(result.data[0])
        }
        toast({
          title: 'Arquivo Excel carregado com sucesso!',
          className: 'bg-green-800 text-white',
        })
      } else {
        toast({
          title: 'Erro ao carregar arquivo Excel',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao selecionar arquivo',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleSelectReadFolder = async () => {
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

  const handleSelectWriteFolder = async () => {
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

  const handleSaveSettings = async () => {
    try {
      const settings = {
        readFolderPath,
        writeFolderPath,
      }
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

  const handleSaveProgram = async () => {
    try {
      const result = await window.electronAPI.loadSettings()

      if (result.success && result.settings) {
        const writeFolderPath = result.settings.writeFolderPath

        if (!writeFolderPath) {
          toast({
            title: 'Pasta de gravação não definida nas configurações.',
            variant: 'destructive',
          })
          return
        }

        if (photoSectionRef.current) {
          const fileName = `${selectedRow?.['Op Interna']}_${selectedRow?.['Op Cliente']}_${selectedRow?.Cliente}.jpeg`
          await saveProgrammingMass(fileName, writeFolderPath, photoSectionRef)
          toast({
            title: `Imagem ${fileName} salva com sucesso!`,
            description: 'A programação foi capturada e salva.',
            className: 'bg-green-800 text-white',
          })
        } else {
          toast({
            title: 'Erro',
            description:
              'Elemento photo-section não foi encontrado ou ainda não foi renderizado.',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Erro ao carregar as configurações',
          description: 'Configurações inválidas ou não encontradas.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar a programação',
        description: error.message,
        variant: 'destructive',
      })
    }
  }
  // Função para salvar em massa todas as programações

  const handleSaveProgramMass = async () => {
    if (!writeFolderPath) {
      toast({
        title: 'Pasta de gravação não definida nas configurações.',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    if (!excelData || excelData.length === 0) {
      toast({
        title: 'Nenhum dado Excel disponível para salvar',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    // Iterar sobre todas as linhas do Excel e salvar cada programação
    for (const row of excelData) {
      setSelectedRow(row) // Atualiza a linha selecionada
      await loadPhoto(row) // Carrega a foto da linha

      // Adiciona um atraso para garantir que a foto seja renderizada no photo-box
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 segundo de atraso

      const fileName = `${row?.['Op Interna']}_${row?.['Op Cliente']}_${row?.Cliente}.jpeg`
      await saveProgrammingMass(fileName, writeFolderPath, photoSectionRef)
    }

    toast({
      title: 'Programação em massa salva com sucesso!',
      className: 'bg-green-800 text-white',
    })
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-6">
      <Header
        updateAvailable={updateAvailable}
        handleSelectFile={handleSelectFile}
        handleSaveProgram={handleSaveProgram}
        handleSaveProgramMass={handleSaveProgramMass}
        excelData={excelData}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      <SettingsDialog
        isOpen={isSettingsOpen}
        setIsOpen={setIsSettingsOpen}
        readFolderPath={readFolderPath}
        writeFolderPath={writeFolderPath}
        handleSelectReadFolder={handleSelectReadFolder}
        handleSelectWriteFolder={handleSelectWriteFolder}
        handleSaveSettings={handleSaveSettings}
      />
      {isDownloading && (
        <div className="my-4">
          <Progress value={progress} className="w-full" />
          <p>{`Progresso do download: ${Math.round(progress)}%`}</p>
        </div>
      )}
      <div className="flex gap-6">
        <TableSection excelData={excelData} setSelectedRow={setSelectedRow} />
        <PhotoSection
          photoUrl={photoUrl}
          selectedRow={selectedRow}
          photoSectionRef={photoSectionRef}
          photoBoxRef={photoBoxRef}
        />
      </div>
      <Toaster />
      <Footer version={version} />
    </div>
  )
}

export default App
