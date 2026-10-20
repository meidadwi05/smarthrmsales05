import React from 'react';
import { CheckCircle2, Clock, XCircle, ShieldCheck, UserCheck } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import Button from './Button.jsx';

export default function ApprovalTimeline({
  stages = [],
  onApprove,
  onReject,
  canApprove = true
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {stages.map((stage, idx) => {
        const isApproved = stage.status === 'Disetujui' || stage.decision === 'approve';
        const isPending = stage.status === 'Menunggu Persetujuan' || stage.status === 'Pending';
        const isRejected = stage.status === 'Ditolak' || stage.decision === 'reject';

        return (
          <div
            key={stage.id || idx}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: isApproved
                    ? '#ecfdf5'
                    : isPending
                    ? '#fffbeb'
                    : '#fff1f2',
                  color: isApproved
                    ? '#059669'
                    : isPending
                    ? '#d97706'
                    : '#e11d48',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                {isApproved ? (
                  <CheckCircle2 size={20} />
                ) : isPending ? (
                  <Clock size={20} />
                ) : (
                  <XCircle size={20} />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <b style={{ fontSize: '14px', color: '#0f172a' }}>{stage.stageName || stage.title}</b>
                  <StatusBadge status={stage.status} />
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Otoritas: <b>{stage.approverRole || stage.role || 'Finance Manager'}</b> • {stage.actorName || 'Menunggu verifikasi'}
                </p>
                {stage.notes && (
                  <small style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                    Catatan: "{stage.notes}"
                  </small>
                )}
              </div>
            </div>

            {isPending && canApprove && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {onReject && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onReject(stage.id)}
                  >
                    Tolak
                  </Button>
                )}
                {onApprove && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onApprove(stage.id)}
                  >
                    Setujui Tahap Ini
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
