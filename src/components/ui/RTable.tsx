import { ReactNode } from 'react';
import { ThemeTokens } from '../../theme/tokens';
import { Breakpoint } from '../../hooks/useBreakpoint';

export interface RTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Breakpoints at which this column is hidden, e.g. ['md', 'lg']. */
  hideAt?: Breakpoint[];
}

interface RTableProps<T> {
  t: ThemeTokens;
  bp: Breakpoint;
  cols: RTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}

export function RTable<T>({ t, bp, cols, rows, rowKey }: RTableProps<T>) {
  const visibleCols = cols.filter((c) => !c.hideAt?.includes(bp));

  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${t.border}`, borderRadius: 10 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: t.surfaceAlt }}>
            {visibleCols.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color: t.textMuted,
                  borderBottom: `1px solid ${t.border}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} style={{ borderBottom: `1px solid ${t.border}` }}>
              {visibleCols.map((col) => (
                <td key={col.key} style={{ padding: '8px 12px', color: t.text }}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={visibleCols.length} style={{ padding: 16, textAlign: 'center', color: t.textFaint }}>
                No records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
