// Safely retrieve API Keys from process.env
const getNvidiaApiKey = () => process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEY;

const parseJSONFromText = (text) => {
  if (!text) return null;
  
  let cleanText = text.trim();
  
  // Extract markdown json block if present
  const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    cleanText = jsonMatch[1].trim();
  } else {
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    return JSON.parse(cleanText);
  } catch (e1) {
    try {
      // Fix common LLM JSON syntax anomalies (trailing commas, raw control chars, unescaped linebreaks)
      const sanitized = cleanText
        .replace(/,\s*([\}\]])/g, '$1')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => c === '\n' || c === '\r' || c === '\t' ? c : '');
      return JSON.parse(sanitized);
    } catch (e2) {
      console.warn('[parseJSONFromText] Failed to parse JSON:', e2.message);
      return null;
    }
  }
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
    }),
    signal: AbortSignal.timeout(6000)
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
const fallbackGenerateQuestions = (jobDescription, level = 'mid', roleTitle = 'Software Engineer') => {
  const cleanJD = (jobDescription || '').toLowerCase();
  const cleanRole = (roleTitle || '').toLowerCase();
  const combined = `${cleanRole} ${cleanJD}`;

  // Domain flags
  const isDataScience = combined.includes('data sci') || combined.includes('machine learning') || combined.includes('ai ') || combined.includes('pytorch') || combined.includes('tensorflow') || (combined.includes('python') && combined.includes('model'));
  const isDevOps = combined.includes('devops') || combined.includes('cloud') || combined.includes('aws') || combined.includes('kubernetes') || combined.includes('docker') || combined.includes('ci/cd') || combined.includes('terraform') || combined.includes('sre');
  const isDataEng = combined.includes('data eng') || combined.includes('etl') || combined.includes('snowflake') || combined.includes('spark') || combined.includes('sql') || combined.includes('big data');
  const isFrontend = combined.includes('frontend') || combined.includes('react') || combined.includes('vue') || combined.includes('angular') || combined.includes('css') || combined.includes('ui/ux') || combined.includes('web developer');
  const isMobile = combined.includes('mobile') || combined.includes('flutter') || combined.includes('react native') || combined.includes('android') || combined.includes('ios') || combined.includes('swift');
  const isSecurity = combined.includes('security') || combined.includes('cyber') || combined.includes('soc') || combined.includes('threat') || combined.includes('penetration');

  const displayRole = roleTitle && roleTitle !== 'Target Role' ? roleTitle : 'Software Engineer';

  if (isDataScience) {
    return [
      {
        id: 'q1',
        type: 'technical',
        question: `For a ${level}-level ${displayRole} role, how do you handle feature engineering, missing data imputation, and class imbalance in machine learning models?`,
        context: `Evaluates feature selection, data quality pipelines, and baseline model design.`,
        sampleAnswer: `I perform exploratory data analysis, apply domain-specific imputation for missing values, and use SMOTE or class-weight rebalancing to handle imbalance.`
      },
      {
        id: 'q2',
        type: 'technical',
        question: `Describe how you evaluate model performance beyond simple accuracy, and how you prevent data leakage during cross-validation.`,
        context: `Assesses cross-validation rigor, ROC-AUC/F1 metrics, and generalization confidence.`,
        sampleAnswer: `I use stratified k-fold cross-validation, evaluate precision-recall AUC metrics, and isolate feature transformations strictly within training folds.`
      },
      {
        id: 'q3',
        type: 'behavioral',
        question: `Tell me about a project where your statistical modeling or predictive analysis directly drove a key business decision.`,
        context: `Tests business impact, data advocacy, and translating quantitative metrics into organizational value.`,
        sampleAnswer: `I built a churn prediction model that identified high-risk accounts 30 days prior, allowing customer success to retain significant revenue.`
      },
      {
        id: 'q4',
        type: 'technical',
        question: `What tools and frameworks (e.g. PyTorch, TensorFlow, MLflow, Docker) do you use to deploy and monitor ML models in production?`,
        context: `Evaluates MLOps maturity, model serving latency, and drift detection.`,
        sampleAnswer: `I package models into containerized REST microservices using FastAPI/Docker, track experiments in MLflow, and monitor data drift.`
      },
      {
        id: 'q5',
        type: 'behavioral',
        question: `Give an example of how you communicated complex model trade-offs or technical limitations to non-technical stakeholders.`,
        context: `Assesses executive communication, clarity, and managing expectations around model accuracy limits.`,
        sampleAnswer: `I created visual confusion matrix charts to demonstrate false positive trade-offs, guiding leadership to choose an optimal decision threshold.`
      }
    ];
  }

  if (isDevOps) {
    return [
      {
        id: 'q1',
        type: 'technical',
        question: `For a ${level}-level ${displayRole} role, how do you design zero-downtime deployment pipelines using Infrastructure as Code (Terraform/CloudFormation)?`,
        context: `Evaluates cloud automation, immutable infrastructure, and deployment pipeline confidence.`,
        sampleAnswer: `I use modular Terraform scripts versioned in Git, paired with automated blue/green or canary deployment strategies.`
      },
      {
        id: 'q2',
        type: 'technical',
        question: `Describe your approach to container orchestration, service discovery, and secret management in Kubernetes/Docker environments.`,
        context: `Assesses container security, ingress routing, and config management.`,
        sampleAnswer: `I enforce Helm charts for release deployment, manage secrets via HashiCorp Vault, and configure strict NetworkPolicies.`
      },
      {
        id: 'q3',
        type: 'behavioral',
        question: `Tell me about a major production outage or high-severity incident you responded to under operational pressure.`,
        context: `Tests incident management, root-cause postmortems, and triage under pressure.`,
        sampleAnswer: `I analyzed log aggregators to isolate a cascading connection pool exhaustion, rolled back the release, and authored a blameless postmortem.`
      },
      {
        id: 'q4',
        type: 'technical',
        question: `What telemetry, logging, and alerting stack (e.g., Prometheus, Grafana, ELK) do you mandate for high-availability systems?`,
        context: `Evaluates system observability, distributed tracing, and SLA/SLO monitoring.`,
        sampleAnswer: `I configure Prometheus metrics scrapers, Grafana dashboards for latency SLIs, and PagerDuty alerts for actionable error rate spikes.`
      },
      {
        id: 'q5',
        type: 'behavioral',
        question: `Give an example of how you balanced developer feature velocity with strict security compliance and cloud cost optimization.`,
        context: `Assesses DevSecOps advocacy, FinOps awareness, and cross-functional alignment.`,
        sampleAnswer: `I automated security scanning in CI to catch vulnerabilities early, while implementing cloud auto-scaling policies that cut compute spend.`
      }
    ];
  }

  if (isDataEng) {
    return [
      {
        id: 'q1',
        type: 'technical',
        question: `As a ${level}-level ${displayRole}, how do you design scalable ETL/ELT pipelines and handle schema evolution in data warehouses (Snowflake/BigQuery)?`,
        context: `Assesses data pipeline architecture, schema design, and data warehouse partitioning.`,
        sampleAnswer: `I build modular dbt/Airflow pipelines utilizing incremental models and partition key optimizations to handle changing schemas.`
      },
      {
        id: 'q2',
        type: 'technical',
        question: `Describe a production database query performance bottleneck you diagnosed, and the exact indexing/partitioning steps you used to resolve it.`,
        context: `Evaluates query optimization, window functions, and distributed engine execution plans.`,
        sampleAnswer: `I inspected query execution plans, refactored heavy join operations, applied clustering keys, and reduced pipeline runtime.`
      },
      {
        id: 'q3',
        type: 'behavioral',
        question: `Tell me about a time when corrupted or delayed data in your pipeline impacted downstream business dashboards. How did you handle it?`,
        context: `Tests data quality monitoring, stakeholder communication, and incident remediation.`,
        sampleAnswer: `I notified key data consumers immediately, implemented circuit-breaker data quality assertions using Great Expectations, and backfilled missing records.`
      },
      {
        id: 'q4',
        type: 'technical',
        question: `How do you structure event-driven data streaming (e.g., Kafka, Spark Streaming) vs batch processing for near real-time analytics?`,
        context: `Evaluates streaming architectures, exactly-once processing semantics, and queue management.`,
        sampleAnswer: `I use Apache Kafka for decoupled event ingestion with Spark Streaming for windowed aggregations, using dead-letter queues for malformed payloads.`
      },
      {
        id: 'q5',
        type: 'behavioral',
        question: `How do you collaborate with data science and software engineering teams to define clear data contracts and SLAs?`,
        context: `Assesses cross-functional collaboration, documentation, and data governance.`,
        sampleAnswer: `I established JSON Schema data contracts at API boundaries and documented data lineage diagrams so upstream changes didn't break downstream pipelines.`
      }
    ];
  }

  if (isFrontend || isMobile) {
    return [
      {
        id: 'q1',
        type: 'technical',
        question: `As a ${level}-level ${displayRole}, how do you optimize initial bundle size, render performance, and state management in modern Web/Mobile applications?`,
        context: `Assesses frontend architecture, code splitting, memoization, and state normalization.`,
        sampleAnswer: `I implement lazy loading with route-based code splitting, optimize dynamic component re-renders using React.memo/useCallback, and keep global state minimal.`
      },
      {
        id: 'q2',
        type: 'technical',
        question: `Describe how you ensure responsive layout design, web accessibility (a11y), and consistent cross-browser UI component rendering.`,
        context: `Evaluates CSS layout mastery, semantic HTML, ARIA standards, and component reusability.`,
        sampleAnswer: `I construct design system tokens using CSS variables, enforce semantic HTML tags with proper ARIA attributes, and test across device viewports.`
      },
      {
        id: 'q3',
        type: 'behavioral',
        question: `Tell me about a time when UI/UX requirements changed late in a development sprint. How did you adapt without compromising code quality?`,
        context: `Tests adaptability, component modularity, and managing deadline pressure.`,
        sampleAnswer: `Because my UI components were atomic and decoupled from business logic, I updated the presentation layer quickly while keeping integration tests passing.`
      },
      {
        id: 'q4',
        type: 'technical',
        question: `What automated testing strategy (Unit, Integration, E2E via Cypress/Playwright) do you set up for user interface reliability?`,
        context: `Evaluates testing discipline, mock data strategies, and visual regression confidence.`,
        sampleAnswer: `I write unit tests for custom hooks using React Testing Library and run headless Playwright end-to-end user journey tests in CI.`
      },
      {
        id: 'q5',
        type: 'behavioral',
        question: `Give an example of a technical collaboration with product managers or backend engineers to define API response structures for optimal client performance.`,
        context: `Assesses API contract design, client-side caching, and UX alignment.`,
        sampleAnswer: `I proposed a paginated GraphQL payload schema that reduced payload size by 70%, preventing mobile UI freeze on slow networks.`
      }
    ];
  }

  if (isSecurity) {
    return [
      {
        id: 'q1',
        type: 'technical',
        question: `As a ${level}-level ${displayRole}, how do you perform threat modeling, vulnerability assessments, and OWASP Top 10 mitigation?`,
        context: `Assesses security posture, penetration testing methodologies, and secure coding standards.`,
        sampleAnswer: `I execute threat modeling during design, enforce static code analysis (SAST) in CI pipelines, and audit authentication/authorization bounds.`
      },
      {
        id: 'q2',
        type: 'technical',
        question: `Describe your incident response workflow when suspicious activity or a credential leak is detected in production.`,
        context: `Evaluates containment strategy, forensic logging, and post-breach remediation.`,
        sampleAnswer: `I isolate compromised endpoints, revoke leaked keys immediately, examine SIEM logs for lateral movement, and conduct a full root-cause audit.`
      },
      {
        id: 'q3',
        type: 'behavioral',
        question: `Tell me about a time you had to convince engineering teams to prioritize security patches over deadline-driven feature requests.`,
        context: `Tests security advocacy, risk quantification, and executive communication.`,
        sampleAnswer: `I quantified the business financial and compliance risk of the vulnerability, presenting a clear remediation roadmap that minimized feature delay.`
      },
      {
        id: 'q4',
        type: 'technical',
        question: `What identity management (IAM), encryption standards (AES-256, TLS 1.3), and zero-trust policies do you enforce?`,
        context: `Assesses cryptography, zero-trust network policy, and access control models.`,
        sampleAnswer: `I enforce least-privilege RBAC, mandate mTLS for internal service communication, and ensure data is encrypted at rest with managed KMS keys.`
      },
      {
        id: 'q5',
        type: 'behavioral',
        question: `How do you stay updated with emerging security threats and foster a security-first culture across software teams?`,
        context: `Assesses continuous learning, team security awareness, and developer enablement.`,
        sampleAnswer: `I track CVE disclosures, conduct hands-on security workshops for developers, and integrate automated security feedback into their daily workflow.`
      }
    ];
  }

  // Default Software / Full-Stack / Backend Engineer Questions
  return [
    {
      id: 'q1',
      type: 'technical',
      question: `For a ${level}-level ${displayRole} role, how do you design secure, scalable REST/GraphQL APIs and manage distributed state effectively?`,
      context: `Assesses core architecture, stateless authentication (JWT/OAuth2), and API design principles.`,
      sampleAnswer: `I build stateless REST endpoints secured with JWT tokens, enforce rate-limiting middleware, and use structured DTOs for payload validation.`
    },
    {
      id: 'q2',
      type: 'technical',
      question: `Describe a production performance bottleneck or database latency issue you diagnosed and the exact steps you took to resolve it.`,
      context: `Evaluates performance tuning, indexing, and query/caching optimization.`,
      sampleAnswer: `I analyzed APM tracing logs, added composite database indexes, and implemented Redis caching for high-frequency read operations.`
    },
    {
      id: 'q3',
      type: 'behavioral',
      question: `Tell me about a time when a critical bug occurred right before a major launch deadline. How did you prioritize and communicate under pressure?`,
      context: `Tests crisis management, communication, and pragmatic engineering trade-offs.`,
      sampleAnswer: `I isolated the root cause, communicated clear risk options to stakeholders, and delivered a targeted hotfix with added monitoring telemetry.`
    },
    {
      id: 'q4',
      type: 'technical',
      question: `How do you approach writing testable, modular code, and what CI/CD automation checks do you mandate before merging to main?`,
      context: `Evaluates code quality standards, unit/integration testing, and deployment pipeline confidence.`,
      sampleAnswer: `I structure code into decoupled functional modules, maintain comprehensive unit test coverage, and enforce linter and build checks in CI.`
    },
    {
      id: 'q5',
      type: 'behavioral',
      question: `Give an example of a technical disagreement you had with a team member or architect regarding implementation strategy. How did you resolve it?`,
      context: `Assesses collaboration, evidence-based advocacy, and team alignment.`,
      sampleAnswer: `I created a lightweight benchmark prototype, presented empirical latency metrics, and agreed on a hybrid approach that satisfied both goals.`
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
async function generateQuestions(jobDescription, level = 'mid', roleTitle = 'Software Engineer') {
  const prompt = `
You are an expert technical interviewer. Generate exactly 5 realistic, targeted interview questions tailored specifically for a candidate applying for the role of "${roleTitle}" (${level} level).
Ensure all 5 questions directly relate to the target role and key technical requirements specified in the Job Description.

TARGET ROLE: ${roleTitle}
SENIORITY LEVEL: ${level}

JOB DESCRIPTION:
"""
${(jobDescription || '').slice(0, 3000)}
"""

Respond STRICTLY in valid JSON format matching this schema:
{
  "questions": [
    {
      "id": "q1",
      "type": "technical",
      "question": "Full technical question text tailored to ${roleTitle}",
      "context": "Short statement of what this evaluates",
      "sampleAnswer": "Ideal answer key highlights"
    },
    {
      "id": "q2",
      "type": "technical",
      "question": "Full technical question text tailored to ${roleTitle}",
      "context": "Short statement of what this evaluates",
      "sampleAnswer": "Ideal answer key highlights"
    },
    {
      "id": "q3",
      "type": "behavioral",
      "question": "Behavioral question relevant to ${roleTitle}",
      "context": "Short statement of what this evaluates",
      "sampleAnswer": "Ideal answer key highlights"
    },
    {
      "id": "q4",
      "type": "technical",
      "question": "Technical question on testing or optimization tailored to ${roleTitle}",
      "context": "Short statement of what this evaluates",
      "sampleAnswer": "Ideal answer key highlights"
    },
    {
      "id": "q5",
      "type": "behavioral",
      "question": "Behavioral question on resolving technical trade-offs in ${roleTitle}",
      "context": "Short statement of what this evaluates",
      "sampleAnswer": "Ideal answer key highlights"
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
          context: q.context || `Evaluates key requirements for ${roleTitle}.`,
          sampleAnswer: q.sampleAnswer || ''
        }));
      }
    } catch (err) {
      console.warn('[AI Service] NVIDIA Question Gen failed:', err.message);
    }
  }

  // 2. Fallback Engine (Role-Aware)
  return fallbackGenerateQuestions(jobDescription, level, roleTitle);
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
