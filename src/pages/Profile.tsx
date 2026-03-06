import React, { useState, useEffect } from "react";
import { 
  History, 
  TrendingUp, 
  Award, 
  Calendar, 
  ChevronRight, 
  BarChart3,
  BrainCircuit,
  Target,
  FileDown,
  Sparkles,
  Loader2,
  User as UserIcon,
  LineChart as LineChartIcon,
  Zap
} from "lucide-react";
import { motion } from "motion/react";
import { User, InterviewResult } from "../types";
import { analyzePerformanceTrend, predictCareer } from "../services/geminiService";
import jsPDF from "jspdf";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

interface ProfileProps {
  user: User;
  theme: "dark" | "light";
}

export default function Profile({ user, theme }: ProfileProps) {
  const [interviews, setInterviews] = useState<InterviewResult[]>([]);
  const [trend, setTrend] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const chartData = [...interviews].reverse().map((item, index) => ({
    name: `Session ${index + 1}`,
    score: item.score,
    date: new Date(item.created_at).toLocaleDateString()
  }));

  const radarData = prediction?.radar_stats ? [
    { subject: 'DSA', A: prediction.radar_stats.dsa, fullMark: 100 },
    { subject: 'OOPS', A: prediction.radar_stats.oops, fullMark: 100 },
    { subject: 'DBMS', A: prediction.radar_stats.dbms, fullMark: 100 },
    { subject: 'Communication', A: prediction.radar_stats.communication, fullMark: 100 },
    { subject: 'Aptitude', A: prediction.radar_stats.aptitude, fullMark: 100 },
  ] : [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/interviews/user/${user.id}`);
        const data = await res.json();
        setInterviews(data);

        if (data.length > 0) {
          const [trendData, predictionData] = await Promise.all([
            analyzePerformanceTrend(JSON.stringify(data.slice(0, 5))),
            predictCareer(data.slice(0, 5))
          ]);
          setTrend(trendData);
          setPrediction(predictionData);
        }
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const downloadReport = (interview: InterviewResult) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Interview Performance Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Candidate: ${user.username}`, 20, 30);
    doc.text(`Role: ${interview.role}`, 20, 37);
    doc.text(`Type: ${interview.type}`, 20, 44);
    doc.text(`Date: ${new Date(interview.created_at).toLocaleDateString()}`, 20, 51);
    doc.text(`Score: ${interview.score}/100`, 20, 58);
    
    doc.setFontSize(14);
    doc.text("Feedback Summary:", 20, 75);
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(interview.feedback, 170);
    doc.text(splitText, 20, 85);

    doc.save(`Interview_Report_${interview.id}.pdf`);
  };

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-16">
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/10 text-xs font-bold text-indigo-400 uppercase tracking-widest"
        >
          <UserIcon className="w-3 h-3" /> Personal Profile
        </motion.div>
        <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
          Your <span className="text-gradient">Performance</span>
        </h1>
        <p className="text-zinc-400 text-xl max-w-2xl font-medium">
          Track your progress, analyze your trends, and download your interview reports.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-dark rounded-[3rem] border border-white/10 p-12 shadow-2xl shadow-black/50 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/40 border-4 border-white/10">
                <span className="text-4xl font-black text-white">{user.username[0].toUpperCase()}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-[#050505] shadow-xl">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-white tracking-tight">{user.username}</h2>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">{user.role || "Active Candidate"}</p>

            <div className="grid grid-cols-2 gap-6 mt-12 pt-12 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Sessions</p>
                <p className="text-3xl font-black text-white tracking-tighter">{interviews.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Avg Score</p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  {interviews.length > 0 ? Math.round(interviews.reduce((acc, i) => acc + i.score, 0) / interviews.length) : 0}%
                </p>
              </div>
            </div>
          </div>

          {prediction && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl shadow-emerald-500/20 relative overflow-hidden group"
            >
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black tracking-tight">Career Predictor</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black tracking-tighter">{prediction.placement_readiness_score}%</span>
                  <span className="text-emerald-100/60 text-xs font-bold uppercase tracking-widest mb-2">Readiness</span>
                </div>
                <p className="text-emerald-50/80 text-sm font-medium leading-relaxed">
                  You are {prediction.placement_readiness_score}% ready for {prediction.suitable_roles[0] || "Product-Based Companies"}.
                </p>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Skill Gaps</p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.skill_gaps.slice(0, 3).map((gap: string, i: number) => (
                      <span key={i} className="bg-black/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {trend && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-600 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group"
            >
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black tracking-tight">AI Trend Analysis</h3>
              </div>
              <div className="space-y-4">
                <p className="text-indigo-100/80 text-sm leading-relaxed font-medium">"{trend.performance_summary}"</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {trend.recommended_focus_areas.slice(0, 3).map((area: string, i: number) => (
                    <span key={i} className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-12">
          {prediction && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${theme === "dark" ? "glass-dark border-white/10" : "bg-white border-zinc-200"} rounded-[3rem] p-10 shadow-2xl shadow-black/50`}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-zinc-900"} tracking-tight`}>Skill Radar Chart</h3>
                  <p className="text-zinc-500 text-sm font-medium mt-1">Multi-dimensional analysis of your core competencies.</p>
                </div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                  <BarChart3 className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke={theme === "dark" ? "#ffffff10" : "#00000010"} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: theme === "dark" ? "#ffffff50" : "#00000050", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Skills"
                      dataKey="A"
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {interviews.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark rounded-[3rem] border border-white/10 p-10 shadow-2xl shadow-black/50"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Improvement Trend</h3>
                  <p className="text-zinc-500 text-sm font-medium mt-1">Visualization of your score progress over time.</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <LineChartIcon className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff30" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#ffffff30" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#151515', 
                        border: '1px solid #ffffff10',
                        borderRadius: '16px',
                        fontSize: '12px',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#818cf8" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          <div className="glass-dark rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white tracking-tight">Interview History</h3>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <History className="w-6 h-6 text-zinc-500" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Session</th>
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Score</th>
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Date</th>
                    <th className="px-10 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {interviews.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-black text-white tracking-tight">{item.type} Round</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-white text-lg tracking-tighter">{item.score}%</span>
                          <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className={`h-full ${item.score >= 80 ? "bg-emerald-500" : item.score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${item.score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="font-bold text-zinc-500 text-sm">{new Date(item.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-10 py-6">
                        <button 
                          onClick={() => downloadReport(item)}
                          className="p-3 bg-white/5 text-zinc-500 border border-white/5 rounded-xl hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all group/btn"
                        >
                          <FileDown className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {interviews.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-10 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <History className="w-12 h-12" />
                          <p className="font-black uppercase tracking-widest text-xs">No interviews recorded yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
