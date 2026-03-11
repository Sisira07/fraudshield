function ReportModal({ stats, onClose }) {
  const fraudRate = stats.total
    ? ((stats.fraud / stats.total) * 100).toFixed(1)
    : '0.0';

  const download = () => {
    const lines = [
      'FRAUDSHIELD REPORT',
      new Date().toLocaleString(),
      '='.repeat(40),
      '',
      `Total Analyzed : ${stats.total}`,
      `Safe           : ${stats.safe}`,
      `Suspicious     : ${stats.suspicious}`,
      `Fraud Blocked  : ${stats.fraud}`,
      `Fraud Rate     : ${fraudRate}%`,
      '',
      stats.fraud > 5
        ? '⚠ HIGH FRAUD VOLUME — immediate review recommended'
        : '✓ Fraud levels within normal parameters',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `fraudshield-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const ROWS = [
    ['TOTAL ANALYZED', stats.total,      'var(--accent)'],
    ['SAFE',           stats.safe,        '#00e676'],
    ['SUSPICIOUS',     stats.suspicious,  '#ffb300'],
    ['FRAUD BLOCKED',  stats.fraud,       '#ff2d55'],
    ['FRAUD RATE',     `${fraudRate}%`,   '#ff2d55'],
  ];

  return (
    /* Backdrop — click outside to close */
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 32, width: 500, maxHeight: '80vh', overflow: 'auto',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 24,
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: 2 }}>
            FRAUD REPORT
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid var(--border)',
              color: 'var(--text-dim)', borderRadius: 8,
              padding: '4px 10px', cursor: 'pointer', fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* Stat rows */}
        {ROWS.map(([label, value, color]) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', background: 'var(--panel)',
            borderRadius: 8, marginBottom: 8,
          }}>
            <span style={{
              fontSize: 11, color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)', letterSpacing: 1.5,
            }}>
              {label}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color }}>
              {value}
            </span>
          </div>
        ))}

        {/* Status banner */}
        <div style={{
          marginTop: 8, padding: '12px 16px',
          background: 'var(--red-dim)',
          border: '1px solid rgba(255,45,85,0.2)',
          borderRadius: 8, fontSize: 12,
          color: stats.fraud > 5 ? '#ff2d55' : '#00e676',
        }}>
          {stats.fraud > 5
            ? '⚠ High fraud volume — immediate review recommended'
            : '✓ Fraud levels within normal parameters'}
        </div>

        {/* Download */}
        <button
          onClick={download}
          style={{
            marginTop: 20, width: '100%',
            background: 'var(--accent)', color: '#000',
            border: 'none', borderRadius: 8, padding: 12,
            fontFamily: 'var(--font-display)', fontSize: 18,
            letterSpacing: 2, cursor: 'pointer',
          }}
        >
          DOWNLOAD REPORT
        </button>
      </div>
    </div>
  );
}
