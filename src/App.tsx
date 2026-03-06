import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  UserCircle, 
  Trophy, 
  FileText, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  History,
  BrainCircuit,
  Code2,
  Users,
  Calculator
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, InterviewType } from "./types";

// Pages
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import InterviewRoom from "./pages/InterviewRoom";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [interviewConfig, setInterviewConfig] = useState<{ type: InterviewType; role: string; language: string; difficulty: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setActiveTab("dashboard");
  };

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setInterviewConfig(null);
  };

  const startInterview = (type: InterviewType, role: string, language: string, difficulty: string, extraConfig?: any) => {
    setInterviewConfig({ type, role, language, difficulty, ...extraConfig });
    setActiveTab("interview");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "resume", label: "Resume Analyzer", icon: FileText },
    { id: "profile", label: "Career & Analytics", icon: History },
  ];

  if (user.role === "admin") {
    navItems.push({ id: "admin", label: "Admin Panel", icon: ShieldCheck });
  }

  return (
    <div className={`flex h-screen ${theme === "dark" ? "bg-[#020202] text-white" : "bg-zinc-50 text-zinc-900"} font-sans overflow-hidden bg-mesh relative transition-colors duration-500`}>
      {/* Background Glows */}
      {theme === "dark" && (
        <>
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] -z-10 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] -z-10 animate-pulse" />
        </>
      )}

      {/* Sidebar */}
      <aside className={`w-80 ${theme === "dark" ? "glass-dark border-white/10" : "bg-white border-zinc-200"} border-r flex flex-col m-6 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50 transition-all duration-500`}>
        <div className="p-10 flex items-center justify-between">
          <div className="flex items-center gap-4 text-inherit font-black text-3xl tracking-tighter">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 rotate-3">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <span className={theme === "dark" ? "text-gradient" : "text-zinc-900"}>InterviewPro</span>
          </div>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl ${theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-zinc-100 hover:bg-zinc-200"} transition-colors`}
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
        </div>

        <nav className="flex-1 px-6 space-y-3 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden ${
                activeTab === item.id 
                  ? theme === "dark" 
                    ? "bg-white/10 text-white font-black shadow-2xl border border-white/20" 
                    : "bg-zinc-900 text-white font-black shadow-xl"
                  : theme === "dark"
                    ? "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                    : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              }`}
            >
              {activeTab === item.id && theme === "dark" && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 -z-10"
                />
              )}
              <item.icon className={`w-6 h-6 transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 ${activeTab === item.id ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" : ""}`} />
              <span className="tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 space-y-6">
          <div className={`p-5 ${theme === "dark" ? "glass-dark border-white/10" : "bg-zinc-50 border-zinc-200"} rounded-3xl flex items-center gap-4 border shadow-xl`}>
            <div className={`w-12 h-12 ${theme === "dark" ? "bg-gradient-to-tr from-zinc-800 to-zinc-950" : "bg-zinc-200"} rounded-2xl flex items-center justify-center border border-white/10 shadow-inner`}>
              <UserCircle className="w-7 h-7 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-base font-black truncate ${theme === "dark" ? "text-white" : "text-zinc-900"} tracking-tight`}>{user.username}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-black text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-red-500/20 hover:border-red-500/40 active:scale-95 uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {activeTab === "dashboard" && (
              <Dashboard 
                onStartInterview={startInterview} 
                onTabChange={handleTabChange} 
                theme={theme}
              />
            )}
            {activeTab === "interview" && interviewConfig && (
              <InterviewRoom 
                user={user} 
                config={interviewConfig} 
                onComplete={() => setActiveTab("profile")} 
                theme={theme}
              />
            )}
            {activeTab === "resume" && <ResumeAnalyzer theme={theme} />}
            {activeTab === "leaderboard" && <Leaderboard theme={theme} />}
            {activeTab === "profile" && <Profile user={user} theme={theme} />}
            {activeTab === "admin" && user.role === "admin" && <AdminPanel theme={theme} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
