import React from 'react'

const Footer = ({ version }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 p-2 max-h-[25px] flex items-center justify-between">
      <span className="text-gray-400 dark:text-gray-300 text-left">
        Desenvolvido por ©{' '}
        <button
          type="button"
          onClick={() => window.electronAPI.openSocialWindow()}
          className="font-bold text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-100 no-underline cursor-pointer"
        >
          Josué Figueredo Delfino
        </button>
      </span>
      <span className="text-gray-400 dark:text-gray-300 text-right">
        Versão: {version}
      </span>
    </footer>
  )
}

export default Footer
