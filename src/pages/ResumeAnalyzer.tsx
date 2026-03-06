import React, { useState } from "react";
import { 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Target,
  Sparkles,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeResume, generateRoadmap } from "../services/geminiService";
import ReactMarkdown from "react-markdown";

interface ResumeAnalyzerProps {
  theme: "dark" | "light";
}

export default function ResumeAnalyzer({ theme }: ResumeAnalyzerProps) {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!resumeText) return;
    setLoading(true);
    try {
      const data = await analyzeResume(resumeText, targetRole);
      setResult(data);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!result) return;
    setRoadmapLoading(true);
    try {
      const data = await generateRoadmap(resumeText, targetRole);
      setRoadmap(data);
    } catch (err) {
      console.error("Roadmap generation failed", err);
    } finally {
      setRoadmapLoading(false);
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
          <FileText className="w-3 h-3" /> Resume Optimization
        </motion.div>
        <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
          ATS <span className="text-gradient">Scanner</span>
        </h1>
        <p className="text-zinc-400 text-xl max-w-2xl font-medium">
          Upload your resume to get an AI-powered ATS score and personalized optimization tips.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="glass-dark rounded-[3rem] border border-white/10 p-10 shadow-2xl shadow-black/50 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -z-10" />
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Target Role</label>
              <input 
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Resume Content</label>
              <textarea 
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full h-[30rem] bg-white/5 border border-white/10 rounded-[2rem] p-8 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium resize-none"
                placeholder="Paste your resume text here..."
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !resumeText}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Upload className="w-6 h-6" /> Analyze Resume</>}
            </button>
          </div>
        </div>

        <div className="space-y-12">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-16 glass-dark rounded-[3rem] border-2 border-dashed border-white/5 text-zinc-600"
              >
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                  <FileText className="w-10 h-10 opacity-20" />
                </div>
                <p className="font-black uppercase tracking-[0.2em] text-xs opacity-40">Analysis results will appear here</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="space-y-12"
              >
                <div className="glass-dark rounded-[3rem] border border-white/10 p-12 shadow-2xl shadow-black/50 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 to-transparent -z-10" />
                  
                  <div className="relative inline-block">
                    <svg className="w-48 h-48 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                      <circle className="text-white/5" strokeWidth="12" stroke="currentColor" fill="transparent" r="80" cx="96" cy="96" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 502 }}
                        animate={{ strokeDashoffset: 502 - (502 * result.ats_score) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-indigo-500" 
                        strokeWidth="12" 
                        strokeDasharray={502} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="80" cx="96" cy="96" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-white tracking-tighter">{result.ats_score}</span>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">ATS Score</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-8 tracking-tight">Match Analysis</h3>
                  <p className="text-zinc-400 text-lg mt-4 leading-relaxed font-medium">{result.overall_feedback}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-dark rounded-[2.5rem] border border-white/5 p-8 space-y-6 shadow-xl">
                    <h4 className="font-black text-emerald-400 flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                      <CheckCircle2 className="w-5 h-5" /> Strengths
                    </h4>
                    <ul className="space-y-4">
                      {result.strengths.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-zinc-400 flex gap-4 font-medium leading-relaxed">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-dark rounded-[2.5rem] border border-white/5 p-8 space-y-6 shadow-xl">
                    <h4 className="font-black text-amber-400 flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                      <AlertCircle className="w-5 h-5" /> Weaknesses
                    </h4>
                    <ul className="space-y-4">
                      {result.weaknesses.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-zinc-400 flex gap-4 font-medium leading-relaxed">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-[3rem] p-12 text-white space-y-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                      <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight">Optimization Roadmap</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-emerald-400" /> Critical Improvements
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {result.suggested_improvements.map((imp: string, i: number) => (
                          <span key={i} className="bg-white/5 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 text-zinc-300">
                            {imp}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-indigo-400" /> Knowledge Gaps
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {result.recommended_topics_to_study.map((topic: string, i: number) => (
                          <span key={i} className="bg-indigo-500/10 text-indigo-300 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-500/20">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-white/5">
                    <button
                      onClick={handleGenerateRoadmap}
                      disabled={roadmapLoading}
                      className="w-full bg-white/5 border border-white/10 text-white font-black py-5 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                    >
                      {roadmapLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-6 h-6 text-indigo-400" /> Generate 30-Day Roadmap</>}
                    </button>
                  </div>

                  {roadmap && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-10 p-8 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/20"
                    >
                      <h4 className="text-xl font-black text-white mb-6 tracking-tight">Your Personalized 30-Day Roadmap</h4>
                      <div className="space-y-8">
                        {roadmap.weeks.map((week: any, i: number) => (
                          <div key={i} className="space-y-4">
                            <h5 className="text-indigo-400 font-black uppercase tracking-widest text-xs">Week {week.week}: {week.focus}</h5>
                            <div className="grid grid-cols-1 gap-4">
                              {week.daily_plan.map((day: any, j: number) => (
                                <div key={j} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                  <p className="text-white font-bold text-sm mb-1">Day {day.day}: {day.task}</p>
                                  <p className="text-zinc-500 text-xs">{day.resource}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
