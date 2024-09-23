import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Folder, X } from 'lucide-react'

const SettingsDialog = ({
  isOpen,
  setIsOpen,
  readFolderPath,
  writeFolderPath,
  handleSelectReadFolder,
  handleSelectWriteFolder,
  handleSaveSettings,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Configure as pastas de leitura e gravação das imagens
          </DialogDescription>
        </DialogHeader>
        <div className="text-xl flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span>Pasta de Leitura:</span>
            <div className="flex items-center gap-2">
              {!readFolderPath ? (
                <Button variant="outline" onClick={handleSelectReadFolder}>
                  <Folder className="h-4 w-4 mr-2" />
                  Selecionar
                </Button>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground">
                    {readFolderPath}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setReadFolderPath('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span>Pasta de Gravação:</span>
            <div className="flex items-center gap-2">
              {!writeFolderPath ? (
                <Button variant="outline" onClick={handleSelectWriteFolder}>
                  <Folder className="h-4 w-4 mr-2" />
                  Selecionar
                </Button>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground">
                    {writeFolderPath}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setWriteFolderPath('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              handleSaveSettings()
              setIsOpen(false)
            }}
          >
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog
