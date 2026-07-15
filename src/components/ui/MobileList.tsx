import { ReactNode } from 'react';
import { ThemeTokens } from '../../theme/tokens';

interface MobileListProps<T> {
  t: ThemeTokens;
  rows: T[];
  rowKey: (row: T) => string;
  renderItem: (row: T) => ReactNode;
}

export function MobileList<T>({ t, rows, rowKey, renderItem }: MobileListProps<T>) {
  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden' }}>
      {rows.map((row, i) => (
        <div
          key={rowKey(row)}
          style={{
            padding: '12px 14px',
            borderTop: i === 0 ? 'none' : `1px solid ${t.border}`,
            background: t.surface,
          }}
        >
          {renderItem(row)}
        </div>
      ))}
      {rows.length === 0 && (
        <div style={{ padding: 16, textAlign: 'center', color: t.textFaint, fontSize: 13 }}>No records</div>
      )}
    </div>
  );
}
