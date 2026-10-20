import React from 'react';
import { Check } from 'lucide-react';

export const DEFAULT_PAYROLL_STEPS = [
  { num: '01', title: 'Data', subtitle: 'Sinkronisasi data karyawan' },
  { num: '02', title: 'Perhitungan', subtitle: 'Kalkulasi penghasilan' },
  { num: '03', title: 'Pemeriksaan', subtitle: 'Validasi & audit data' },
  { num: '04', title: 'Persetujuan', subtitle: 'Persetujuan penggajian' },
  { num: '05', title: 'Pembayaran', subtitle: 'Proses pembayaran' },
  { num: '06', title: 'Publikasi Slip', subtitle: 'Distribusi slip ke karyawan' }
];

export default function Stepper({
  steps = DEFAULT_PAYROLL_STEPS,
  currentStep = 1,
  onStepClick
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-glass-card, #ffffff)',
        border: '1px solid var(--border-glass-card, #e2e8f0)',
        borderRadius: '16px',
        padding: '14px 18px',
        marginBottom: '24px',
        overflowX: 'auto',
        gap: '6px',
        boxShadow: 'var(--glass-shadow-sm, 0 2px 8px rgba(0,0,0,0.03))'
      }}
    >
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        const isPassed = currentStep > stepNum;

        return (
          <React.Fragment key={step.num}>
            <div
              onClick={() => onStepClick && onStepClick(stepNum)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: onStepClick ? 'pointer' : 'default',
                padding: '8px 12px',
                borderRadius: '10px',
                background: isActive ? '#eff6ff' : 'transparent',
                border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                transition: 'all 0.2s ease',
                flex: 1,
                minWidth: '150px'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0,
                  background: isPassed
                    ? '#059669'
                    : isActive
                    ? '#2563eb'
                    : '#f1f5f9',
                  color: isPassed || isActive ? '#ffffff' : '#64748b',
                  border: isPassed
                    ? '1.5px solid #059669'
                    : isActive
                    ? '1.5px solid #2563eb'
                    : '1.5px solid #cbd5e1',
                  boxShadow: isActive ? '0 0 12px rgba(37, 99, 235, 0.35)' : 'none'
                }}
              >
                {isPassed ? <Check size={16} strokeWidth={2.6} /> : step.num}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isActive ? '#2563eb' : isPassed ? '#0f172a' : '#64748b',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {step.title}
                </span>
                <small
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {step.subtitle}
                </small>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div
                style={{
                  width: '18px',
                  height: '2px',
                  background: isPassed ? '#059669' : '#e2e8f0',
                  flexShrink: 0
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
