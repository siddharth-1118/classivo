import React from 'react';
import { Search } from 'lucide-react';
import EmptyState from './EmptyState';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  onSearchChange?: (value: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  actions?: (item: T) => React.ReactNode;
}

export default function DataTable<T extends { id: string | number }>({ 
  columns, 
  data, 
  loading, 
  onRowClick, 
  searchable, 
  onSearchChange,
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display at this time.",
  actions
}: DataTableProps<T>) {
  // Use searchable and onSearchChange in the future or for UI flags
  const showSearch = searchable && onSearchChange;

  if (loading) {
    return (
      <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table className="table" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
            {columns.map((col, idx) => (
              <th key={idx} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px solid var(--border-subtle)' }}>
                {col.header}
              </th>
            ))}
            {actions && <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border-subtle)' }} />}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr 
              key={item.id} 
              onClick={() => onRowClick?.(item)}
              style={{ 
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.2s ease',
                borderBottom: '1px solid var(--border-subtle)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} style={{ padding: '16px', color: 'var(--text-primary)', fontSize: '14px' }}>
                  {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                </td>
              ))}
              {actions && (
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  {actions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
