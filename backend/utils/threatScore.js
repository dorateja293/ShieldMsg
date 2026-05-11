export const THREAT_LEVELS = {
  SAFE: "safe",
  SUSPICIOUS: "suspicious",
  DANGEROUS: "dangerous"
};

export function classifyThreat(score) {
  if (score >= 71) return THREAT_LEVELS.DANGEROUS;
  if (score >= 31) return THREAT_LEVELS.SUSPICIOUS;
  return THREAT_LEVELS.SAFE;
}

export function combineThreatResults(results) {
  const score = Math.min(100, Math.max(0, Math.max(0, ...results.map((result) => result.score ?? 0))));
  const status = classifyThreat(score);
  const reasons = results.flatMap((result) => result.reason ? [result.reason] : []);

  return {
    status,
    score,
    reason: reasons.length ? reasons.join(" ") : "No threat signals detected."
  };
}
