import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

const styles = {
  safe: "border-emerald-200 bg-emerald-50 text-emerald-700",
  suspicious: "border-amber-200 bg-amber-50 text-amber-700",
  dangerous: "border-red-200 bg-red-50 text-red-700"
};

function SecurityBadge({ status = "safe", score }) {
  const Icon = status === "dangerous" ? ShieldAlert : status === "suspicious" ? AlertTriangle : CheckCircle2;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${styles[status]}`}>
      <Icon size={14} />
      {status}
      {typeof score === "number" ? <span className="font-semibold opacity-75">{score}</span> : null}
    </span>
  );
}

export default SecurityBadge;
