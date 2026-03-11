const userProfiles = {};
let txnId = 1000;

/**
 * genTxn()
 * Generates a single randomised transaction object.
 *
 * Amount distribution:
 *   10%  → round bait values  ($1 / $10 / $100 / $1 000)
 *   10%  → high-value         ($1 000 – $5 000)
 *   80%  → everyday           ($5 – $205)
 *
 * @returns {Object} raw transaction – not yet scored
 */
function genTxn() {
  const id   = `TXN-${txnId++}`;
  const user = USERS[Math.floor(Math.random() * USERS.length)];
  const m    = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  const loc  = LOCS[Math.floor(Math.random() * LOCS.length)];
  const hour = new Date().getHours();
  const r    = Math.random();

  const amount =
    r < 0.1 ? [1, 10, 100, 1000][Math.floor(Math.random() * 4)]
    : r < 0.2 ? parseFloat((Math.random() * 4000 + 1000).toFixed(2))
    : parseFloat((Math.random() * 200 + 5).toFixed(2));

  // Bootstrap a profile the first time we see a user
  if (!userProfiles[user]) {
    userProfiles[user] = {
      avg:    50 + Math.random() * 100,
      lastCc: loc.cc,
      recent: [],   // timestamps of recent txns (ms)
    };
  }

  const p = userProfiles[user];
  const txn = {
    id,
    user,
    merchant: m.name,
    cat:      m.cat,
    amount,
    loc,
    hour,
    prevCc:   p.lastCc,
    avg:      p.avg,
    recent:   [...p.recent],
    ts:       new Date(),
  };

  // Update profile state
  p.lastCc = loc.cc;
  p.recent.push(Date.now());
  p.recent = p.recent.filter(t => Date.now() - t < 300_000); // 5-min sliding window

  return txn;
}
