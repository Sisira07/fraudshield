function BankLookup() {
  const [query,   setQuery]   = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState(null);
  const [error,   setError]   = React.useState(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const [fdicRes, cfpbRes] = await Promise.all([
        fetch(
          `https://banks.data.fdic.gov/api/institutions` +
          `?search=${encodeURIComponent(query)}` +
          `&fields=NAME,CITY,STNAME,ASSET,INSURED,ACTIVE` +
          `&limit=3&sort_by=ASSET&sort_order=DESC&output=json`
        ),
        fetch(
          `https://api.consumerfinance.gov/data/complaints` +
          `?company=${encodeURIComponent(query)}&field=all&size=100&format=json`
        ),
      ]);

      const fdic = await fdicRes.json();
      const cfpb = await cfpbRes.json();

      const banks      = fdic.data || [];
      const complaints = cfpb.hits?.hits?.map(h => h._source) || [];

      // Aggregate by issue / product category
      const counts = {};
      complaints.forEach(c => {
        const key = c.issue || c.product || 'Other';
        counts[key] = (counts[key] || 0) + 1;
      });
      const topCats = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

      setResults({ banks, complaints: topCats, total: complaints.length });
    } catch {
      setError('Could not fetch data. Check your internet connection.');
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, maxWidth: 860, margin: '0 auto', height: '100%', overflow: 'auto' }}>

      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 28,
        letterSpacing: 2, marginBottom: 6,
      }}>
        BANK SAFETY CHECKER
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 24 }}>
        Search any US bank to see live FDIC insurance status and CFPB consumer complaint data.
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="e.g. Wells Fargo, Chase, Bank of America…"
          style={{
            flex: 1,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px 16px',
            color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          onClick={search}
          style={{
            background: 'var(--accent)', color: '#000',
            border: 'none', borderRadius: 10, padding: '12px 28px',
            fontFamily: 'var(--font-display)', fontSize: 18,
            letterSpacing: 2, cursor: 'pointer',
          }}
        >
          SEARCH
        </button>
      </div>

      {/* States */}
      {loading && (
        <div style={{
          textAlign: 'center', color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)', fontSize: 13, padding: 40,
        }}>
          ⏳ Fetching from FDIC &amp; CFPB…
        </div>
      )}
      {error && (
        <div style={{ color: '#ff2d55', fontFamily: 'var(--font-mono)', fontSize: 12, padding: 20 }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {results.banks.length === 0 && (
            <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              No FDIC institutions found for "{query}".
            </div>
          )}

          {results.banks.map((b, i) => {
            const d       = b.data;
            const insured = d.INSURED === '1' || d.INSURED === 1;
            return (
              <div key={i} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 20,
              }}>
                {/* Bank name */}
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 22,
                  letterSpacing: 1, marginBottom: 12,
                }}>
                  {d.NAME}
                </div>

                {/* Pill tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  <Pill color={insured ? '#00e676' : '#ff2d55'}>
                    {insured ? '✓ FDIC INSURED' : '✗ NOT INSURED'}
                  </Pill>
                  <Pill color="var(--accent)">📍 {d.CITY}, {d.STNAME}</Pill>
                  <Pill color="var(--blue)">
                    💰 Assets: ${d.ASSET ? (d.ASSET / 1000).toFixed(1) + 'B' : 'N/A'}
                  </Pill>
                  <Pill color="#ffb300">📋 {results.total} Complaints</Pill>
                </div>

                {/* CFPB complaint breakdown */}
                {results.complaints.length > 0 && (
                  <>
                    <div style={{
                      fontSize: 10, color: 'var(--text-dim)',
                      fontFamily: 'var(--font-mono)', letterSpacing: 2, marginBottom: 10,
                    }}>
                      TOP COMPLAINT CATEGORIES (CFPB)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {results.complaints.map(([issue, count], j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: 'var(--panel)', borderRadius: 8, padding: '8px 12px',
                        }}>
                          <span style={{ flex: 1, fontSize: 12 }}>{issue}</span>
                          <div style={{
                            width: 120, height: 4,
                            background: 'var(--border)', borderRadius: 2, overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${(count / results.complaints[0][1]) * 100}%`,
                              height: '100%', background: '#ff2d55', borderRadius: 2,
                            }} />
                          </div>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 12,
                            color: '#ff2d55', minWidth: 32, textAlign: 'right',
                          }}>
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
