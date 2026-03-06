import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Send, 
  ChevronRight, 
  Loader2, 
  Trophy, 
  AlertCircle, 
  CheckCircle2,
  BrainCircuit,
  MessageSquare,
  Sparkles,
  Timer,
  FileDown,
  Zap,
  UserCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { InterviewType, Difficulty, User, Personality } from "../types";
import { 
  generateTechnicalQuestions, 
  generateCodingChallenges, 
  generateHRQuestions, 
  generateAptitudeQuestions, 
  generateCommunicationQuestions,
  generateCompanySpecificQuestions,
  generateFutureSelfQuestions,
  generateSpeech,
  evaluateAnswer, 
  analyzeConfidence 
} from "../services/geminiService";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface InterviewRoomProps {
  user: User;
  config: { 
    type: InterviewType; 
    role: string; 
    language: string; 
    difficulty: string;
    company?: string;
    personality?: string;
  };
  onComplete: () => void;
  theme: "dark" | "light";
}

export default function InterviewRoom({ user, config, onComplete, theme }: InterviewRoomProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [isRecording, setIsRecording] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [metrics, setMetrics] = useState({ confidence: 75, clarity: 80, professionalism: "Medium" });
  const [misuseDetected, setMisuseDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      setMisuseDetected(true);
      alert("Warning: Copy-pasting is not allowed during the interview. This activity has been logged.");
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        let data;
        if (config.type === InterviewType.TECHNICAL) {
          data = await generateTechnicalQuestions(config.role, config.language, config.difficulty);
          setQuestions(data.questions);
        } else if (config.type === InterviewType.CODING) {
          data = await generateCodingChallenges(config.language, config.difficulty);
          setQuestions(data.problems);
        } else if (config.type === InterviewType.HR) {
          data = await generateHRQuestions(config.role);
          setQuestions(data.questions);
        } else if (config.type === InterviewType.APTITUDE) {
          data = await generateAptitudeQuestions(config.difficulty);
          setQuestions(data.questions);
        } else if (config.type === InterviewType.COMMUNICATION) {
          data = await generateCommunicationQuestions();
          setQuestions(data.questions);
        } else if (config.type === InterviewType.COMPANY_SPECIFIC) {
          data = await generateCompanySpecificQuestions(config.company || "Google", config.role, config.difficulty);
          setQuestions(data.questions);
        } else if (config.type === InterviewType.FUTURE_SELF) {
          data = await generateFutureSelfQuestions();
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [config]);

  useEffect(() => {
    if (questions.length > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNext();
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [questions, currentIdx, isFinished]);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAvatarUrl = () => {
    if (config.type === InterviewType.FUTURE_SELF) {
      return `https://images.unsplash.com/photo-1620712943543-bcc4628c9757?w=400&h=400&fit=crop&q=80`; // Futuristic AI
    }
    switch (config.personality) {
      case Personality.STRICT:
        return `https://images.unsplash.com/photo-1675557009875-436f2978a6fa?w=400&h=400&fit=crop&q=80`; // Sleek professional robot
      case Personality.FAST_PACED:
        return `https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=400&fit=crop&q=80`; // Modern android
      case Personality.FRIENDLY:
      default:
        return `https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&h=400&fit=crop&q=80`; // Warm AI face
    }
  };

  const speakQuestion = async (text: string) => {
    if (!text) return;
    setIsSpeaking(true);
    try {
      const voice = config.personality === Personality.STRICT ? "Fenrir" : "Kore";
      const audioUrl = await generateSpeech(text, voice);
      if (audioUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Speech error:", error);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && currentIdx === 0 && !isFinished) {
      const q = questions[0];
      const text = q.question || q.problem_statement || q.question;
      speakQuestion(text);
    }
  }, [questions]);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = config.language === "Hindi" ? "hi-IN" : config.language === "Tamil" ? "ta-IN" : "en-US";
      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer(transcript);
      };
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, [config.language]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(err => console.error("Video play failed", err));
    }
  }, [videoStream]);

  const toggleCamera = async () => {
    setCameraError(null);
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" }, 
          audio: true 
        });
        setVideoStream(stream);
      } catch (err: any) {
        console.error("Camera access denied", err);
        setCameraError(err.message || "Could not access camera");
        // Try video only if audio+video fails
        try {
          const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setVideoStream(videoOnlyStream);
          setCameraError(null);
        } catch (videoErr) {
          console.error("Video-only access denied", videoErr);
        }
      }
    }
  };

  const handleNext = async () => {
    setEvaluating(true);
    try {
      const q = questions[currentIdx];
      const questionText = q.question || q.problem_statement || q.question;
      const expected = q.expected_answer_summary || q.expected_approach || q.ideal_answer_structure || q.correct_answer;
      
      const evaluation = await evaluateAnswer(questionText, expected, currentAnswer || "No answer provided");
      const confidence = await analyzeConfidence(currentAnswer || "No answer provided");
      
      setMetrics({
        confidence: confidence.confidence_score,
        clarity: confidence.clarity_score,
        professionalism: confidence.overall_impression
      });

      const result = {
        question: questionText,
        answer: currentAnswer,
        evaluation,
        confidence
      };
      
      setResults([...results, result]);
      setAnswers([...answers, currentAnswer]);
      
      // AI Reply logic
      setIsReplying(true);
      const reply = evaluation.overall_feedback.split('.')[0] + "."; // Get first sentence as reply
      setReplyText(reply);
      await speakQuestion(reply);
      
      // Wait a bit for the user to read/hear the reply
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIsReplying(false);
      setReplyText("");
      setCurrentAnswer("");
      setTimeLeft(120);

      if (currentIdx < questions.length - 1) {
        const nextIdx = currentIdx + 1;
        setCurrentIdx(nextIdx);
        const nextQ = questions[nextIdx];
        const nextText = nextQ.question || nextQ.problem_statement || nextQ.question;
        speakQuestion(nextText);
      } else {
        setIsFinished(true);
        saveResults([...results, result]);
      }
    } catch (err) {
      console.error("Evaluation failed", err);
    } finally {
      setEvaluating(false);
    }
  };

  const saveResults = async (allResults: any[]) => {
    const totalScore = allResults.reduce((acc, r) => acc + r.evaluation.score_out_of_100, 0) / allResults.length;
    const feedback = allResults.map(r => r.evaluation.overall_feedback).join("\n\n");
    
    await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        type: config.type,
        role: config.role,
        language: config.language,
        difficulty: config.difficulty,
        score: Math.round(totalScore),
        feedback,
        results_json: JSON.stringify(allResults)
      }),
    });
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Interview Performance Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Candidate: ${user.username}`, 20, 30);
    doc.text(`Role: ${config.role}`, 20, 37);
    doc.text(`Type: ${config.type}`, 20, 44);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 51);

    const totalScore = results.reduce((acc, r) => acc + r.evaluation.score_out_of_100, 0) / results.length;
    doc.setFontSize(16);
    doc.text(`Overall Score: ${Math.round(totalScore)}/100`, 20, 65);

    const tableData = results.map((r, i) => [
      `Q${i+1}`,
      r.evaluation.score_out_of_100,
      r.confidence.confidence_score,
      r.evaluation.technical_accuracy
    ]);

    (doc as any).autoTable({
      startY: 75,
      head: [["Question", "Score", "Confidence", "Accuracy"]],
      body: tableData,
    });

    doc.save(`Interview_Report_${user.username}.pdf`);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-indigo-600" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900">Preparing Your Interview</h2>
          <p className="text-zinc-500 mt-2">AI is generating industry-standard questions for you...</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const avgScore = Math.round(results.reduce((acc, r) => acc + r.evaluation.score_out_of_100, 0) / results.length);
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-2xl shadow-indigo-100/50"
        >
          <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-zinc-900">Interview Completed!</h1>
          <p className="text-zinc-500 text-lg mt-4">Great job! Here's how you performed.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Overall Score</p>
              <p className="text-4xl font-bold text-indigo-600 mt-2">{avgScore}/100</p>
            </div>
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Confidence</p>
              <p className="text-4xl font-bold text-emerald-600 mt-2">
                {Math.round(results.reduce((acc, r) => acc + r.confidence.confidence_score, 0) / results.length)}%
              </p>
            </div>
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Clarity</p>
              <p className="text-4xl font-bold text-amber-600 mt-2">
                {Math.round(results.reduce((acc, r) => acc + r.evaluation.clarity, 0) / results.length)}/15
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={downloadReport}
              className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
            >
              <FileDown className="w-5 h-5" /> Download PDF Report
            </button>
            <button 
              onClick={onComplete}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900">Detailed Feedback</h2>
          {results.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-zinc-900">Question {i + 1}</h3>
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
                  Score: {r.evaluation.score_out_of_100}/100
                </span>
              </div>
              <p className="text-zinc-600 italic">"{r.question}"</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Strengths
                  </h4>
                  <ul className="text-sm text-zinc-600 list-disc list-inside space-y-1">
                    {r.evaluation.strengths.slice(0, 3).map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-amber-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Improvements
                  </h4>
                  <ul className="text-sm text-zinc-600 list-disc list-inside space-y-1">
                    {r.evaluation.improvement_suggestions.slice(0, 3).map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const questionText = currentQuestion?.question || currentQuestion?.problem_statement || currentQuestion?.question;

  return (
    <div className="h-full flex flex-col bg-mesh">
      {/* Header */}
      <header className="glass-dark border-b border-white/10 px-12 py-6 flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 -z-10" />
        <div className="flex items-center gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 shadow-lg shadow-indigo-500/20">
            {config.type} Round
          </div>
          <h2 className="font-black text-2xl text-white tracking-tighter">{config.role}</h2>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 glass px-6 py-2.5 rounded-2xl border-white/20 shadow-xl">
            <Timer className={`w-5 h-5 ${timeLeft < 30 ? "text-red-400 animate-pulse" : "text-indigo-400"}`} />
            <span className={`font-mono font-bold text-lg ${timeLeft < 30 ? "text-red-400" : "text-white"}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <div className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">
            Question <span className="text-white text-lg ml-1">{currentIdx + 1}</span> <span className="opacity-30 mx-1">/</span> {questions.length}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question & Answer */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-dark rounded-[3.5rem] border border-white/10 p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] -z-10" />
            
            <div className="flex items-center gap-6 mb-10">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/30 relative overflow-hidden border-4 border-white/10">
                {/* AI Avatar Face Reveal */}
                {!avatarError ? (
                  <img 
                    src={getAvatarUrl()} 
                    alt="AI Interviewer" 
                    onError={() => setAvatarError(true)}
                    className={`w-full h-full object-cover transition-all duration-500 ${isSpeaking ? "scale-110 brightness-110" : "scale-100 brightness-90"}`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-900/50 flex items-center justify-center">
                    <UserCircle className="w-20 h-20 text-indigo-300 opacity-50" />
                  </div>
                )}
                
                {/* Lip Sync / Speaking Animation Overlay */}
                {isSpeaking && (
                  <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                    <div className="flex gap-1.5">
                      <motion.div 
                        animate={{ height: [8, 24, 8] }}
                        transition={{ repeat: Infinity, duration: 0.3 }}
                        className="w-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                      />
                      <motion.div 
                        animate={{ height: [8, 32, 8] }}
                        transition={{ repeat: Infinity, duration: 0.3, delay: 0.1 }}
                        className="w-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                      />
                      <motion.div 
                        animate={{ height: [8, 24, 8] }}
                        transition={{ repeat: Infinity, duration: 0.3, delay: 0.2 }}
                        className="w-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                      />
                    </div>
                  </div>
                )}
                
                {isSpeaking && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-indigo-400 rounded-[2.5rem] -z-10"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-4xl font-black text-white tracking-tighter">
                    {config.type === InterviewType.FUTURE_SELF ? "Your Future Self" : config.personality || "Interviewer"}
                  </h3>
                  {config.company && (
                    <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black text-indigo-300 uppercase tracking-widest border border-white/10">
                      {config.company}
                    </span>
                  )}
                </div>
                {isSpeaking && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
                      {isReplying ? "AI is replying..." : "AI is asking..."}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="markdown-body !bg-transparent !text-zinc-200 text-2xl font-medium leading-relaxed tracking-tight">
                <ReactMarkdown>
                  {isReplying ? replyText : questionText}
                </ReactMarkdown>
              </div>
            </div>
            {currentQuestion?.example && (
              <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 font-mono text-sm group-hover:bg-white/[0.08] transition-colors">
                <p className="font-black text-indigo-400 mb-3 uppercase text-[10px] tracking-widest">Example Case</p>
                <code className="text-zinc-400">{currentQuestion.example}</code>
              </div>
            )}
          </motion.div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="font-black text-white uppercase text-xs tracking-widest flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-400" /> Your Response
              </h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleCamera}
                  className={`p-3 rounded-xl transition-all duration-300 border ${videoStream ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10"}`}
                >
                  {videoStream ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                <button 
                  onClick={toggleRecording}
                  className={`p-3 rounded-xl transition-all duration-300 border ${isRecording ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse" : "bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10"}`}
                >
                  {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here or use voice-to-text..."
              className="w-full h-80 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-xl text-white placeholder-zinc-600 resize-none transition-all shadow-2xl shadow-black/20 font-medium"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              disabled={evaluating}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black px-12 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-500/25 flex items-center gap-3 disabled:opacity-70 group"
            >
              {evaluating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  {currentIdx === questions.length - 1 ? "Complete Interview" : "Next Question"}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Video Feed & Stats */}
        <div className="w-[28rem] glass-dark border-l border-white/5 p-12 space-y-12 overflow-y-auto">
          <div className="relative aspect-video bg-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover mirror"
            />
            {!videoStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 space-y-4 p-6 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                  <VideoOff className="w-8 h-8 opacity-20" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Camera Inactive</p>
                  {cameraError && (
                    <p className="text-[10px] text-red-500/60 mt-2 font-medium">{cameraError}</p>
                  )}
                </div>
              </div>
            )}
            {videoStream && (
              <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">AI Live Analysis</span>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <h4 className="font-black text-white uppercase text-[10px] tracking-[0.3em] opacity-50">Real-time Feedback</h4>
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <span>Confidence</span>
                  <span className="text-emerald-400">{metrics.confidence}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${metrics.confidence}%` }} 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]" 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <span>Clarity</span>
                  <span className="text-indigo-400">{metrics.clarity}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${metrics.clarity}%` }} 
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.3)]" 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <span>Professionalism</span>
                  <span className="text-purple-400">{metrics.professionalism}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "100%" }} 
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 glass-dark rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
            <h4 className="font-black text-white text-sm tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> AI Suggestions
            </h4>
            <ul className="space-y-4">
              {[
                "Maintain eye contact with the camera lens.",
                "Try to reduce filler words like 'basically'.",
                "Use the STAR method for this response."
              ].map((tip, i) => (
                <li key={i} className="flex gap-4 text-xs text-zinc-400 leading-relaxed font-medium">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
