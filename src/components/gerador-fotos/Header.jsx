import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { AlertTriangle, Settings, Sun, Moon } from 'lucide-react'
import { toast } from '../../hooks/use-toast'

const Header = ({
  updateAvailable,
  handleSaveProgram,
  handleSaveProgramMass,
  setIsSettingsOpen,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Dados Importados</h1>
      <div className="flex items-center space-x-2">
        {updateAvailable && (
          <Button
            // Se necessário, adicione a função simulateUpdate ou outra ação para atualizar
            onClick={() => console.log('Atualizar')}
            className="bg-yellow-800 text-white hover:bg-yellow-700 flex items-center space-x-2"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Atualizar</span>
          </Button>
        )}
        {/* Botões sempre habilitados */}
        <Button onClick={handleSaveProgram}>Salvar Programação</Button>
        <Button onClick={handleSaveProgramMass}>
          Salvar Programação Em Massa
        </Button>
        <Button
          variant="link"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="link" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  )
}

export default Header
