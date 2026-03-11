/**
 * RULES
 * Each rule:
 *   id      – machine key
 *   name    – human label shown in Dashboard
 *   desc    – one-liner shown in UI / reason field
 *   weight  – points added to risk score when triggered (max score: 100)
 *   check   – (txn) => boolean
 *
 * Score thresholds
 *   0  – 30  → SAFE
 *   31 – 65  → SUSPICIOUS
 *   66 – 100 → FRAUD
 */
const RULES = [
  {
    id: "velocity",
    name: "Velocity Check",
    desc: "3+ transactions in under 60s",
    weight: 25,
    check: t => t.recent.filter(x => Date.now() - x < 60_000).length >= 3,
  },
  {
    id: "geo",
    name: "Geo Impossibility",
    desc: "Country mismatch from last transaction",
    weight: 30,
    check: t => t.loc.cc !== t.prevCc && t.prevCc !== null,
  },
  {
    id: "round",
    name: "Round Number Flag",
    desc: "Exact $1 / $10 / $100 / $1 000 amount",
    weight: 20,
    check: t => [1, 10, 100, 1000].includes(t.amount),
  },
  {
    id: "hour",
    name: "Unusual Hour",
    desc: "Transaction between 1 AM – 4 AM",
    weight: 15,
    check: t => t.hour >= 1 && t.hour <= 4,
  },
  {
    id: "luxury",
    name: "Merchant Mismatch",
    desc: "Luxury spend from low-avg user",
    weight: 20,
    check: t => t.cat === "luxury" && t.avg < 100,
  },
  {
    id: "spike",
    name: "Amount Spike",
    desc: "5× above user average spend",
    weight: 25,
    check: t => t.amount >= t.avg * 5,
  },
  {
    id: "crypto",
    name: "Crypto Flag",
    desc: "High-risk crypto exchange transaction",
    weight: 15,
    check: t => t.cat === "crypto",
  },
];

/**
 * analyze(txn)
 * Runs every rule against the transaction and returns a result object.
 *
 * @param  {Object} txn  – raw transaction from genTxn() or Simulator
 * @returns {{ score, status, reason, fired, clean }}
 */
function analyze(txn) {
  let score = 0;
  const fired = [];
  const clean = [];

  RULES.forEach(r => {
    if (r.check(txn)) {
      score += r.weight;
      fired.push(r);
    } else {
      clean.push(r);
    }
  });

  score = Math.min(score, 100);

  const status =
    score >= 66 ? "fraud"      :
    score >= 31 ? "suspicious" :
    "safe";

  const reason = fired.length ? fired[0].desc : "No anomalies detected";

  return { score, status, reason, fired, clean };
}
