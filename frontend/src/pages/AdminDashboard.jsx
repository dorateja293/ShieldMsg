import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../services/api.js";

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get("/admin/security").then(({ data }) => setAnalytics(data)).catch(() => setAnalytics(null));
  }, []);

  if (!analytics) {
    return (
      <section className="p-5">
        <h1 className="text-2xl font-black">Admin Security Dashboard</h1>
        <p className="mt-2 text-slate-500">Admin role required or analytics unavailable.</p>
      </section>
    );
  }

  const cards = [
    ["Users", analytics.totals.totalUsers],
    ["Messages", analytics.totals.totalMessages],
    ["Scans", analytics.totals.totalScans],
    ["Dangerous links", analytics.totals.dangerousLinks],
    ["Malware files", analytics.totals.malwareFiles]
  ];

  return (
    <section className="grid gap-5 p-5">
      <h1 className="text-2xl font-black">Admin Security Dashboard</h1>
      <div className="grid gap-3 md:grid-cols-5">
        {cards.map(([label, value]) => (
          <div className="rounded-lg border border-slate-200 bg-white p-4" key={label}>
            <div className="text-2xl font-black">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Threats per day" data={analytics.threatsPerDay.map((item) => ({ name: item._id, value: item.threats }))} />
        <ChartCard title="Top malicious domains" data={analytics.topDomains.map((item) => ({ name: item._id, value: item.count }))} />
      </div>
    </section>
  );
}

function ChartCard({ title, data }) {
  return (
    <div className="h-80 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-4 font-black">{title}</h2>
      <ResponsiveContainer height="85%" width="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AdminDashboard;
