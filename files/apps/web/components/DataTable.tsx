import { useState } from 'react';

export default function DataTable({ columns, data }) {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const pageCount = Math.ceil(data.length / pageSize);
  const items = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr>
            {columns.map(col => <th key={col.accessor} className="px-2 py-1 text-left">{col.Header}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col.accessor} className="border-t px-2 py-1">
                  {typeof col.Cell === 'function' ? col.Cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 flex items-center gap-2">
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">Prev</button>
        <span>Page {page + 1} of {pageCount || 1}</span>
        <button disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}