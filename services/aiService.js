// Safely retrieve API Keys from process.env
const getNvidiaApiKey = () => process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEY;

// Helper: Extract valid JSON block from raw LLM output text
const parseJSONFromText = (text) => {
  if (!text) return null;
  
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch (e) {
    // Attempt markdown json code block extraction
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (err) {
        console.warn('Failed to parse json inside markdown block', err.message);
      }
    }

    // Attempt greedy brace matching
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (err) {
        console.warn('Failed brace extraction', err.message);
      }
    }
  }
  return null;
};

// --- NVIDIA AI Endpoints Integration (OpenAI-compatible REST API) ---
async function callNvidiaAI(prompt, systemPrompt = "You are an expert career intelligence AI that responds strictly in valid JSON format.") {
  const apiKey = getNvidiaApiKey();
  if (!apiKey) return null;

  const modelName = process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct";
  console.log(`[AI Service] Querying NVIDIA AI Endpoints (${modelName})...`);

  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`NVIDIA AI API status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// --- Strategic Intelligent Fallback Engine for Resume Gap Analysis ---
const fallbackAnalyzeResume = (resumeText, jobDescription) => {
  const cleanResume = (resumeText || '').toLowerCase();
  const cleanJD = (jobDescription || '').toLowerCase();

  const keywords = [
    'react', 'javascript', 'typescript', 'node.js', 'express', 'mongodb', 'sql', 'python',
    'rest api', 'git', 'docker', 'aws', 'ci/cd', 'css', 'html', 'tailwind', 'redux',
    'system design', 'agile', 'testing', 'jest', 'communication', 'leadership', 'graphql',
    'security', 'jwt', 'performance', 'microservices', 'devops'
  ];

  const jdKeywords = keywords.filter((kw) => cleanJD.includes(kw));
  const matched = jdKeywords.filter((kw) => cleanResume.includes(kw));
  const missing = jdKeywords.filter((kw) => !cleanResume.includes(kw));

  if (missing.length === 0 && jdKeywords.length < 3) {
    const defaultChecklist = ['TypeScript', 'Docker & CI/CD', 'Automated Unit Testing', 'System Architecture'];
    defaultChecklist.forEach((item) => {
      if (!cleanResume.includes(item.toLowerCase())) {
        missing.push(item);
      }
    });
  }

  let matchRatio = jdKeywords.length > 0 ? (matched.length / jdKeywords.length) : 0.65;
  if (cleanResume.length < 50) matchRatio = 0.35;
  let matchScore = Math.round(matchRatio * 100);
  matchScore = Math.min(96, Math.max(38, matchScore));

  return {
    matchScore,
    matchedSkills: matched.map((s) => s.toUpperCase()),
    missingSkills: missing.slice(0, 6).map((s) => s.toUpperCase()),
    strengths: [
      'Demonstrated foundation in core software engineering principles.',
      'Clear experience articulating project outcomes and tech stack usage.',
      'Strong alignment with role primary responsibilities.'
    ],
    improvements: [
      `Quantify impact by inserting metrics (e.g. "Improved query performance by 40% using indexing").`,
      missing.length > 0 
        ? `Explicitly showcase hands-on usage of missing target stack: ${missing.slice(0, 3).join(', ').toUpperCase()}.` 
        : `Include architectural decisions and system scale parameters for recent projects.`,
      `Tailor summary section directly to key priorities emphasized in the job description.`
    ]
  };
};

// --- Fallback Question Generator ---
const fallbackGenerateQuestions = (jobDescription, level = 'mid') => {
  const cleanJD = (jobDescription || '').toLowerCase();
  const isBackend = cleanJD.includes('node') || cleanJD.includes('express') || cleanJD.includes('backend') || cleanJD.includes('api');

  return [
    {
      id: 'q1',
      type: 'technical',
      question: isBackend 
        ? `How do you handle API authentication and state management securely in a distributed Node.js/Express architecture?` 
        : `Explain how React's Virtual DOM works and how you optimize component re-renders in a high-throughput UI.`,
      context: `Assesses core framework internals and architectural decision making.`,
      sampleAnswer: `I implement stateless JWT authentication with HTTPS-only cookies, combined with memoization and strategic state encapsulation.`
    },
    {
      id: 'q2',
      type: 'technical',
      question: `Describe a production database bottleneck you encountered and the exact steps you took to diagnose and resolve it.`,
      context: `Evaluates performance tuning, indexing, and query optimization maturity.`,
      sampleAnswer: `I analyzed slow query logs, added composite database indexes, and implemented Redis caching for high-read endpoints.`
    },
    {
      id: 'q3',
      type: 'behavioral',
      question: `Tell me about a time when a critical bug occurred right before a launch deadline. How did you prioritize and communicate under pressure?`,
      context: `Tests crisis management, communication, and pragmatic engineering trade-offs.`,
      sampleAnswer: `I isolated the root cause, communicated clear risk options to stakeholders, and delivered a targeted hotfix with added telemetry.`
    },
    {
      id: 'q4',
      type: 'technical',
      question: `How do you approach writing testable code, and what CI/CD automation checks do you mandate before merging to main?`,
      context: `Evaluates code quality standards, unit testing, and deployment pipeline confidence.`,
      sampleAnswer: `I structure code into isolated functional modules, maintain >80% test coverage, and enforce strict linter and integration build checks in CI.`
    },
    {
      id: 'q5',
      type: 'behavioral',
      question: `Give an example of a technical disagreement you had with a senior team member or architect. How did you resolve it?`,
      context: `Assesses collaboration, technical advocacy based on evidence, and team alignment.`,
      sampleAnswer: `I created a lightweight benchmark prototype, presented empirical data on memory/latency trade-offs, and agreed on a hybrid solution.`
    }
  ];
};

// --- Fallback Answer Evaluator ---
const fallbackEvaluateAnswer = (question, answer, jobDescription) => {
  const cleanAns = (answer || '').trim();
  const wordCount = cleanAns.split(/\s+/).length;

  if (wordCount < 6) {
    return {
      score: 3,
      clarity: 4,
      relevance: 3,
      technicalAccuracy: 2,
      feedback: [
        'Answer is far too brief. Expand with specific technical implementation details and real examples.',
        'Use the STAR method (Situation, Task, Action, Result) to provide actionable context.'
      ],
      keyTakeaway: 'Incorporate specific metrics and step-by-step methodologies.'
    };
  }

  const score = Math.min(9, Math.max(6, Math.floor(6 + (wordCount / 25))));
  return {
    score,
    clarity: Math.min(10, score + 1),
    relevance: score,
    technicalAccuracy: Math.min(10, Math.max(5, score)),
    feedback: [
      `Solid structure and clear communication of key concepts.`,
      `To elevate to a top-tier answer, explicitly mention metrics or concrete tools used during resolution.`
    ],
    keyTakeaway: `Great response framework — adding exact numbers or scale parameters will make it outstanding.`
  };
};

// ============================================================================
// MAIN SERVICE EXPORTS (NVIDIA AI Endpoints -> Heuristic Fallback)
// ============================================================================

/**
 * Phase 1: Resume vs Job Description Gap Analysis
 */
async function analyzeResume(resumeText, jobDescription) {
  const prompt = `
Compare this candidate's resume text to the provided Job Description.

RESUME TEXT:
"""
${(resumeText || '').slice(0, 4000)}
"""

JOB DESCRIPTION:
"""
${(jobDescription || '').slice(0, 4000)}
"""

Respond STRICTLY in JSON format with no markdown wrappers or extra commentary:
{
  "matchScore": <number from 0 to 100 representing job alignment percentage>,
  "matchedSkills": [<array of 3-6 key matched skills/technologies found in both>],
  "missingSkills": [<array of 3-6 critical missing skills/keywords required by JD but missing in resume>],
  "strengths": [<array of 3 specific positive highlights of this candidate for this role>],
  "improvements": [<array of EXACTLY 3 strategic, actionable bullet points to improve resume score>]
}
`;

  // 1. Try NVIDIA AI Endpoints (Nemotron / Llama)
  if (getNvidiaApiKey()) {
    try {
      const responseText = await callNvidiaAI(prompt);
      const parsed = parseJSONFromText(responseText);
      if (parsed && typeof parsed.matchScore === 'number') {
        return {
          matchScore: Math.min(100, Math.max(0, Math.round(parsed.matchScore))),
          matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
          missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          improvements: Array.isArray(parsed.improvements) && parsed.improvements.length === 3 
            ? parsed.improvements 
            : (parsed.improvements || []).slice(0, 3)
        };
      }
    } catch (err) {
      console.warn('[AI Service] NVIDIA AI Endpoints call failed:', err.message);
    }
  }

  // 2. Fallback Heuristic Engine
  return fallbackAnalyzeResume(resumeText, jobDescription);
}

/**
 * Phase 2: Mock Interview Question Generator
 */
async function generateQuestions(jobDescription, level = 'mid') {
  const prompt = `
Generate 5 interview questions for a candidate applying to this role (${level} level).
Include a mix of technical concepts and behavioral situational questions.

JOB DESCRIPTION:
"""
${(jobDescription || '').slice(0, 3000)}
"""

Respond STRICTLY in JSON format:
{
  "questions": [
    {
      "id": "q1",
      "type": "technical" | "behavioral",
      "question": "<The question string>",
      "context": "<1 line explaining what this evaluates>",
      "sampleAnswer": "<2 line ideal answer key>"
    }
  ]
}
`;

  // 1. Try NVIDIA AI Endpoints (Nemotron / Llama)
  if (getNvidiaApiKey()) {
    try {
      const responseText = await callNvidiaAI(prompt);
      const parsed = parseJSONFromText(responseText);
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed.questions.slice(0, 5).map((q, idx) => ({
          id: q.id || `q${idx + 1}`,
          type: q.type === 'behavioral' ? 'behavioral' : 'technical',
          question: q.question,
          context: q.context || 'Evaluates key technical requirements for this role.',
          sampleAnswer: q.sampleAnswer || ''
        }));
      }
    } catch (err) {
      console.warn('[AI Service] NVIDIA Question Gen failed:', err.message);
    }
  }

  // 2. Fallback Engine
  return fallbackGenerateQuestions(jobDescription, level);
}

/**
 * Phase 3: Answer Evaluation & Feedback
 */
async function evaluateAnswer(question, answer, jobDescription) {
  const prompt = `
Evaluate candidate's answer for the following interview question.

QUESTION:
"${question}"

CANDIDATE ANSWER:
"${answer}"

JOB CONTEXT:
"${(jobDescription || '').slice(0, 1500)}"

Respond STRICTLY in JSON format:
{
  "score": <number from 0 to 10>,
  "clarity": <number 0-10>,
  "relevance": <number 0-10>,
  "technicalAccuracy": <number 0-10>,
  "feedback": [
    "<Line 1 of constructive feedback>",
    "<Line 2 of constructive feedback>"
  ],
  "keyTakeaway": "<1 line summary recommendation>"
}
`;

  // 1. Try NVIDIA AI Endpoints (Nemotron / Llama)
  if (getNvidiaApiKey()) {
    try {
      const responseText = await callNvidiaAI(prompt);
      const parsed = parseJSONFromText(responseText);
      if (parsed && typeof parsed.score === 'number') {
        return {
          score: Math.min(10, Math.max(0, Math.round(parsed.score))),
          clarity: Math.min(10, Math.max(0, Math.round(parsed.clarity || parsed.score))),
          relevance: Math.min(10, Math.max(0, Math.round(parsed.relevance || parsed.score))),
          technicalAccuracy: Math.min(10, Math.max(0, Math.round(parsed.technicalAccuracy || parsed.score))),
          feedback: Array.isArray(parsed.feedback) ? parsed.feedback.slice(0, 2) : ['Answer communicates main points well.'],
          keyTakeaway: parsed.keyTakeaway || 'Focus on concrete examples and outcomes.'
        };
      }
    } catch (err) {
      console.warn('[AI Service] NVIDIA Answer Evaluation failed:', err.message);
    }
  }

  // 2. Fallback Engine
  return fallbackEvaluateAnswer(question, answer, jobDescription);
}

module.exports = {
  analyzeResume,
  generateQuestions,
  evaluateAnswer
};
