import { ReactNode } from 'react';
import { ThemeTokens } from '../../theme/tokens';

interface MobileListProps<T> {
  t: ThemeTokens;
  rows: T[];
  rowKey: (row: T) => string;
  renderItem: (row: T) => ReactNode;
  /** Plain-language empty state, e.g. "No leave requests pending." Defaults to a generic message. */
  emptyMessage?: string;
}

export function MobileList<T>({ t, rows, rowKey, renderItem, emptyMessage }: MobileListProps<T>) {
  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden' }}>
      {rows.map((row, i) => (
        <div
          key={rowKey(row)}
          style={{
            padding: '14px',
            minHeight: 44,
            borderTop: i === 0 ? 'none' : `1px solid ${t.border}`,
            background: t.surface,
          }}
        >
          {renderItem(row)}
        </div>
      ))}
      {rows.length === 0 && (
        <div style={{ padding: 20, textAlign: 'center', color: t.textFaint, fontSize: 13 }}>
          {emptyMessage ?? 'No records to show.'}
        </div>
      )}
    </div>
  );
}
