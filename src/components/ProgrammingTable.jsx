// src/components/ProgrammingTable.jsx
import React, { useState, useEffect } from 'react'

const ProgrammingTable = ({ setSelectedRow, reloadKey, onDataLoaded }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataEmissaoInicial, setDataEmissaoInicial] = useState('')
  const [dataEmissaoFinal, setDataEmissaoFinal] = useState('')
  const [somenteNaoImpresso, setSomenteNaoImpresso] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await window.electronAPI.fetchProgrammingDataFiltered({
        dataEmissaoInicial: dataEmissaoInicial || null,
        dataEmissaoFinal: dataEmissaoFinal || null,
        somenteNaoImpresso,
      })
      setData(result)
      onDataLoaded(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Recarrega os dados sempre que os filtros ou reloadKey mudam
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, dataEmissaoInicial, dataEmissaoFinal, somenteNaoImpresso])

  const resetFilters = () => {
    setDataEmissaoInicial('')
    setDataEmissaoFinal('')
    setSomenteNaoImpresso(true)
  }

  return (
    <div>
      {/* Controles de Filtro */}
      <div className="flex justify-between items-center gap-4 mb-6 pr-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap">Data Emissão Inicial:</label>
            <input
              type="date"
              value={dataEmissaoInicial}
              onChange={e => setDataEmissaoInicial(e.target.value)}
              className="border p-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap">Data Emissão Final:</label>
            <input
              type="date"
              value={dataEmissaoFinal}
              onChange={e => setDataEmissaoFinal(e.target.value)}
              className="border p-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={somenteNaoImpresso}
              onChange={e => setSomenteNaoImpresso(e.target.checked)}
            />
            <label>Somente não impresso</label>
          </div>
        </div>
        <button
          onClick={resetFilters}
          className="bg-gray-500 text-white px-4 py-1 rounded"
        >
          Resetar Filtros
        </button>
      </div>

      {/* Container da Tabela com padding lateral e rolagem */}
      <div className="pr-6 overflow-y-auto max-h-[calc(100vh-400px)]">
        {loading ? (
          <div>Carregando dados...</div>
        ) : error ? (
          <div>Erro ao carregar os dados: {error.message}</div>
        ) : (
          <table
            border="1"
            cellPadding="8"
            className="w-full text-center border-collapse"
          >
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-2">Data Emissão</th>
                <th className="p-2">Op Interna</th>
                <th className="p-2">Op Cliente</th>
                <th className="p-2">Referencia</th>
                <th className="p-2">Cliente</th>
                <th className="p-2">Quantidade</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={row.id_programacao || index}
                  onClick={() => setSelectedRow(row)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="p-2">
                    {row['Data Emissão']
                      ? new Date(row['Data Emissão']).toLocaleDateString()
                      : ''}
                  </td>
                  <td className="p-2">{row['Op Interna']}</td>
                  <td className="p-2">{row['Op Cliente']}</td>
                  <td className="p-2">{row.Referencia}</td>
                  <td className="p-2">{row.Cliente}</td>
                  <td className="p-2">{row.Quantidade}</td>
                  <td className="p-2">
                    {row.Status ? 'Impresso' : 'Não Impresso'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ProgrammingTable
