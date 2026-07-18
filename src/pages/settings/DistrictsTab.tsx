import { useState } from 'react';
import { ThemeTokens } from '../../theme/tokens';
import { Breakpoint, isMobile } from '../../hooks/useBreakpoint';
import { useCompanies, useCreateCompany, useUpdateCompany, CompanyInput } from '../../hooks/useCompanies';
import { Company } from '../../types/domain';
import { Card } from '../../components/ui/Card';
import { AlertBar } from '../../components/ui/AlertBar';
import { LoadingSpinner, InlineSpinner } from '../../components/ui/LoadingSpinner';
import { PencilIcon, PlusIcon } from '../../components/ui/Icon';
import { MIN_TAP_TARGET } from '../../theme/spacing';

interface TabProps {
  t: ThemeTokens;
  bp: Breakpoint;
}

const DISTRICTS = [120, 140, 160] as const;

interface DraftState {
  code: string;
  station: string;
  district: string;
  suffix_rule: string;
  records_only: boolean;
}

const BLANK_DRAFT: DraftState = { code: '', station: '', district: '', suffix_rule: '', records_only: false };

function draftFrom(c: Company): DraftState {
  return {
    code: c.code,
    station: c.station,
    district: c.district != null ? String(c.district) : '',
    suffix_rule: c.suffix_rule ?? '',
    records_only: c.records_only,
  };
}

interface EditRowProps {
  t: ThemeTokens;
  mobile: boolean;
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
  isNew: boolean;
  pending: boolean;
  isError: boolean;
  errorMessage?: string;
  onSave: () => void;
  onCancel: () => void;
}

function EditRow({ t, mobile, draft, setDraft, isNew, pending, isError, errorMessage, onSave, onCancel }: EditRowProps) {
  const inputStyle: React.CSSProperties = {
    padding: '6px 8px',
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surface,
    color: t.text,
    fontSize: 12,
    width: '100%',
  };

  return (
    <div
      style={{
        border: `1px solid ${t.pA}`,
        borderRadius: 8,
        padding: 14,
        marginBottom: 12,
        background: t.surfaceAlt,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, color: t.textMuted, display: 'block', marginBottom: 3 }}>Code</label>
          <input
            value={draft.code}
            onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
            disabled={!isNew}
            style={{ ...inputStyle, opacity: !isNew ? 0.6 : 1 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: t.textMuted, display: 'block', marginBottom: 3 }}>Station</label>
          <input value={draft.station} onChange={(e) => setDraft((d) => ({ ...d, station: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: t.textMuted, display: 'block', marginBottom: 3 }}>District</label>
          <select value={draft.district} onChange={(e) => setDraft((d) => ({ ...d, district: e.target.value }))} style={inputStyle}>
            <option value="">None (HQ / records-only)</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: t.textMuted, display: 'block', marginBottom: 3 }}>Suffix Rule</label>
          <input
            value={draft.suffix_rule}
            onChange={(e) => setDraft((d) => ({ ...d, suffix_rule: e.target.value }))}
            placeholder="5 · Capt+LT+OP+2FF"
            style={inputStyle}
          />
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: t.text }}>
        <input
          type="checkbox"
          checked={draft.records_only}
          onChange={(e) => setDraft((d) => ({ ...d, records_only: e.target.checked }))}
          style={{ width: 16, height: 16 }}
        />
        Records only (not a staffed station)
      </label>

      {isError && <AlertBar t={t} type="crit">{errorMessage ?? 'Failed to save company.'}</AlertBar>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={onSave}
          disabled={pending || !draft.code || !draft.station}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            border: 'none',
            background: t.pA,
            color: '#fff',
            fontWeight: 600,
            fontSize: 12,
            cursor: pending ? 'default' : 'pointer',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending && <InlineSpinner size={11} />}
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          style={{
            padding: '6px 14px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surface,
            color: t.text,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function DistrictsTab({ t, bp }: TabProps) {
  const mobile = isMobile(bp);
  const { data, isLoading, error } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const [editing, setEditing] = useState<string | null>(null); // company code, or 'NEW'
  const [draft, setDraft] = useState<DraftState>(BLANK_DRAFT);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const companies = data ?? [];

  const districtSummary = DISTRICTS.map((d) => {
    const stations = Array.from(
      new Set(
        companies
          .filter((c) => c.district === d)
          .map((c) => c.station.replace(/^Station\s+/i, '').trim())
          .filter((s) => /^\d+$/.test(s))
      )
    ).sort((a, b) => Number(a) - Number(b));
    return { district: d, stations };
  });

  const startEdit = (c: Company) => {
    setEditing(c.code);
    setDraft(draftFrom(c));
  };

  const startAdd = () => {
    setEditing('NEW');
    setDraft(BLANK_DRAFT);
  };

  const cancel = () => {
    setEditing(null);
    setDraft(BLANK_DRAFT);
  };

  const toPayload = (): CompanyInput => ({
    code: draft.code.trim().toUpperCase(),
    station: draft.station.trim(),
    district: draft.district ? (Number(draft.district) as 120 | 140 | 160) : null,
    suffix_rule: draft.suffix_rule.trim() || null,
    records_only: draft.records_only,
  });

  const save = () => {
    if (editing === 'NEW') {
      createCompany.mutate(toPayload(), {
        onSuccess: () => {
          setSuccessMsg(`Company ${draft.code.toUpperCase()} added.`);
          cancel();
        },
      });
    } else if (editing) {
      const payload = toPayload();
      const changes = {
        station: payload.station,
        district: payload.district,
        suffix_rule: payload.suffix_rule,
        records_only: payload.records_only,
      };
      updateCompany.mutate(
        { code: editing, changes },
        {
          onSuccess: () => {
            setSuccessMsg(`Company ${editing} updated.`);
            cancel();
          },
        }
      );
    }
  };

  const pending = createCompany.isPending || updateCompany.isPending;
  const activeError = editing === 'NEW' ? createCompany.error : updateCompany.error;
  const activeIsError = editing === 'NEW' ? createCompany.isError : updateCompany.isError;
  const activeErrorMessage = (activeError as { error?: { message?: string } } | null)?.error?.message;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 17, fontWeight: 650, color: t.text, margin: 0 }}>District &amp; Company Configuration</h2>
        {editing === null && (
          <button
            type="button"
            onClick={startAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              minHeight: MIN_TAP_TARGET,
              borderRadius: 6,
              border: 'none',
              background: t.pA,
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <PlusIcon size={15} />
            Add New Company
          </button>
        )}
      </div>

      {successMsg && <AlertBar t={t} type="ok">{successMsg}</AlertBar>}

      <Card t={t}>
        {isLoading && <LoadingSpinner t={t} />}
        {error && <AlertBar t={t} type="crit">Couldn't load companies.</AlertBar>}
        {!isLoading && !error && (
          <>
            {editing === 'NEW' && (
              <EditRow
                t={t}
                mobile={mobile}
                draft={draft}
                setDraft={setDraft}
                isNew
                pending={pending}
                isError={activeIsError}
                errorMessage={activeErrorMessage}
                onSave={save}
                onCancel={cancel}
              />
            )}
            <div className="rtable-scroll" style={{ border: `1px solid ${t.border}`, borderRadius: 10 }}>
              <table className="rtable" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Code', 'Station', 'District', 'Suffix Rule', 'Records Only', 'Edit'].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
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
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) =>
                    editing === c.code ? (
                      <tr key={c.code}>
                        <td colSpan={6} style={{ padding: 8 }}>
                          <EditRow
                            t={t}
                            mobile={mobile}
                            draft={draft}
                            setDraft={setDraft}
                            isNew={false}
                            pending={pending}
                            isError={activeIsError}
                            errorMessage={activeErrorMessage}
                            onSave={save}
                            onCancel={cancel}
                          />
                        </td>
                      </tr>
                    ) : (
                      <tr key={c.code} style={{ borderBottom: `1px solid ${t.border}` }}>
                        <td style={{ padding: '8px 12px', color: t.text, fontFamily: 'ui-monospace, SF Mono, Consolas, monospace' }}>{c.code}</td>
                        <td style={{ padding: '8px 12px', color: t.text }}>{c.station}</td>
                        <td style={{ padding: '8px 12px', color: t.text }}>{c.district ?? '—'}</td>
                        <td style={{ padding: '8px 12px', color: t.textMuted }}>{c.suffix_rule ?? '—'}</td>
                        <td style={{ padding: '8px 12px', color: t.text }}>{c.records_only ? 'Yes' : 'No'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            disabled={editing !== null}
                            aria-label={`Edit ${c.code}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: mobile ? MIN_TAP_TARGET : 30,
                              height: mobile ? MIN_TAP_TARGET : 30,
                              borderRadius: 6,
                              border: `1px solid ${t.border}`,
                              background: t.surfaceAlt,
                              color: t.textMuted,
                              cursor: editing !== null ? 'default' : 'pointer',
                              opacity: editing !== null ? 0.5 : 1,
                            }}
                          >
                            <PencilIcon size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                  {companies.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 20, textAlign: 'center', color: t.textFaint }}>
                        No companies configured yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <Card t={t}>
        <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>District Summary</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {districtSummary.map(({ district, stations }) => (
            <div key={district} style={{ fontSize: 13, color: t.text }}>
              <strong>District {district}:</strong>{' '}
              {stations.length > 0 ? `Stations ${stations.join(', ')}` : 'No stations configured'}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
