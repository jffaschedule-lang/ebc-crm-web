import { ReactNode } from 'react';
import { ThemeTokens } from '../../theme/tokens';
import { Breakpoint } from '../../hooks/useBreakpoint';
import { FONT_MONO } from '../../theme/typography';

export interface RTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Breakpoints at which this column is hidden, e.g. ['md', 'lg']. */
  hideAt?: Breakpoint[];
  /** Numeric/date/id columns: right-aligned, tabular-nums monospace so values line up in a column. */
  numeric?: boolean;
}

interface RTableProps<T> {
  t: ThemeTokens;
  bp: Breakpoint;
  cols: RTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Plain-language empty state, e.g. "No leave requests pending." Defaults to a generic message. */
  emptyMessage?: string;
  /** Caps the scroll area height so the sticky header actually has something to stick within. */
  maxHeight?: number;
}

export function RTable<T>({ t, bp, cols, rows, rowKey, emptyMessage, maxHeight }: RTableProps<T>) {
  const visibleCols = cols.filter((c) => !c.hideAt?.includes(bp));

  return (
    <div
      className="rtable-scroll"
      style={{ border: `1px solid ${t.border}`, borderRadius: 10, maxHeight }}
    >
      <table className="rtable" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {visibleCols.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: col.numeric ? 'right' : 'left',
                  padding: '8px 12px',
                  fontSize: 11,
                  fontWeight: 600,
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
                <td
                  key={col.key}
                  style={{
                    padding: '8px 12px',
                    color: t.text,
                    textAlign: col.numeric ? 'right' : 'left',
                    fontFamily: col.numeric ? FONT_MONO : undefined,
                    fontVariantNumeric: col.numeric ? 'tabular-nums' : undefined,
                  }}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={visibleCols.length} style={{ padding: 20, textAlign: 'center', color: t.textFaint, fontSize: 13 }}>
                {emptyMessage ?? 'No records to show.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
