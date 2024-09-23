import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

const TableSection = ({ excelData, setSelectedRow }) => {
  return (
    <div className="flex-grow border rounded-lg p-1">
      {excelData && (
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(excelData[0]).map(header => (
                <TableHead
                  key={header}
                  className="text-gray-900 dark:text-gray-100"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {excelData.map(row => (
              <TableRow
                key={`${row.Cliente}-${row['Op Interna']}-${row['Op Cliente']}`}
                onClick={() => setSelectedRow(row)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {Object.values(row).map((cell, cellIndex) => (
                  <TableCell
                    key={`${row.Cliente}-${row['Op Interna']}-${row['Op Cliente']}-${cellIndex}`}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default TableSection
