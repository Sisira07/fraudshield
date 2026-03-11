function FraudMap({ transactions }) {
  const mapRef      = React.useRef(null);
  const mapInstance = React.useRef(null);
  const markersRef  = React.useRef([]);

  // ── Bootstrap Leaflet map once ────────
  React.useEffect(() => {
    if (mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current, {
      center: [20, 10], zoom: 2,
      zoomControl: true, attributionControl: false,
    });
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 19 }
    ).addTo(mapInstance.current);
  }, []);

  // ── Plot the newest transaction as a marker ──
  React.useEffect(() => {
    if (!mapInstance.current || !transactions.length) return;
    const { txn, result } = transactions[0];

    const c =
      result.status === 'fraud'      ? '#ff2d55' :
      result.status === 'suspicious' ? '#ffb300' :
      '#00e676';
    const r =
      result.status === 'fraud'      ? 10 :
      result.status === 'suspicious' ? 7  : 5;

    const marker = L.circleMarker([txn.loc.lat, txn.loc.lng], {
      radius: r, color: c, fillColor: c, fillOpacity: 0.8, weight: 1,
    });

    marker.bindPopup(`
      <div style="line-height:1.7">
        <strong style="color:${c}">${result.status.toUpperCase()}</strong><br/>
        ${txn.id}<br/>
        <strong>$${txn.amount.toLocaleString()}</strong> @ ${txn.merchant}<br/>
        ${txn.loc.city}, ${txn.loc.cc}<br/>
        <span style="color:#4a6688">Score: ${result.score}/100</span>
      </div>
    `);

    marker.addTo(mapInstance.current);
    markersRef.current.push(marker);

    // Keep at most 300 visible markers to avoid memory bloat
    if (markersRef.current.length > 300) {
      mapInstance.current.removeLayer(markersRef.current.shift());
    }
  }, [transactions.length]);   // run when a new txn arrives

  const LEGEND = [['#00e676','SAFE'], ['#ffb300','SUSPICIOUS'], ['#ff2d55','FRAUD']];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20, gap: 12 }}>

      {/* Title + legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1.5 }}>
          GLOBAL FRAUD HEATMAP
        </span>
        <div style={{ display: 'flex', gap: 16 }}>
          {LEGEND.map(([color, label]) => (
            <span key={label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: color, display: 'inline-block',
              }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Map container — Leaflet renders inside here */}
      <div
        ref={mapRef}
        style={{ flex: 1, borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}
      />
    </div>
  );
}
