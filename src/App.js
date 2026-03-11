const { useState, useEffect, useCallback, useMemo } = React;

function App() {
  const [tab,          setTab]          = useState('DASHBOARD');
  const [transactions, setTransactions] = useState([]);
  const [paused,       setPaused]       = useState(false);
  const [showReport,   setShowReport]   = useState(false);

  // Derived counters — only recalculated when transactions array changes
  const stats = useMemo(() => ({
    total:      transactions.length,
    safe:       transactions.filter(t => t.result.status === 'safe').length,
    suspicious: transactions.filter(t => t.result.status === 'suspicious').length,
    fraud:      transactions.filter(t => t.result.status === 'fraud').length,
  }), [transactions]);

  const addTxn = useCallback(() => {
    const txn    = genTxn();
    const result = analyze(txn);
    setTransactions(prev => [{ txn, result }, ...prev].slice(0, 200));
  }, []);

  // Seed 12 transactions on first load
  useEffect(() => {
    const seed = [];
    for (let i = 0; i < 12; i++) {
      const txn    = genTxn();
      const result = analyze(txn);
      seed.push({ txn, result });
    }
    setTransactions(seed);
  }, []);

  // Live stream: new transaction every 1.8 s
  useEffect(() => {
    if (paused) return;
    const id = setInterval(addTxn, 1800);
    return () => clearInterval(id);
  }, [paused, addTxn]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--void)' }}>
      <Header
        stats={stats}
        paused={paused}
        onToggle={() => setPaused(p => !p)}
        onReport={() => setShowReport(true)}
      />
      <Tabs active={tab} onChange={setTab} />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'DASHBOARD'   && <Dashboard   transactions={transactions} stats={stats} />}
        {tab === 'LIVE FEED'   && <LiveFeed    transactions={transactions} paused={paused} />}
        {tab === 'FRAUD MAP'   && <FraudMap    transactions={transactions} />}
        {tab === 'SIMULATOR'   && <Simulator />}
        {tab === 'BANK LOOKUP' && <BankLookup />}
      </div>

      {showReport && (
        <ReportModal stats={stats} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

// ── Mount ─────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
