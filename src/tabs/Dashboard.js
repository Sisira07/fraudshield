function Dashboard({ transactions, stats }) {
  const lineRef   = React.useRef(null);
  const pieRef    = React.useRef(null);
  const barRef    = React.useRef(null);
  const lineChart = React.useRef(null);
  const pieChart  = React.useRef(null);
  const barChart  = React.useRef(null);

  const GRID  = '#152034';
  const TICK  = '#4a6688';
  const TFONT = { family: 'DM Mono', size: 10 };
  const BASE  = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  };

  // ── Initialise charts once on mount ──
  React.useEffect(() => {
    lineChart.current = new Chart(lineRef.current, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Fraud %',
            data: [], borderColor: '#ff2d55',
            backgroundColor: 'rgba(255,45,85,0.06)',
            borderWidth: 2, pointRadius: 2, fill: true, tension: 0.4,
          },
          {
            label: 'Suspect %',
            data: [], borderColor: '#ffb300',
            backgroundColor: 'rgba(255,179,0,0.04)',
            borderWidth: 1.5, pointRadius: 0, fill: true, tension: 0.4,
          },
        ],
      },
      options: {
        ...BASE,
        scales: {
          x: { ticks: { color: TICK, font: TFONT, maxTicksLimit: 8 }, grid: { color: GRID } },
          y: { ticks: { color: TICK, font: TFONT }, grid: { color: GRID }, min: 0, max: 100 },
        },
      },
    });

    pieChart.current = new Chart(pieRef.current, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#ff2d55','#0ff','#ffb300','#00e676','#448aff','#ff9100','#e040fb','#69f0ae'],
          borderColor: 'var(--card)', borderWidth: 2,
        }],
      },
      options: {
        ...BASE,
        cutout: '68%',
        plugins: {
          legend: {
            display: true, position: 'bottom',
            labels: { color: TICK, font: TFONT, padding: 8, boxWidth: 8 },
          },
        },
      },
    });

    barChart.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: ['0–20','21–40','41–60','61–80','81–100'],
        datasets: [{
          data: [0,0,0,0,0],
          backgroundColor: ['#00e676','#69f0ae','#ffb300','#ff9100','#ff2d55'],
          borderRadius: 4, borderSkipped: false,
        }],
      },
      options: {
        ...BASE,
        scales: {
          x: { ticks: { color: TICK, font: TFONT }, grid: { color: GRID } },
          y: { ticks: { color: TICK, font: TFONT }, grid: { color: GRID } },
        },
      },
    });

    return () => {
      lineChart.current?.destroy();
      pieChart.current?.destroy();
      barChart.current?.destroy();
    };
  }, []);

  // ── Update charts on every new transaction ──
  React.useEffect(() => {
    if (!transactions.length || !lineChart.current) return;
    const recent = transactions.slice(0, 30).reverse();

    // Rolling fraud / suspect percentage line
    const lc = lineChart.current;
    lc.data.labels = recent.map(t =>
      t.txn.ts.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    let runFraud = 0, runSuspect = 0;
    const fraudPts = [], suspectPts = [];
    recent.forEach((t, i) => {
      if (t.result.status === 'fraud')      runFraud++;
      if (t.result.status === 'suspicious') runSuspect++;
      fraudPts.push(  Math.round((runFraud   / (i + 1)) * 100));
      suspectPts.push(Math.round((runSuspect / (i + 1)) * 100));
    });
    lc.data.datasets[0].data = fraudPts;
    lc.data.datasets[1].data = suspectPts;
    lc.update('none');

    // Flagged category donut
    const cats = {};
    transactions
      .filter(t => t.result.status !== 'safe')
      .forEach(t => { cats[t.txn.cat] = (cats[t.txn.cat] || 0) + 1; });
    pieChart.current.data.labels             = Object.keys(cats).map(c => c.toUpperCase());
    pieChart.current.data.datasets[0].data   = Object.values(cats);
    pieChart.current.update('none');

    // Risk-score bucket bar
    const buckets = [0, 0, 0, 0, 0];
    transactions.forEach(t => buckets[Math.min(Math.floor(t.result.score / 20), 4)]++);
    barChart.current.data.datasets[0].data = buckets;
    barChart.current.update('none');
  }, [transactions]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 16, height: '100%', padding: 20, overflow: 'auto', alignContent: 'start',
    }}>
      {/* ── Stat cards ── */}
      <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <StatCard label="Total Analyzed" value={stats.total}      color="var(--accent)" icon="📡" />
        <StatCard label="Safe"           value={stats.safe}       color="#00e676"       icon="✅" />
        <StatCard label="Suspicious"     value={stats.suspicious} color="#ffb300"       icon="⚠️" />
        <StatCard label="Fraud Blocked"  value={stats.fraud}      color="#ff2d55"       icon="🚨" />
      </div>

      {/* ── Charts ── */}
      <ChartCard title="Fraud Rate Over Time"    subtitle="Rolling 30 transactions">
        <canvas ref={lineRef} />
      </ChartCard>
      <ChartCard title="Fraud by Category"       subtitle="Flagged transactions only">
        <canvas ref={pieRef} />
      </ChartCard>
      <ChartCard title="Risk Score Distribution" subtitle="All transactions">
        <canvas ref={barRef} />
      </ChartCard>

      {/* ── Active detection rules ── */}
      <div style={{
        gridColumn: '1/-1',
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '16px 20px',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 16,
          letterSpacing: 1, marginBottom: 14, color: 'var(--text-bright)',
        }}>
          ACTIVE DETECTION RULES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10 }}>
          {RULES.map(r => (
            <div key={r.id} style={{
              background: 'var(--panel)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 12px',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#00e676', boxShadow: '0 0 8px #00e676', marginBottom: 8,
              }} />
              <div style={{
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: 'var(--text-bright)', marginBottom: 4, fontWeight: 500,
              }}>
                {r.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                {r.desc}
              </div>
              <div style={{
                marginTop: 6, fontSize: 10,
                color: 'var(--amber)', fontFamily: 'var(--font-mono)',
              }}>
                +{r.weight} pts
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
