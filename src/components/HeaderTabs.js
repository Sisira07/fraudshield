function Header({ stats, paused, onToggle, onReport }) {
  return (
    <header style={{
      background: 'var(--panel)',
      borderBottom: '1px solid var(--border)',
      padding: '10px 24px',
      display: 'flex', alignItems: 'center', gap: 20,
      flexShrink: 0,
    }}>

      {/* Branding */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 28,
          color: 'var(--accent)', letterSpacing: 2,
          textShadow: '0 0 20px rgba(0,255,255,0.4)',
        }}>
          FRAUDSHIELD
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--text-dim)', letterSpacing: 2,
        }}>
          INTELLIGENCE PLATFORM
        </span>
      </div>

      {/* Live counters */}
      <div style={{
        flex: 1, display: 'flex',
        alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <MiniStat label="TOTAL"   value={stats.total}      />
        <MiniStat label="SAFE"    value={stats.safe}       />
        <MiniStat label="SUSPECT" value={stats.suspicious} />
        <MiniStat label="FRAUD"   value={stats.fraud}      />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onToggle}
          style={{
            background:   paused ? 'var(--green)' : 'transparent',
            color:        paused ? '#000'          : 'var(--text)',
            border:       '1px solid var(--border-bright)',
            borderRadius: 8, padding: '7px 14px',
            fontFamily:   'var(--font-mono)', fontSize: 11,
            cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.5,
          }}
        >
          {paused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>

        <button
          onClick={onReport}
          style={{
            background:   'var(--accent)', color: '#000',
            border:       'none', borderRadius: 8, padding: '7px 14px',
            fontFamily:   'var(--font-mono)', fontSize: 11,
            fontWeight:   600, cursor: 'pointer', letterSpacing: 0.5,
          }}
        >
          REPORT
        </button>
      </div>
    </header>
  );
}

// ── Horizontal tab bar ────────────────
function Tabs({ active, onChange }) {
  const TABS = ['DASHBOARD', 'LIVE FEED', 'FRAUD MAP', 'SIMULATOR', 'BANK LOOKUP'];
  return (
    <nav style={{
      background: 'var(--panel)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      display: 'flex', flexShrink: 0,
    }}>
      {TABS.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            background:   'none',
            border:       'none',
            borderBottom: `2px solid ${active === t ? 'var(--accent)' : 'transparent'}`,
            color:        active === t ? 'var(--accent)' : 'var(--text-dim)',
            fontFamily:   'var(--font-mono)', fontSize: 11,
            padding:      '12px 18px',
            cursor:       'pointer', transition: 'all 0.2s', letterSpacing: 1.5,
          }}
        >
          {t}
        </button>
      ))}
    </nav>
  );
}
