import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Star, TrendingUp, Search, User } from "lucide-react";
import { motion } from "motion/react";
import { LeaderboardEntry } from "../types";

interface LeaderboardProps {
  theme: "dark" | "light";
}

export default function Leaderboard({ theme }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        setEntries(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-amber-400" />;
      case 1: return <Medal className="w-6 h-6 text-zinc-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-700" />;
      default: return <span className="font-bold text-zinc-400">{index + 1}</span>;
    }
  };

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-16">
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/10 text-xs font-bold text-indigo-400 uppercase tracking-widest"
        >
          <Trophy className="w-3 h-3" /> Global Rankings
        </motion.div>
        <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
          Top <span className="text-gradient">Performers</span>
        </h1>
        <p className="text-zinc-400 text-xl max-w-2xl font-medium">
          The best candidates on the platform. Compete, improve, and climb the ranks.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {entries.slice(0, 3).map((entry, i) => (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-10 rounded-[3rem] border shadow-2xl overflow-hidden group ${
              i === 0 
                ? "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/30 shadow-amber-500/10" 
                : i === 1 
                ? "bg-gradient-to-br from-zinc-400/20 to-zinc-500/5 border-zinc-400/30 shadow-zinc-400/10"
                : "bg-gradient-to-br from-orange-400/20 to-orange-500/5 border-orange-400/30 shadow-orange-400/10"
            }`}
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 blur-3xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                  i === 0 ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]" : i === 1 ? "border-zinc-400" : "border-orange-400"
                } bg-zinc-900 overflow-hidden`}>
                  <User className="w-12 h-12 text-zinc-700" />
                </div>
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl ${
                  i === 0 ? "bg-amber-400 text-amber-950" : i === 1 ? "bg-zinc-400 text-zinc-950" : "bg-orange-400 text-orange-950"
                }`}>
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white tracking-tight truncate w-full px-4">{entry.username}</h3>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Rank #{i + 1}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full pt-6 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Avg Score</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{Math.round(entry.average_score)}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sessions</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{entry.interviews_count}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-dark rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-2xl font-black text-white tracking-tight">All Participants</h3>
          <div className="relative group max-w-md w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Rank</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Candidate</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Avg Score</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Interviews</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((entry, i) => (
                <motion.tr 
                  key={entry.user_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-10 py-6">
                    <span className="font-mono font-bold text-zinc-500">#{i + 1}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                        <User className="w-5 h-5 text-zinc-500" />
                      </div>
                      <span className="font-black text-white tracking-tight">{entry.username}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-white text-lg tracking-tighter">{Math.round(entry.average_score)}%</span>
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-indigo-500" style={{ width: `${entry.average_score}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="font-bold text-zinc-400">{entry.interviews_count} sessions</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      Active <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
