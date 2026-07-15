import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import LoginPage from './auth/LoginPage';
import { Layout } from './components/layout/Layout';

import DutyBoard from './pages/DutyBoard';
import Roster from './pages/Roster';
import Rotation from './pages/Rotation';
import DutyLedger from './pages/DutyLedger';
import LeaveRequest from './pages/LeaveRequest';
import LeaveRecords from './pages/LeaveRecords';
import Timesheet from './pages/Timesheet';
import Payroll from './pages/Payroll';
import WorkforceReport from './pages/WorkforceReport';
import Overtime from './pages/Overtime';
import ShiftClose from './pages/ShiftClose';
import Audit from './pages/Audit';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DutyBoard />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="/rotation" element={<Rotation />} />
          <Route path="/duty-ledger" element={<DutyLedger />} />
          <Route path="/leave/new" element={<LeaveRequest />} />
          <Route path="/leave" element={<LeaveRecords />} />
          <Route path="/timesheet" element={<Timesheet />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/workforce" element={<WorkforceReport />} />
          <Route path="/overtime" element={<Overtime />} />
          <Route path="/shift-close" element={<ShiftClose />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
