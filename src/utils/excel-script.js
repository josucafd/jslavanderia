const selectFileBtn = document.getElementById('selectFileBtn')
const contentDiv = document.getElementById('content')
const infoCliente = document.getElementById('info-cliente')
const infoOpInterna = document.getElementById('info-op-interna')
const infoOpCliente = document.getElementById('info-op-cliente')
const infoReferencia = document.getElementById('info-referencia')
const infoQuantidade = document.getElementById('info-quantidade')

function updateInfoBox(row) {
  infoCliente.textContent = row['Cliente'] || 'N/A'
  infoOpInterna.textContent = row['Op Interna'] || 'N/A'
  infoOpCliente.textContent = row['Op Cliente'] || 'N/A'
  infoReferencia.textContent = row['Referencia'] || 'N/A'
  infoQuantidade.textContent = row['Quantidade'] || 'N/A'
}

function createTable(data) {
  const table = document.createElement('table')
  table.className = 'w-full caption-bottom text-sm'
  const headers = Object.keys(data[0])

  // Cria o cabeçalho da tabela
  const thead = document.createElement('thead')
  thead.className = '[&_tr]:border-b'
  const headerRow = document.createElement('tr')
  headers.forEach(header => {
    const th = document.createElement('th')
    th.textContent = header
    th.className =
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'
    headerRow.appendChild(th)
  })
  thead.appendChild(headerRow)
  table.appendChild(thead)

  // Cria as linhas de dados
  const tbody = document.createElement('tbody')
  tbody.className = '[&_tr:last-child]:border-0'
  data.forEach(row => {
    const tr = document.createElement('tr')
    tr.className =
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer'
    headers.forEach(header => {
      const td = document.createElement('td')
      td.textContent = row[header] || ''
      td.className = 'p-4 align-middle [&:has([role=checkbox])]:pr-0'
      tr.appendChild(td)
    })
    tr.addEventListener('click', () => updateInfoBox(row))
    tbody.appendChild(tr)
  })
  table.appendChild(tbody)

  return table
}

selectFileBtn.addEventListener('click', async () => {
  const result = await window.electronAPI.openExcelFile()

  if (result.success) {
    const table = createTable(result.data)

    // Exibe a tabela
    contentDiv.innerHTML = ''
    contentDiv.appendChild(table)

    // Atualiza a info-box com os dados da primeira linha
    if (result.data.length > 0) {
      updateInfoBox(result.data[0])
    }
  } else {
    contentDiv.textContent = `Erro: ${result.message}`
    contentDiv.className = 'text-destructive mt-4'
  }
})
