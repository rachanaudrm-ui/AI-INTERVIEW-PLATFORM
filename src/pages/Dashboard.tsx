import React, { useState, useEffect } from "react";
import { 
  Code2, 
  Users, 
  Calculator, 
  Cpu, 
  ChevronRight, 
  Sparkles,
  Zap,
  Target,
  BarChart3,
  FileText,
  Trophy,
  Video,
  Building2,
  UserPlus,
  MessageCircle,
  Globe,
  Smile,
  Send,
  X,
  Bot,
  WifiOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { InterviewType, Difficulty, Company, Language, Personality } from "../types";
import { generateMentorResponse } from "../services/geminiService";

interface DashboardProps {
  onStartInterview: (type: InterviewType, role: string, language: string, difficulty: string, extraConfig?: any) => void;
  onTabChange: (tab: string) => void;
  theme: "dark" | "light";
}

export default function Dashboard({ onStartInterview, onTabChange, theme }: DashboardProps) {
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [role, setRole] = useState("Software Engineer");
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [programmingLanguage, setProgrammingLanguage] = useState<Language>(Language.PYTHON);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [company, setCompany] = useState<Company>(Company.GOOGLE);
  const [personality, setPersonality] = useState<Personality>(Personality.FRIENDLY);

  // Mentor Chat State
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [streak, setStreak] = useState(5); // Mock streak
  const [mentorMessage, setMentorMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai", text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const interviewTypes = [
    { 
      id: InterviewType.TECHNICAL, 
      label: "Technical Round", 
      icon: Cpu, 
      color: "bg-blue-500", 
      desc: "Core concepts, architecture, and system design." 
    },
    { 
      id: InterviewType.CODING, 
      label: "Coding Round", 
      icon: Code2, 
      color: "bg-emerald-500", 
      desc: "Algorithms, data structures, and problem solving." 
    },
    { 
      id: InterviewType.COMPANY_SPECIFIC, 
      label: "Company Mode", 
      icon: Building2, 
      color: "bg-rose-500", 
      desc: "Practice Google, Amazon, or TCS style interviews." 
    },
    { 
      id: InterviewType.FUTURE_SELF, 
      label: "Future Self", 
      icon: UserPlus, 
      color: "bg-violet-500", 
      desc: "Psychological interview with your 5-year future self." 
    },
    { 
      id: InterviewType.HR, 
      label: "HR Round", 
      icon: Users, 
      color: "bg-amber-500", 
      desc: "Behavioral questions, culture fit, and soft skills." 
    },
    { 
      id: InterviewType.APTITUDE, 
      label: "Aptitude Round", 
      icon: Calculator, 
      color: "bg-indigo-500", 
      desc: "Logical reasoning, math, and analytical thinking." 
    },
  ];

  const languages = Object.values(Language);
  const roles = ["Software Engineer", "Frontend Developer", "Backend Developer", "Fullstack Developer", "Data Scientist", "DevOps Engineer", "Product Manager"];
  const companies = Object.values(Company);
  const personalities = Object.values(Personality);

  const handleSendMessage = async () => {
    if (!mentorMessage.trim()) return;
    const userMsg = mentorMessage;
    setMentorMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await generateMentorResponse(userMsg, chatHistory);
      setChatHistory(prev => [...prev, { role: "ai", text: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-16 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${theme === "dark" ? "glass border-white/10 text-indigo-400" : "bg-indigo-50 border-indigo-100 text-indigo-600"} text-xs font-bold uppercase tracking-widest`}
          >
            <Sparkles className="w-3 h-3" /> AI-Powered Practice
          </motion.div>
          <h1 className={`text-6xl font-black ${theme === "dark" ? "text-white" : "text-zinc-900"} tracking-tighter leading-none`}>
            Master Your <span className="text-gradient">Interview</span>
          </h1>
          <p className={`${theme === "dark" ? "text-zinc-400" : "text-zinc-500"} text-xl max-w-2xl font-medium`}>
            The most advanced AI interview platform. Practice with real-time feedback and industry-standard questions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-3xl ${theme === "dark" ? "glass-dark border-white/10" : "bg-white border-zinc-200 shadow-sm"} border`}>
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Streak</p>
              <p className={`text-xl font-black ${theme === "dark" ? "text-white" : "text-zinc-900"} tracking-tight`}>{streak} Days</p>
            </div>
          </div>

          <button 
            onClick={() => setOfflineMode(!offlineMode)}
            className={`flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all ${
              offlineMode 
                ? "bg-emerald-500 border-emerald-600 text-white" 
                : theme === "dark" ? "glass-dark border-white/10 text-zinc-400" : "bg-white border-zinc-200 text-zinc-600 shadow-sm"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${offlineMode ? "bg-white/20" : "bg-zinc-500/10"}`}>
              <WifiOff className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Mode</p>
              <p className="text-sm font-black tracking-tight">{offlineMode ? "Offline" : "Online"}</p>
            </div>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {interviewTypes.map((type, i) => (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedType(type.id)}
            className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 text-left group overflow-hidden ${
              selectedType === type.id 
                ? "border-indigo-500/50 bg-indigo-500/10 ring-4 ring-indigo-500/10" 
                : theme === "dark"
                  ? "border-white/5 bg-white/5 hover:bg-white/[0.08] hover:border-white/10"
                  : "border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 shadow-sm"
            }`}
          >
            <div className={`absolute -right-10 -top-10 w-32 h-32 blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${type.color}`} />
            
            <div className={`w-14 h-14 ${type.color} rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
              <type.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className={`font-black text-xl ${theme === "dark" ? "text-white" : "text-zinc-900"} tracking-tight`}>{type.label}</h3>
            <p className={`text-sm ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"} mt-3 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors`}>{type.desc}</p>
            
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              Select Round <ChevronRight className="w-3 h-3" />
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`${theme === "dark" ? "glass-dark border-white/10 shadow-black/50" : "bg-white border-zinc-200 shadow-zinc-200"} rounded-[3rem] border p-12 shadow-2xl space-y-12 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[100px] -z-10" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
                <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <h2 className={`text-3xl font-black ${theme === "dark" ? "text-white" : "text-zinc-900"} tracking-tight`}>Configure Session</h2>
                <p className="text-zinc-500 font-medium">Customize your practice experience</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-3 h-3" /> Target Role
                </label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"} border rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium appearance-none cursor-pointer hover:bg-white/10 transition-colors`}
                >
                  {roles.map(r => <option key={r} value={r} className="bg-zinc-900">{r}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" /> {selectedType === InterviewType.TECHNICAL || selectedType === InterviewType.CODING ? "Programming Language" : "Interview Language"}
                </label>
                <select 
                  value={selectedType === InterviewType.TECHNICAL || selectedType === InterviewType.CODING ? programmingLanguage : language}
                  onChange={(e) => {
                    if (selectedType === InterviewType.TECHNICAL || selectedType === InterviewType.CODING) {
                      setProgrammingLanguage(e.target.value as Language);
                    } else {
                      setLanguage(e.target.value as Language);
                    }
                  }}
                  className={`w-full ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"} border rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium appearance-none cursor-pointer hover:bg-white/10 transition-colors`}
                >
                  {selectedType === InterviewType.TECHNICAL || selectedType === InterviewType.CODING 
                    ? [Language.PYTHON, Language.JAVASCRIPT, Language.JAVA, Language.CPP, Language.CSHARP, Language.GO, Language.RUST, Language.SWIFT].map(l => <option key={l} value={l} className="bg-zinc-900">{l}</option>)
                    : [Language.ENGLISH, Language.HINDI, Language.TAMIL].map(l => <option key={l} value={l} className="bg-zinc-900">{l}</option>)
                  }
                </select>
              </div>

              {selectedType === InterviewType.COMPANY_SPECIFIC && (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="w-3 h-3" /> Target Company
                  </label>
                  <select 
                    value={company}
                    onChange={(e) => setCompany(e.target.value as Company)}
                    className={`w-full ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"} border rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium appearance-none cursor-pointer hover:bg-white/10 transition-colors`}
                  >
                    {companies.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                  </select>
                </div>
              )}

              {(selectedType === InterviewType.COMMUNICATION || selectedType === InterviewType.COMPANY_SPECIFIC) && (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Smile className="w-3 h-3" /> Personality
                  </label>
                  <select 
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value as Personality)}
                    className={`w-full ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"} border rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium appearance-none cursor-pointer hover:bg-white/10 transition-colors`}
                  >
                    {personalities.map(p => <option key={p} value={p} className="bg-zinc-900">{p}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" /> Difficulty
                </label>
                <div className="flex gap-3">
                  {Object.values(Difficulty).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                        difficulty === d 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                          : theme === "dark"
                            ? "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                            : "bg-zinc-100 border-zinc-200 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <button
                onClick={() => {
                  const finalLanguage = (selectedType === InterviewType.TECHNICAL || selectedType === InterviewType.CODING) ? programmingLanguage : language;
                  onStartInterview(selectedType, role, finalLanguage, difficulty, { company, personality });
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black px-12 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-500/25 flex items-center gap-3 group"
              >
                Launch Session
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabChange("resume")}
          className="p-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-indigo-500/30 relative overflow-hidden group cursor-pointer border border-white/20"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-2xl tracking-tight">Resume Analyzer</h4>
            <p className="text-indigo-100/80 text-sm leading-relaxed font-medium">Optimize your resume for ATS systems with AI insights.</p>
          </div>
          <button 
            className="bg-white text-indigo-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-black/10 active:scale-95"
          >
            Analyze Now
          </button>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabChange("leaderboard")}
          className="p-8 bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-orange-500/30 relative overflow-hidden group cursor-pointer border border-white/20"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-2xl tracking-tight text-white">Leaderboard</h4>
            <p className="text-orange-50 text-sm leading-relaxed font-medium opacity-80">Compete with top talent and showcase your skills.</p>
          </div>
          <button 
            className="bg-white text-orange-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-50 transition-all shadow-xl shadow-black/10 active:scale-95"
          >
            View Rankings
          </button>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStartInterview(InterviewType.COMMUNICATION, "Communication Master", "English", "Hard", { personality: Personality.STRICT })}
          className="p-8 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-emerald-500/30 relative overflow-hidden group cursor-pointer border border-white/20"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
            <Video className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-2xl tracking-tight">Communication Master</h4>
            <p className="text-emerald-50 text-sm leading-relaxed font-medium opacity-80">Practice lively talking to AI with live video feedback.</p>
          </div>
          <button 
            className="bg-white text-emerald-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center gap-2"
          >
            Go Live <Sparkles className="w-3 h-3" />
          </button>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStartInterview(InterviewType.COMMUNICATION, "Communication Practice", "English", "Medium")}
          className="p-8 bg-gradient-to-br from-purple-500 via-fuchsia-600 to-pink-700 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-purple-500/30 relative overflow-hidden group cursor-pointer border border-white/20"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
            <Video className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-2xl tracking-tight">AI Video Feedback</h4>
            <p className="text-purple-50 text-sm leading-relaxed font-medium opacity-80">Real-time analysis of your body language and tone.</p>
          </div>
          <button 
            className="bg-white text-purple-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-purple-50 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center gap-2"
          >
            Start Practice <Sparkles className="w-3 h-3" />
          </button>
        </motion.div>
      </section>

      {/* AI Mentor Chatbot */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {isMentorOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`w-96 h-[500px] ${theme === "dark" ? "glass-dark border-white/10" : "bg-white border-zinc-200 shadow-2xl"} border rounded-[2rem] flex flex-col overflow-hidden mb-4`}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <Bot className="w-6 h-6" />
                  <span className="font-black tracking-tight">AI Career Mentor</span>
                </div>
                <button onClick={() => setIsMentorOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatHistory.length === 0 && (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto">
                      <Bot className="w-8 h-8 text-indigo-400" />
                    </div>
                    <p className="text-sm text-zinc-500 font-medium px-6">
                      Hi! I'm your AI Mentor. Ask me anything about your career, interviews, or skills.
                    </p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                      msg.role === "user" 
                        ? "bg-indigo-600 text-white" 
                        : theme === "dark" ? "bg-white/5 text-zinc-300" : "bg-zinc-100 text-zinc-700"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`p-4 rounded-2xl ${theme === "dark" ? "bg-white/5" : "bg-zinc-100"} flex gap-1`}>
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-75" />
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 flex gap-2">
                <input 
                  type="text"
                  value={mentorMessage}
                  onChange={(e) => setMentorMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask your mentor..."
                  className={`flex-1 ${theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"} border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMentorOpen(!isMentorOpen)}
          className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/40 text-white"
        >
          <MessageCircle className="w-8 h-8" />
        </motion.button>
      </div>
    </div>
  );
}
