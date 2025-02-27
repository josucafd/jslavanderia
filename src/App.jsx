// src/App.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Toaster } from './components/ui/toaster'
import { Progress } from './components/ui/progress'
import Header from './components/gerador-fotos/Header'
import SettingsDialog from './components/gerador-fotos/SettingsDialog'
import PhotoSection from './components/gerador-fotos/PhotoSection'
import Footer from './components/gerador-fotos/Footer'
import { saveProgrammingMass } from './utils/saveProgrammingMass'
import { useUpdate } from './hooks/useUpdate'
import { useSettings } from './hooks/useSettings'
import { usePhotoLoader } from './hooks/usePhotoLoader'
import { useToast } from './hooks/use-toast'
import ProgrammingTable from './components/ProgrammingTable'

function App() {
  const [version, setVersion] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [filteredData, setFilteredData] = useState([]) // armazena o resultado do filtro
  const [reloadKey, setReloadKey] = useState(0) // força recarregar a tabela

  const photoSectionRef = useRef(null)
  const { toast } = useToast()
  const { updateAvailable, progress, isDownloading } = useUpdate()
  const {
    readFolderPath,
    writeFolderPath,
    selectReadFolder,
    selectWriteFolder,
    saveSettings,
  } = useSettings()
  const { photoUrl } = usePhotoLoader(selectedRow, readFolderPath)

  useEffect(() => {
    async function fetchVersion() {
      const appVersion = await window.electronAPI.getVersion()
      setVersion(appVersion)
    }
    fetchVersion()
  }, [])

  // Salvar registro único (já funciona)
  const handleSaveProgram = async () => {
    if (!selectedRow) {
      toast({
        title: 'Nenhuma programação selecionada.',
        variant: 'destructive',
      })
      return
    }
    if (!writeFolderPath) {
      toast({
        title: 'Pasta de gravação não definida.',
        variant: 'destructive',
      })
      return
    }
    if (!photoSectionRef.current) {
      toast({
        title: 'Erro',
        description: 'Elemento photo-section não encontrado.',
        variant: 'destructive',
      })
      return
    }
    try {
      const fileName = `${selectedRow['Op Interna']}_${selectedRow['Op Cliente']}_${selectedRow.Cliente}.jpeg`
      const saveResult = await saveProgrammingMass(
        fileName,
        writeFolderPath,
        photoSectionRef
      )
      if (saveResult.success) {
        if (selectedRow.id_programacao) {
          const updateResult = await window.electronAPI.updatePrintedStatus(
            selectedRow.id_programacao
          )
          if (!updateResult.success) {
            console.error(
              `Erro ao atualizar registro ${selectedRow.id_programacao}:`,
              updateResult.message
            )
          }
        }
        toast({
          title: `Imagem ${fileName} salva com sucesso!`,
          description: 'Programação salva.',
          className: 'bg-green-800 text-white',
        })
        setReloadKey(prev => prev + 1)
      } else {
        toast({
          title: `Erro ao salvar ${fileName}`,
          description: saveResult.message,
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

  // Salvar todos os registros filtrados
  const handleSaveProgramMass = async () => {
    if (!writeFolderPath) {
      toast({
        title: 'Pasta de gravação não definida.',
        variant: 'destructive',
      })
      return
    }
    if (!filteredData || filteredData.length === 0) {
      toast({
        title: 'Nenhum registro no filtro para salvar.',
        variant: 'destructive',
      })
      return
    }
    try {
      for (const row of filteredData) {
        setSelectedRow(row)
        // aguarda a atualização da foto
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (!photoSectionRef.current) {
          console.error('Elemento photo-section não encontrado.')
          continue
        }

        const fileName = `${row['Op Interna']}_${row['Op Cliente']}_${row.Cliente}.jpeg`
        const saveResult = await saveProgrammingMass(
          fileName,
          writeFolderPath,
          photoSectionRef
        )
        if (saveResult.success && row.id_programacao) {
          const updateResult = await window.electronAPI.updatePrintedStatus(
            row.id_programacao
          )
          if (!updateResult.success) {
            console.error(
              `Erro ao atualizar registro ${row.id_programacao}:`,
              updateResult.message
            )
          }
        } else if (!saveResult.success) {
          console.error(
            `Erro ao salvar imagem do registro ${row.id_programacao}:`,
            saveResult.message
          )
        }
      }
      toast({
        title: 'Programação em massa salva com sucesso!',
        className: 'bg-green-800 text-white',
      })
      setReloadKey(prev => prev + 1)
    } catch (error) {
      toast({
        title: 'Erro ao salvar em massa',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-6">
      <Header
        updateAvailable={updateAvailable}
        handleSaveProgram={handleSaveProgram}
        handleSaveProgramMass={handleSaveProgramMass}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      <SettingsDialog
        isOpen={isSettingsOpen}
        setIsOpen={setIsSettingsOpen}
        readFolderPath={readFolderPath}
        writeFolderPath={writeFolderPath}
        handleSelectReadFolder={selectReadFolder}
        handleSelectWriteFolder={selectWriteFolder}
        handleSaveSettings={saveSettings}
      />
      {isDownloading && (
        <div className="my-4">
          <Progress value={progress} className="w-full" />
          <p>{`Progresso do download: ${Math.round(progress)}%`}</p>
        </div>
      )}
      <div className="flex gap-6">
        {/* Área da Tabela com rolagem */}
        <div className="flex-grow h-[calc(100vh-200px)] overflow-y-auto">
          <ProgrammingTable
            setSelectedRow={setSelectedRow}
            reloadKey={reloadKey}
            onDataLoaded={data => setFilteredData(data)}
          />
        </div>
        {/* Seção da Foto fixa */}
        <div className="w-[300px]">
          <PhotoSection
            photoUrl={photoUrl}
            selectedRow={selectedRow}
            photoSectionRef={photoSectionRef}
          />
        </div>
      </div>
      <Toaster />
      <Footer version={version} />
    </div>
  )
}

export default App
