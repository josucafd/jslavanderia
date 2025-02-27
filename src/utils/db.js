// src/utils/db.js
import { Pool } from 'pg'

// Cria um pool de conexões utilizando as variáveis de ambiente
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_DATABASE || 'nocobase',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'j8kdaC6dYYwsjs5',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
})

export async function fetchProgrammingData() {
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

  try {
    const result = await pool.query(query)
    return result.rows
  } catch (error) {
    console.error('Erro ao executar a query:', error)
    throw error
  }
}
