import React from 'react'
import { Button } from './components/ui/button'
import { Instagram, Mail, Phone } from 'lucide-react'

const Social = () => {
  const handleOpenLink = async url => {
    console.log('Tentando abrir URL:', url) // Adicione esta linha
    try {
      const result = await window.electronAPI.openExternalLink(url)
      if (!result.success) {
        console.error('Falha ao abrir link:', result.error)
      } else {
        console.log('Link aberto com sucesso')
      }
    } catch (error) {
      console.error('Erro ao tentar abrir link:', error)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container max-w-md text-center p-6 bg-white shadow-lg rounded-lg">
        <img
          src="./src/assets/perfil.jpeg"
          alt="Josué Figueredo Delfino"
          className="w-32 h-32 rounded-full mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold mb-6">Josué F. Delfino</h1>

        <div className="space-y-4">
          <Button
            className="w-full flex items-center justify-center space-x-2"
            onClick={() =>
              handleOpenLink('https://www.instagram.com/josucafd/?hl=pt')
            }
          >
            <Instagram className="w-5 h-5" />
            <span>@josucafd</span>
          </Button>

          <Button
            className="w-full flex items-center justify-center space-x-2"
            onClick={() =>
              handleOpenLink(
                'https://api.whatsapp.com/send?phone=5548991888242&text=Ol%C3%A1!%20Seja%20bem%20vindo!'
              )
            }
          >
            <Phone className="w-5 h-5" />
            <span>WhatsApp</span>
          </Button>

          <Button
            className="w-full flex items-center justify-center space-x-2"
            onClick={() =>
              handleOpenLink('mailto:josue.delfino@jslavanderia.com.br')
            }
          >
            <Mail className="w-5 h-5" />
            <span>E-mail</span>
          </Button>
        </div>
      </div>
    </main>
  )
}

export default Social
