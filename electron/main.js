// main.js
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  protocol,
  Menu,
  globalShortcut,
  shell,
} = require('electron')
const path = require('node:path')
const XLSX = require('xlsx')
const url = require('node:url')
const fs = require('node:fs').promises
const fsPromises = require('node:fs').promises

const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

// Configuração do log
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('App iniciado')

const configFilePath = path.join(app.getPath('userData'), 'config.json')

// Definir o caminho para o package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json')

// -----------------------------
// Conexão com o banco de dados PostgreSQL
// -----------------------------
const { Pool } = require('pg')

// Configure o pool com os dados do seu banco hospedado em 192.168.75.249
const dbPool = new Pool({
  host: '192.168.75.249',
  database: 'nocobase',
  user: 'postgres',
  password: 'j8kdaC6dYYwsjs5',
  port: 5432,
})

// Função que executa a consulta com os JOINs necessários
async function fetchProgrammingData() {
  const query = `
    SELECT
      p.op_interna AS "Op Interna",
      p.op_cliente AS "Op Cliente",
      r.referencia AS "Referencia",
      cf.fantasia AS "Cliente",
      p.qtd_op AS "Quantidade"
    FROM public.tb_programacoes p
    LEFT JOIN public.tb_referencias r ON p.id_referencia = r.id_referencia
    LEFT JOIN public.tb_clientes_fornecedores cf ON p.id_cliente_fornecedor = cf.id_cliente_fornecedor;
  `
  // console.log('Executando query:', query) // Adicione este log
  try {
    const result = await dbPool.query(query)
    return result.rows
  } catch (error) {
    console.error('Erro ao consultar dados do banco:', error)
    throw error
  }
}

// Expor a função via IPC para que o renderer possa chamá-la
ipcMain.handle('fetch-programming-data', async () => {
  return await fetchProgrammingData()
})

// Ler o package.json e salvar a versão no config.json
async function loadAndSaveVersion() {
  try {
    // Ler a versão do package.json
    const data = await fs.readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(data)
    const appVersion = packageJson.version

    // Carregar o arquivo de configuração existente
    let configData = {}
    try {
      const configFile = await fs.readFile(configFilePath, 'utf-8')
      configData = JSON.parse(configFile)
    } catch (error) {
      log.warn('Nenhum arquivo de configuração encontrado. Criando um novo.')
    }

    // Atualizar o arquivo de configuração com a versão
    configData.version = appVersion

    // Salvar o arquivo de configuração atualizado
    await fs.writeFile(configFilePath, JSON.stringify(configData, null, 2))
    log.info(`Versão ${appVersion} salva no arquivo de configuração.`)

    return appVersion
  } catch (error) {
    log.error(
      'Erro ao ler package.json ou salvar a versão no config.json:',
      error
    )
    return null
  }
}

let win // Tornar a variável global

function createSocialWindow() {
  const socialWindow = new BrowserWindow({
    width: 320,
    height: 435,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const port = process.env.PORT || 5173
  const socialUrl = `http://localhost:${port}/social`

  if (process.env.NODE_ENV === 'development') {
    log.info(`Carregando URL social: ${socialUrl}`)
    socialWindow.loadURL(socialUrl)
  } else {
    const socialPath = path.join(__dirname, '..', 'dist', 'social.html')
    log.info(`Carregando arquivo social: ${socialPath}`)
    socialWindow.loadFile(socialPath)
  }

  socialWindow.webContents.on(
    'did-fail-load',
    (event, errorCode, errorDescription) => {
      log.error('Falha ao carregar janela social:', errorCode, errorDescription)
    }
  )

  // Opcional: Abra o DevTools para depuração
  // if (process.env.NODE_ENV === 'development') {
  //   socialWindow.webContents.openDevTools()
  // }
}

// Adicione este manipulador de eventos
ipcMain.on('open-social-window', () => {
  try {
    createSocialWindow()
  } catch (error) {
    log.error('Erro ao abrir janela social:', error)
  }
})

ipcMain.handle('open-external-link', async (event, url) => {
  try {
    await shell.openExternal(url)
    return { success: true }
  } catch (error) {
    log.error('Erro ao abrir link externo:', error)
    return { success: false, error: error.message }
  }
})

function createWindow() {
  log.info('Criando janela principal')
  win = new BrowserWindow({
    width: 1200,
    height: 785,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Remove o menu padrão
  Menu.setApplicationMenu(null)

  // Evento quando uma atualização está disponível
  autoUpdater.on('update-available', () => {
    win.webContents.send('update-available')
  })

  // Evento quando a atualização foi baixada
  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-downloaded')
  })

  autoUpdater.on('download-progress', progressObj => {
    const logMessage = `Downloaded ${Math.round(progressObj.percent)}%`
    log.info(logMessage)
    win.webContents.send('download-progress', progressObj.percent)
  })

  autoUpdater.on('error', error => {
    log.error('Erro durante a atualização:', error)
    win.webContents.send('update-error', error.message)
  })

  autoUpdater.autoDownload = false // Evita baixar automaticamente

  const port = process.env.PORT || 5173
  const appUrl = `http://localhost:${port}`

  if (process.env.NODE_ENV === 'development') {
    log.info(`Carregando URL: ${appUrl}`)
    win.loadURL(appUrl)
    win.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
    log.info(`Carregando arquivo: ${indexPath}`)
    win.loadFile(indexPath)
  }

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log.error('Falha ao carregar:', errorCode, errorDescription)
  })

  // Registrar o atalho para abrir o DevTools
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    win.webContents.toggleDevTools()
  })

  return win
}

// Inicializa o app
app
  .whenReady()
  .then(() => {
    protocol.registerFileProtocol('safe-file', (request, callback) => {
      const filePath = decodeURIComponent(
        request.url.replace('safe-file://', '')
      )
      const normalizedPath = path.normalize(filePath)
      callback({ path: normalizedPath })
    })

    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
  .catch(error => {
    log.error('Erro ao inicializar o app:', error)
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Checar atualizações ao inicializar
ipcMain.handle('check-for-updates', () => {
  try {
    autoUpdater.checkForUpdates()
  } catch (error) {
    log.error('Erro ao verificar atualizações:', error)
    return { success: false, message: error.message }
  }
})

// Baixar a atualização
ipcMain.handle('download-update', () => {
  try {
    autoUpdater.downloadUpdate()
  } catch (error) {
    log.error('Erro ao baixar atualização:', error)
    return { success: false, message: error.message }
  }
})

// Reiniciar e aplicar atualização
ipcMain.handle('restart-app', () => {
  try {
    autoUpdater.quitAndInstall()
  } catch (error) {
    log.error('Erro ao reiniciar e aplicar atualização:', error)
    return { success: false, message: error.message }
  }
})

// Expor a versão via IPC
ipcMain.handle('get-version', async () => {
  try {
    const appVersion = await loadAndSaveVersion()
    return appVersion || 'Versão não encontrada'
  } catch (error) {
    log.error('Erro ao obter versão:', error)
    return 'Erro ao obter versão'
  }
})

ipcMain.handle('open-excel-file', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      filters: [{ name: 'Arquivos Excel', extensions: ['xlsx', 'xls'] }],
      properties: ['openFile'],
    })

    if (canceled || filePaths.length === 0) {
      return { success: false, message: 'Nenhum arquivo selecionado.' }
    }

    const filePath = filePaths[0]
    const workbook = XLSX.readFile(filePath)
    const sheetNames = workbook.SheetNames
    const firstSheet = workbook.Sheets[sheetNames[0]]
    const data = XLSX.utils.sheet_to_json(firstSheet)

    return { success: true, data }
  } catch (error) {
    log.error('Erro ao abrir arquivo Excel:', error)
    return { success: false, message: error.message }
  }
})

ipcMain.handle('select-read-folder', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (result.canceled) {
      return { success: false, message: 'Seleção cancelada' }
    }
    return { success: true, path: result.filePaths[0] }
  } catch (error) {
    log.error('Erro ao selecionar pasta de leitura:', error)
    return { success: false, message: error.message }
  }
})

ipcMain.handle('select-write-folder', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (result.canceled) {
      return { success: false, message: 'Seleção cancelada' }
    }
    return { success: true, path: result.filePaths[0] }
  } catch (error) {
    log.error('Erro ao selecionar pasta de escrita:', error)
    return { success: false, message: error.message }
  }
})

ipcMain.handle('read-image-file', async (event, filePath) => {
  try {
    const data = await fs.readFile(filePath)
    const base64 = data.toString('base64')
    return { success: true, data: `data:image/jpeg;base64,${base64}` }
  } catch (error) {
    log.error('Erro ao ler arquivo de imagem:', error)
    return { success: false, message: 'Erro ao ler arquivo de imagem' }
  }
})

ipcMain.handle('get-photo-url', async (event, filePath) => {
  try {
    if (filePath.startsWith('safe-file://')) {
      return filePath // Já está no formato correto
    }
    // Remove caracteres de escape e converte para o formato correto
    const normalizedPath = filePath.replace(/\\/g, '/')
    const safeFileUrl = `safe-file://${normalizedPath}`
    log.info('URL da foto gerada:', safeFileUrl)
    return safeFileUrl
  } catch (error) {
    log.error('Erro ao obter URL da foto:', error)
    throw error
  }
})

ipcMain.handle('join-path', (event, dir, file) => {
  try {
    log.info('Juntando caminhos:', dir, file)
    const joinedPath = path.join(dir, file)
    log.info('Caminho juntado:', joinedPath)
    return joinedPath
  } catch (error) {
    log.error('Erro ao juntar caminhos:', error)
    throw error
  }
})

ipcMain.handle('read-dir', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath)
    return files
  } catch (error) {
    log.error('Erro ao ler diretório:', error)
    throw error
  }
})

ipcMain.handle('find-photo', async (event, dirPath, referencia) => {
  try {
    await fs.access(dirPath)
    const files = await fs.readdir(dirPath)

    const matchingFile = files.find(file => {
      const baseName = file.replace(/(F \(1\)|F|T)/i, '')
      return baseName.startsWith(referencia)
    })

    if (matchingFile) {
      const imagePath = path.join(dirPath, matchingFile)
      const imageUrl = `safe-file://${imagePath.replace(/\\/g, '/')}`
      log.info('URL da imagem encontrada:', imageUrl)
      return { success: true, imageUrl }
    }
    return {
      success: false,

      message: `Nenhuma foto encontrada com a referência: ${referencia}`,
    }
  } catch (error) {
    log.error('Erro ao procurar foto:', error)
    return {
      success: false,
      message: `Erro ao procurar foto: ${error.message}`,
    }
  }
})

// Função para salvar as configurações no arquivo config.json
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    // Salvar configurações como JSON
    await fs.writeFile(configFilePath, JSON.stringify(settings, null, 2))
    return { success: true }
  } catch (error) {
    log.error('Erro ao salvar configurações:', error)
    return { success: false, message: error.message }
  }
})

// Função para carregar as configurações do arquivo config.json
ipcMain.handle('load-settings', async () => {
  try {
    // Verificar se o arquivo de configuração existe
    const data = await fs.readFile(configFilePath, 'utf-8')
    const settings = JSON.parse(data)
    return { success: true, settings }
  } catch (error) {
    if (error.code === 'ENOENT') {
      log.warn('Arquivo de configuração não encontrado, usando padrões.')
      return { success: false, settings: null }
    }
    log.error('Erro ao carregar configurações:', error)
    return { success: false, message: error.message }
  }
})

ipcMain.handle(
  'save-program',
  async (event, { base64Data, fileName, writeFolderPath }) => {
    try {
      const filePath = path.join(writeFolderPath, fileName)

      // Salvar a imagem no sistema de arquivos
      await fs.writeFile(filePath, base64Data, 'base64')
      log.info(`Imagem salva em: ${filePath}`)
      return { success: true, message: 'Imagem salva com sucesso!' }
    } catch (error) {
      log.error('Erro ao salvar a imagem:', error)
      return { success: false, message: error.message }
    }
  }
)

// Função para ler a imagem e retornar como base64
ipcMain.handle('load-image-base64', async (event, filePath) => {
  try {
    // Decodifica o caminho para lidar com caracteres especiais
    const decodedPath = decodeURIComponent(filePath.replace('safe-file://', ''))
    console.log('Caminho da imagem decodificado:', decodedPath)

    const data = await fs.readFile(decodedPath)
    const base64Data = data.toString('base64')
    return `data:image/jpeg;base64,${base64Data}`
  } catch (error) {
    console.error('Erro ao carregar a imagem:', error)
    return { success: false, message: error.message }
  }
})

// Função para salvar as imagens capturadas no sistema de arquivos
ipcMain.handle(
  'save-programming-mass',
  async (event, { fileName, imageData, writeFolderPath }) => {
    try {
      if (!writeFolderPath) {
        throw new Error('Caminho da pasta de gravação não definido.')
      }

      // Cria a pasta, se não existir
      const savePath = path.resolve(writeFolderPath)
      await fs.mkdir(savePath, { recursive: true })

      const fullPath = path.join(savePath, fileName)
      const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '')

      // Salva o arquivo
      await fs.writeFile(fullPath, base64Data, 'base64')
      console.log(`Imagem salva com sucesso: ${fullPath}`)

      // Retorna objeto com success
      return { success: true, path: fullPath }
    } catch (error) {
      console.error('Erro ao salvar a imagem:', error)
      return { success: false, message: error.message }
    }
  }
)

// Atualiza o status_impresso para true no registro da programação
ipcMain.handle('update-printed-status', async (event, recordId) => {
  const query = `
    UPDATE public.tb_programacoes
    SET status_impresso = true
    WHERE id_programacao = $1
  `
  try {
    const result = await dbPool.query(query, [recordId])
    return { success: true, affectedRows: result.rowCount }
  } catch (error) {
    console.error('Erro ao atualizar status impresso:', error)
    return { success: false, message: error.message }
  }
})

// Busca registros com filtros: data de emissão e somente registros não impressos
ipcMain.handle('fetch-programming-data-filtered', async (event, filters) => {
  let query = `
    SELECT p.id_programacao,
           p.data_emissao AS "Data Emissão",
           p.op_interna AS "Op Interna",
           p.op_cliente AS "Op Cliente",
           r.referencia AS "Referencia",
           cf.fantasia AS "Cliente",
           p.qtd_op AS "Quantidade",
           p.status_impresso AS "Status"
    FROM public.tb_programacoes p
    LEFT JOIN public.tb_referencias r ON p.id_referencia = r.id_referencia
    LEFT JOIN public.tb_clientes_fornecedores cf ON p.id_cliente_fornecedor = cf.id_cliente_fornecedor
    WHERE 1=1
  `
  const params = []

  if (filters.dataEmissaoInicial) {
    params.push(filters.dataEmissaoInicial)
    query += ` AND p.data_emissao >= $${params.length}`
  }
  if (filters.dataEmissaoFinal) {
    params.push(filters.dataEmissaoFinal)
    query += ` AND p.data_emissao <= $${params.length}`
  }

  if (filters.somenteNaoImpresso === true) {
    query += ` AND (p.status_impresso = false OR p.status_impresso IS NULL)`
  } else if (filters.somenteNaoImpresso === false) {
    query += ` AND p.status_impresso = true`
  }
  try {
    const result = await dbPool.query(query, params)
    return result.rows
  } catch (error) {
    console.error('Erro ao buscar dados filtrados:', error)
    throw error
  }
})
