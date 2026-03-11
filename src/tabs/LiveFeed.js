function LiveFeed({ transactions, paused }) {
  const COLS = ['TIME','TXN ID','USER','AMOUNT','MERCHANT','LOCATION','RISK','STATUS','REASON'];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20, gap: 12 }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1.5 }}>
          LIVE TRANSACTION STREAM
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: paused ? '#ffb300' : '#00e676',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'currentColor', display: 'inline-block',
            animation: paused ? 'none' : 'pulse 1.4s infinite',
          }} />
          {paused ? 'FEED PAUSED' : 'ANALYZING LIVE'}
        </div>
      </div>

      {/* ── Scrollable table ── */}
      <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--panel)', zIndex: 1 }}>
            <tr>
              {COLS.map(c => (
                <th key={c} style={{
                  padding: '10px 14px', textAlign: 'left',
                  color: 'var(--text-dim)', fontFamily: 'var(--font-mono)',
                  fontSize: 10, fontWeight: 400, letterSpacing: 1.5,
                  borderBottom: '1px solid var(--border)',
                }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map(({ txn, result }, i) => (
              <FeedRow key={txn.id} txn={txn} result={result} isNew={i === 0} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Single table row ──────────────────
function FeedRow({ txn, result, isNew }) {
  const c =
    result.status === 'fraud'      ? '#ff2d55' :
    result.status === 'suspicious' ? '#ffb300' :
    '#00e676';

  return (
    <tr
      className={`feed-row${isNew ? ' feed-row-new' : ''}`}
      style={{ borderBottom: '1px solid rgba(21,32,52,0.6)' }}
    >
      <td style={{ padding: '9px 14px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {txn.ts.toLocaleTimeString()}
      </td>
      <td style={{ padding: '9px 14px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {txn.id}
      </td>
      <td style={{ padding: '9px 14px' }}>{txn.user}</td>
      <td style={{ padding: '9px 14px', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
        ${txn.amount.toLocaleString()}
      </td>
      <td style={{ padding: '9px 14px', fontSize: 11 }}>{txn.merchant}</td>
      <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-dim)' }}>
        {txn.loc.city}, {txn.loc.cc}
      </td>
      <td style={{ padding: '9px 14px' }}>
        <RiskBar score={result.score} status={result.status} />
      </td>
      <td style={{ padding: '9px 14px' }}>
        <Badge status={result.status} />
      </td>
      <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-dim)', maxWidth: 180 }}>
        {result.reason}
      </td>
    </tr>
  );
}
