import React, { useState, useEffect } from "react";
import { 
  Users, 
  ShieldCheck, 
  Trash2, 
  BarChart3, 
  Activity, 
  Search, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";

interface AdminPanelProps {
  theme: "dark" | "light";
}

export default function AdminPanel({ theme }: AdminPanelProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, resultsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/results")
        ]);
        setUsers(await usersRes.json());
        setResults(await resultsRes.json());
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const deleteResult = async (id: number) => {
    if (!confirm("Are you sure you want to delete this result?")) return;
    try {
      await fetch(`/api/admin/results/${id}`, { method: "DELETE" });
      setResults(results.filter(r => r.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-16">
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/10 text-xs font-bold text-indigo-400 uppercase tracking-widest"
        >
          <ShieldCheck className="w-3 h-3" /> Command Center
        </motion.div>
        <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
          Admin <span className="text-gradient">Panel</span>
        </h1>
        <p className="text-zinc-400 text-xl max-w-2xl font-medium">
          Monitor platform usage, manage users, and analyze interview results.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div whileHover={{ y: -5 }} className="glass-dark p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Total Users</h3>
          </div>
          <p className="text-5xl font-black text-white tracking-tighter">{users.length}</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-dark p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Total Interviews</h3>
          </div>
          <p className="text-5xl font-black text-white tracking-tighter">{results.length}</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-dark p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Avg Score</h3>
          </div>
          <p className="text-5xl font-black text-white tracking-tighter">
            {results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) : 0}%
          </p>
        </motion.div>
      </div>

      <div className="glass-dark rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
        <div className="flex border-b border-white/5">
          <button 
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-8 text-xs font-black uppercase tracking-[0.2em] transition-all ${activeTab === "users" ? "text-indigo-400 bg-white/[0.02] border-b-2 border-indigo-500" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab("results")}
            className={`flex-1 py-8 text-xs font-black uppercase tracking-[0.2em] transition-all ${activeTab === "results" ? "text-indigo-400 bg-white/[0.02] border-b-2 border-indigo-500" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Interview Results
          </button>
        </div>

        <div className="p-10">
          {activeTab === "users" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">User</th>
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Role</th>
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Joined</th>
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                            <Users className="w-5 h-5 text-zinc-500" />
                          </div>
                          <span className="font-black text-white tracking-tight">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${u.role === "admin" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-white/5 border-white/10 text-zinc-500"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <span className="font-bold text-zinc-500 text-sm">{new Date(u.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                          Active <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Candidate</th>
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Session</th>
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Score</th>
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-6">
                        <span className="font-black text-white tracking-tight">{r.username}</span>
                      </td>
                      <td className="px-10 py-6">
                        <div>
                          <p className="font-black text-white tracking-tight">{r.type} Round</p>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{r.role}</p>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-white text-lg tracking-tighter">{r.score}%</span>
                          <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className={`h-full ${r.score >= 80 ? "bg-emerald-500" : r.score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${r.score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <button 
                          onClick={() => deleteResult(r.id)}
                          className="p-3 bg-white/5 text-zinc-500 border border-white/5 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all group/btn"
                        >
                          <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
