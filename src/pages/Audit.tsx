import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useAuditLog } from '../hooks/useAuditLog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { RTable, RTableColumn } from '../components/ui/RTable';
import { Card } from '../components/ui/Card';
import { AuditLogEntry } from '../types/domain';

export default function Audit() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useAuditLog();

  const rows = data?.pages.flat() ?? [];

  const cols: RTableColumn<AuditLogEntry>[] = [
    { key: 'occurred_at', header: 'When', render: (r) => new Date(r.occurred_at).toLocaleString() },
    { key: 'actor_type', header: 'Actor', render: (r) => r.actor_type, hideAt: ['md'] },
    { key: 'action', header: 'Action', render: (r) => r.action },
    { key: 'entry_id', header: 'Entry', render: (r) => r.entry_id ?? '—', hideAt: ['md', 'lg'] },
    { key: 'detail', header: 'Detail', render: (r) => r.detail ?? '' },
  ];

  return (
    <div>
      {isLoading && <LoadingSpinner t={t} size={32} />}
      {error && <AlertBar t={t} type="crit">Failed to load audit log (requires supervisor role).</AlertBar>}

      {!isLoading && !error && (
        <>
          <RTable t={t} bp={bp} cols={cols} rows={rows} rowKey={(r) => r.id} />

          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              style={{
                marginTop: 12,
                padding: '8px 14px',
                borderRadius: 6,
                border: `1px solid ${t.border}`,
                background: t.surfaceAlt,
                color: t.text,
                cursor: 'pointer',
              }}
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}

      <Card t={t} style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 13, color: t.text, marginTop: 0 }}>Notification Outbox &amp; Roles</h3>
        <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>
          Outbox and role-assignment views require the corresponding admin API endpoints — not yet exposed
          beyond service-role access. The audit trail above already captures every mutation (leave, shift close,
          settings, role changes) with full detail.
        </p>
      </Card>
    </div>
  );
}
