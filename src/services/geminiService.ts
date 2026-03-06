import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MODEL_NAME = "gemini-3-flash-preview";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

export const generateSpeech = async (text: string, voice: string = "Kore") => {
  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // The Gemini TTS returns raw PCM 16-bit 24kHz. 
      // We need to wrap it in a WAV header to play it with HTML5 Audio.
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const sampleRate = 24000;
      const numChannels = 1;
      const bitsPerSample = 16;
      const header = new ArrayBuffer(44);
      const view = new DataView(header);

      /* RIFF identifier */
      view.setUint32(0, 0x52494646, false); // "RIFF"
      /* file length */
      view.setUint32(4, 36 + len, true);
      /* RIFF type */
      view.setUint32(8, 0x57415645, false); // "WAVE"
      /* format chunk identifier */
      view.setUint32(12, 0x666d7420, false); // "fmt "
      /* format chunk length */
      view.setUint32(16, 16, true);
      /* sample format (raw) */
      view.setUint16(20, 1, true);
      /* channel count */
      view.setUint16(22, numChannels, true);
      /* sample rate */
      view.setUint32(24, sampleRate, true);
      /* byte rate (sample rate * block align) */
      view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
      /* block align (channel count * bytes per sample) */
      view.setUint16(32, numChannels * bitsPerSample / 8, true);
      /* bits per sample */
      view.setUint16(34, bitsPerSample, true);
      /* data chunk identifier */
      view.setUint32(36, 0x64617461, false); // "data"
      /* data chunk length */
      view.setUint32(40, len, true);

      const wavBlob = new Blob([header, bytes], { type: "audio/wav" });
      return URL.createObjectURL(wavBlob);
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const generateTechnicalQuestions = async (jobRole: string, programmingLanguage: string, difficulty: string, numQuestions: number = 5) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Act as a senior technical interviewer from a top-tier tech company like Google or OpenAI. 
Generate ${numQuestions} ${difficulty} level technical interview questions for a ${jobRole} role focusing on ${programmingLanguage}.

The questions should be deep, scenario-based, and test both fundamental knowledge and practical problem-solving skills.
Avoid generic questions. Focus on edge cases, architectural trade-offs, and performance optimization.

Return STRICT JSON:

{
  "interview_type": "technical",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question_id": "string",
      "question": "string",
      "expected_answer_summary": "string",
      "key_concepts": ["string"],
      "topic": "string"
    }
  ]
}`,
    config: {
      responseMimeType: "application/json",
      seed: Math.floor(Math.random() * 1000000),
    },
  });
  return JSON.parse(response.text);
};

export const generateCodingChallenges = async (programmingLanguage: string, difficulty: string, numQuestions: number = 2) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate ${numQuestions} coding challenges 
for ${programmingLanguage} at ${difficulty} level.

Each problem must include:
- Problem statement
- Input format
- Output format
- Constraints
- Example test case
- Expected approach

Return STRICT JSON:

{
  "interview_type": "coding",
  "difficulty": "${difficulty}",
  "problems": [
    {
      "problem_id": "string",
      "title": "string",
      "problem_statement": "string",
      "input_format": "string",
      "output_format": "string",
      "constraints": "string",
      "example": "string",
      "expected_approach": "string"
    }
  ]
}`,
    config: {
      responseMimeType: "application/json",
      seed: Math.floor(Math.random() * 1000000),
    },
  });
  return JSON.parse(response.text);
};

export const generateHRQuestions = async (jobRole: string, numQuestions: number = 5) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate ${numQuestions} HR interview questions 
for a ${jobRole} candidate.

Return STRICT JSON:

{
  "interview_type": "hr",
  "questions": [
    {
      "question": "string",
      "interviewer_intent": "string",
      "ideal_answer_structure": "string",
      "evaluation_criteria": ["string"]
    }
  ]
}`,
    config: {
      responseMimeType: "application/json",
      seed: Math.floor(Math.random() * 1000000),
    },
  });
  return JSON.parse(response.text);
};

export const generateAptitudeQuestions = async (difficulty: string, numQuestions: number = 5) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate ${numQuestions} ${difficulty} aptitude questions.

Include:
- Logical reasoning
- Quantitative aptitude
- Analytical thinking

Return STRICT JSON:

{
  "interview_type": "aptitude",
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "string",
      "explanation": "string",
      "difficulty": "${difficulty}"
    }
  ]
}`,
    config: {
      responseMimeType: "application/json",
      seed: Math.floor(Math.random() * 1000000),
    },
  });
  return JSON.parse(response.text);
};

export const analyzeResume = async (resumeText: string, targetRole: string) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze the following resume for a ${targetRole} position.

Resume Content:
"""
${resumeText}
"""

Return STRICT JSON:

{
  "ats_score": 0-100,
  "matched_skills": ["string"],
  "missing_skills": ["string"],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggested_improvements": ["string"],
  "recommended_certifications": ["string"],
  "recommended_topics_to_study": ["string"],
  "overall_feedback": "string"
}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text);
};

export const analyzePerformanceTrend = async (interviewsJson: string) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze the following interview history (JSON):
${interviewsJson}

Provide a summary of the candidate's performance trend over time.
Identify:
- Improvement areas
- Consistent strengths
- Recommended focus areas for the next 30 days

Return STRICT JSON:

{
  "performance_summary": "string",
  "improvement_trend": "Improving | Stable | Declining",
  "recommended_focus_areas": ["string"],
  "next_steps": ["string"]
}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text);
};

export const generateCommunicationQuestions = async (numQuestions: number = 5) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate ${numQuestions} communication and soft skills interview questions.
These questions should be designed to test:
- Emotional intelligence (EQ)
- Conflict resolution
- Team collaboration
- Leadership and initiative
- Adaptability

The questions should be "behavioral" (e.g., "Tell me about a time when...").

Return STRICT JSON:

{
  "interview_type": "communication",
  "questions": [
    {
      "question": "string",
      "interviewer_intent": "string",
      "ideal_answer_structure": "string",
      "evaluation_criteria": ["string"]
    }
  ]
}`,
    config: {
      responseMimeType: "application/json",
      seed: Math.floor(Math.random() * 1000000),
    },
  });
  return JSON.parse(response.text);
};

export const evaluateAnswer = async (question: string, expectedPoints: string, candidateAnswer: string) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Evaluate the candidate’s answer.

Question:
"${question}"

Expected Key Points:
${expectedPoints}

Candidate Answer:
"${candidateAnswer}"

Return STRICT JSON:

{
  "score_out_of_100": 0-100,
  "technical_accuracy": 0-25,
  "depth_of_knowledge": 0-20,
  "clarity": 0-15,
  "structure": 0-15,
  "communication": 0-15,
  "relevance": 0-10,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvement_suggestions": ["string"],
  "recommended_topics": ["string"],
  "overall_feedback": "string"
}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text);
};

export const analyzeConfidence = async (speechText: string) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze this spoken response:

"${speechText}"

Evaluate:
- Confidence level
- Tone professionalism
- Filler words usage
- Speaking clarity
- Structured thinking

Return STRICT JSON:

{
  "confidence_score": 0-100,
  "communication_score": 0-100,
  "professional_tone_score": 0-100,
  "filler_word_analysis": "string",
  "body_language_estimation": "string",
  "strengths": ["string"],
  "areas_to_improve": ["string"],
  "practice_suggestions": ["string"]
}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text);
};

export const generateCompanySpecificQuestions = async (company: string, jobRole: string, difficulty: string, numQuestions: number = 5) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Act as a senior interviewer from ${company}. 
Generate ${numQuestions} ${difficulty} level interview questions for a ${jobRole} role.
Adjust your questioning style, behavioral focus, and problem difficulty to match ${company}'s specific culture and leadership principles (e.g., Amazon's Leadership Principles, Google's Googlyness).

Return STRICT JSON:

{
  "interview_type": "company_specific",
  "company": "${company}",
  "questions": [
    {
      "question": "string",
      "intent": "string",
      "company_principle_targeted": "string",
      "expected_answer_summary": "string"
    }
  ]
}`,
    config: {
      responseMimeType: "application/json",
      seed: Math.floor(Math.random() * 1000000),
    },
  });
  return JSON.parse(response.text);
};

export const generateFutureSelfQuestions = async (numQuestions: number = 5) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Act as the "Future Self" of the candidate, 5 years from now. 
Your goal is to be emotional, motivational, reflective, and powerful. 
Ask ${numQuestions} deep, psychological questions that force self-awareness and build internal motivation.
Example: "Why didn't you start practicing earlier?", "What excuses are you making today that are holding me back?"

Return STRICT JSON:

{
  "interview_type": "future_self",
  "questions": [
    {
      "question": "string",
      "psychological_intent": "string",
      "reflection_prompt": "string"
    }
  ]
}`,
    config: {
      responseMimeType: "application/json",
      seed: Math.floor(Math.random() * 1000000),
    },
  });
  return JSON.parse(response.text);
};

export const generateRoadmap = async (resumeAnalysis: any, targetRole: string) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Based on this resume analysis: ${JSON.stringify(resumeAnalysis)}
Generate a 30-day personalized roadmap to become a top-tier ${targetRole}.

Return STRICT JSON:

{
  "target_role": "${targetRole}",
  "duration": "30 Days",
  "weekly_targets": [
    {
      "week": 1,
      "focus": "string",
      "daily_plan": ["string"],
      "resources": ["string"]
    }
  ],
  "overall_strategy": "string"
}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text);
};

export const predictCareer = async (pastInterviews: any[]) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze these interview results: ${JSON.stringify(pastInterviews)}
Predict the candidate's career readiness and suitable roles.

Return STRICT JSON:

{
  "placement_readiness_score": 0-100,
  "suitable_roles": ["string"],
  "skill_gaps": ["string"],
  "estimated_readiness_by_company_type": {
    "product_based": 0-100,
    "service_based": 0-100,
    "startup": 0-100
  },
  "radar_stats": {
    "dsa": 0-100,
    "oops": 0-100,
    "dbms": 0-100,
    "communication": 0-100,
    "aptitude": 0-100
  },
  "career_advice": "string"
}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text);
};

export const generateMentorResponse = async (userMessage: string, chatHistory: any[]) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `You are an AI Career Mentor. Provide guidance, motivation, and technical advice.
User: ${userMessage}
History: ${JSON.stringify(chatHistory)}`,
  });
  return response.text;
};
