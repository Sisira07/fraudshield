function Simulator() {
  const [form, setForm] = React.useState({
    amount: '', cat: 'food', country: 'US', hour: '', prevCc: 'US', avg: '',
  });
  const [result,   setResult]   = React.useState(null);
  const gaugeRef   = React.useRef(null);
  const gaugeChart = React.useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const run = () => {
    if (!form.amount || !form.hour || !form.avg) {
      alert('Please fill in Amount, Hour, and User Avg fields.');
      return;
    }
    const txn = {
      amount: +form.amount,
      cat:    form.cat,
      loc:    { cc: form.country },
      hour:   +form.hour,
      prevCc: form.prevCc,
      avg:    +form.avg,
      recent: [],
    };
    setResult(analyze(txn));
  };

  // ── Gauge chart re-renders on each new result ──
  React.useEffect(() => {
    if (!result || !gaugeRef.current) return;
    gaugeChart.current?.destroy();
    const c =
      result.status === 'fraud'      ? '#ff2d55' :
      result.status === 'suspicious' ? '#ffb300' :
      '#00e676';
    gaugeChart.current = new Chart(gaugeRef.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [result.score, 100 - result.score],
          backgroundColor: [c, '#152034'],
          borderWidth: 0, circumference: 200, rotation: 260,
        }],
      },
      options: {
        responsive: false, cutout: '78%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
    });
  }, [result]);

  // Shared input / select styles
  const inp = {
    background: 'var(--panel)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 14px',
    color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 12,
    outline: 'none', width: '100%', transition: 'border-color 0.2s',
  };
  const sel = { ...inp, appearance: 'none' };

  const COUNTRIES = [
    ['US','United States'], ['GB','UK'],     ['IN','India'],
    ['NG','Nigeria'],       ['RU','Russia'], ['CN','China'],
    ['BR','Brazil'],        ['AE','UAE'],
  ];
  const CATEGORIES = [
    'food','grocery','electronics','travel',
    'luxury','retail','crypto','health','fuel','subscription',
  ];

  const statusColor =
    result?.status === 'fraud'      ? '#ff2d55' :
    result?.status === 'suspicious' ? '#ffb300' :
    '#00e676';

  return (
    <div style={{
      padding: 20,
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 20, height: '100%', overflow: 'auto', alignContent: 'start',
    }}>

      {/* ── Input form ── */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 24,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1.5, marginBottom: 6 }}>
          TRY TO COMMIT FRAUD
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.6 }}>
          Design a transaction and see if FraudShield catches it. Can you beat the engine?
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Amount (USD)">
            <input
              style={inp} type="number" placeholder="e.g. 9999"
              value={form.amount} onChange={e => set('amount', e.target.value)}
            />
          </Field>

          <Field label="Merchant Category">
            <select style={sel} value={form.cat} onChange={e => set('cat', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Transaction Country">
            <select style={sel} value={form.country} onChange={e => set('country', e.target.value)}>
              {COUNTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>

          <Field label="Previous Country">
            <select style={sel} value={form.prevCc} onChange={e => set('prevCc', e.target.value)}>
              {COUNTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>

          <Field label="Hour of Transaction (0–23)">
            <input
              style={inp} type="number" min={0} max={23} placeholder="e.g. 3"
              value={form.hour} onChange={e => set('hour', e.target.value)}
            />
          </Field>

          <Field label="User Avg Spend ($)">
            <input
              style={inp} type="number" placeholder="e.g. 50"
              value={form.avg} onChange={e => set('avg', e.target.value)}
            />
          </Field>
        </div>

        <button
          onClick={run}
          style={{
            marginTop: 20, width: '100%',
            background: 'var(--accent)', color: '#000',
            border: 'none', borderRadius: 8, padding: 13,
            fontFamily: 'var(--font-display)', fontSize: 18,
            letterSpacing: 2, cursor: 'pointer',
          }}
        >
          ANALYZE TRANSACTION
        </button>
      </div>

      {/* ── Result panel ── */}
      {result ? (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1.5 }}>
            ANALYSIS RESULT
          </div>

          {/* Gauge + verdict */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 160, height: 120, flexShrink: 0 }}>
              <canvas ref={gaugeRef} width={160} height={160} />
              <div style={{
                position: 'absolute', top: '55%', left: '50%',
                transform: 'translate(-50%,-50%)', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: statusColor }}>
                  {result.score}
                </div>
                <div style={{
                  fontSize: 10, color: 'var(--text-dim)',
                  fontFamily: 'var(--font-mono)', letterSpacing: 1,
                }}>
                  RISK SCORE
                </div>
              </div>
            </div>

            <div>
              <Badge status={result.status} />
              <div style={{ marginTop: 10, fontSize: 13, fontWeight: 500, color: statusColor }}>
                {result.status === 'fraud'
                  ? '🚨 Transaction BLOCKED'
                  : result.status === 'suspicious'
                    ? '⚠️ Flagged for review'
                    : '✅ Transaction APPROVED'}
              </div>
            </div>
          </div>

          {/* Fired rules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto', flex: 1 }}>
            {result.fired.map(r => (
              <div key={r.id} style={{
                display: 'flex', gap: 10, padding: '9px 12px',
                background: 'var(--red-dim)',
                border: '1px solid rgba(255,45,85,0.2)',
                borderRadius: 8, borderLeft: '3px solid #ff2d55',
              }}>
                <span style={{ color: '#ff2d55', fontSize: 14 }}>⚠</span>
                <div>
                  <div style={{ fontSize: 12, color: '#ff2d55', fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{r.desc}</div>
                </div>
              </div>
            ))}

            {/* Show up to 3 passing rules for context */}
            {result.clean.slice(0, 3).map(r => (
              <div key={r.id} style={{
                display: 'flex', gap: 10, padding: '9px 12px',
                background: 'var(--green-dim)',
                border: '1px solid rgba(0,230,118,0.15)',
                borderRadius: 8, borderLeft: '3px solid #00e676',
              }}>
                <span style={{ color: '#00e676', fontSize: 14 }}>✓</span>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>Passed</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              Fill in the form and hit Analyze
            </div>
            <div style={{ fontSize: 11, marginTop: 8 }}>Can you fool the system?</div>
          </div>
        </div>
      )}
    </div>
  );
}
