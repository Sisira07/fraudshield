function Counter({ value, color }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const diff = value - display;
    if (diff === 0) return;
    const step  = Math.ceil(Math.abs(diff) / 4);
    const timer = setTimeout(
      () => setDisplay(d => d + Math.sign(diff) * Math.min(step, Math.abs(diff))),
      40
    );
    return () => clearTimeout(timer);
  }, [value, display]);

  return (
    <span style={{ color, fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1 }}>
      {display}
    </span>
  );
}

// ── Stat card with animated counter ──
function StatCard({ label, value, color, icon }) {
  const dimColor =
    color === '#ff2d55' ? 'var(--red-dim)'   :
    color === '#ffb300' ? 'var(--amber-dim)' :
    color === '#00e676' ? 'var(--green-dim)' :
    'var(--accent-dim)';

  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid ${color}30`,
      borderRadius: 10,
      padding: '14px 18px',
      display: 'flex', flexDirection: 'column', gap: 6,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 60, height: 60,
        background: dimColor, borderRadius: '0 10px 0 60px',
      }} />
      <span style={{ fontSize: 18, position: 'relative', zIndex: 1 }}>{icon}</span>
      <Counter value={value} color={color} />
      <span style={{
        fontSize: 10, color: 'var(--text-dim)',
        letterSpacing: 2, textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)',
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Status badge (SAFE / SUSPECT / FRAUD) ──
function Badge({ status }) {
  const cfg = {
    safe:       ['#00e676', 'var(--green-dim)', 'SAFE'],
    suspicious: ['#ffb300', 'var(--amber-dim)', 'SUSPECT'],
    fraud:      ['#ff2d55', 'var(--red-dim)',   'FRAUD'],
  };
  const [c, bg, label] = cfg[status] || cfg.safe;
  return (
    <span style={{
      background: bg, color: c,
      border: `1px solid ${c}40`,
      borderRadius: 20, padding: '2px 10px',
      fontSize: 10, fontFamily: 'var(--font-mono)',
      fontWeight: 500, letterSpacing: 1,
    }}>
      {label}
    </span>
  );
}

// ── Horizontal risk score bar ─────────
function RiskBar({ score, status }) {
  const c =
    status === 'fraud'      ? '#ff2d55' :
    status === 'suspicious' ? '#ffb300' :
    '#00e676';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 56, height: 3,
        background: 'var(--border)', borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          width: `${score}%`, height: '100%',
          background: c, borderRadius: 2, transition: 'width 0.4s',
        }} />
      </div>
      <span style={{ fontSize: 11, color: c, fontFamily: 'var(--font-mono)', minWidth: 24 }}>
        {score}
      </span>
    </div>
  );
}

// ── Chart wrapper card ────────────────
function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 12, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 16,
          letterSpacing: 1, color: 'var(--text-bright)',
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 10, color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)', marginTop: 2,
        }}>
          {subtitle}
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', minHeight: 180 }}>{children}</div>
    </div>
  );
}

// ── Compact header stat pill ──────────
function MiniStat({ label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 8, padding: '5px 12px',
    }}>
      <span style={{
        fontSize: 10, color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)', letterSpacing: 1,
      }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{value}</span>
    </div>
  );
}

// ── Labelled form field wrapper ───────
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 10, color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)', letterSpacing: 1.5, textTransform: 'uppercase',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Coloured tag pill (BankLookup) ────
function Pill({ color, children }) {
  return (
    <span style={{
      background: `${color}18`, color,
      border: `1px solid ${color}40`,
      borderRadius: 20, padding: '4px 12px',
      fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500,
    }}>
      {children}
    </span>
  );
}
