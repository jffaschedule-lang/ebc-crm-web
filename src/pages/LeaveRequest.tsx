import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Card } from '../components/ui/Card';
import { LeaveRequestForm } from '../components/forms/LeaveRequestForm';

export default function LeaveRequest() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();

  return (
    <div style={{ maxWidth: 560 }}>
      <Card t={t}>
        <h2 style={{ fontSize: 17, fontWeight: 650, color: t.text, marginTop: 0 }}>New Leave Request</h2>
        <LeaveRequestForm t={t} bp={bp} />
      </Card>
    </div>
  );
}
