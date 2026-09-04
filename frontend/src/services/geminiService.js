/**
 * Gemini AI Service for MPLAD 3D Animated Humanoid Robot Guide
 * Uses Google Gemini 3.6 Flash with the provided API key.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_ENDPOINT = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
  : null;

// Grounded pre-computed fallback explanations for instant zero-latency rendering
export const PAGE_GUIDE_KNOWLEDGE = {
  "/": {
    title: "Executive Overview Dashboard",
    badge: "Step 1 of Tour",
    focusElementLabel: "National Overview Metrics & Attention Queue",
    focusElementSelector: ".grid",
    summary: "Welcome! I am your MPLAD AI Humanoid Robot Guide. Here on the National Overview, we track ₹1,16,767 Cr across 774 MPs and 126,582 works with a national utilization rate of 33.9%.",
    officerFocus: "Notice the risk distribution: only 8 projects are in the Critical/High review queue, allowing human inspectors to focus where statistical deviations actually occur.",
    suggestedQuestions: [
      "What is the national utilization rate?",
      "How many total works are monitored?",
      "Why are only 8 projects high risk?"
    ]
  },
  "/high-risk": {
    title: "Priority Review Queue",
    badge: "Step 2 of Tour",
    focusElementLabel: "Top Flagged Works & Project #80673",
    focusElementSelector: "table, .overflow-x-auto",
    summary: "This is the Priority Review Queue. Our explainable risk engine has isolated the top 8 multi-dimensional outliers requiring field verification.",
    officerFocus: "Each project is scored 0–100 with full factor attribution. Look closely at Project #80673 at the top with a Critical 98/100 risk score.",
    suggestedQuestions: [
      "Why is Project #80673 ranked number 1?",
      "What causes a project to reach Critical risk?",
      "How does the Isolation Forest boost work?"
    ]
  },
  "/project/80673": {
    title: "Flagged Project Diagnostic (#80673)",
    badge: "Step 3 of Tour",
    focusElementLabel: "Cost Escalation & Explainable Factors",
    focusElementSelector: ".grid",
    summary: "Here is Project #80673 in Amritsar, Punjab: a Community Hall initially sanctioned for ₹5,00,000 where final certified expenditure escalated by +100.0% to ₹10,00,000.",
    officerFocus: "Review the explainable point breakdown: Cost deviation (+30 pts), Sector outlier (+10 pts), Completion verification (+18 pts), and ML anomaly confirmation (+8 pts).",
    suggestedQuestions: [
      "Why did the cost double to ₹10 Lakhs?",
      "What is the peer median for this sector?",
      "What should the district officer inspect?"
    ]
  },
  "/anomalies": {
    title: "Anomaly Intelligence Center",
    badge: "Step 4 of Tour",
    focusElementLabel: "Multi-Vector Anomaly Channels & Duplicate Signatures",
    focusElementSelector: "nav, .flex-wrap, table",
    summary: "In the Anomaly Center, you can analyze multi-vector anomalies: cost deviations (>25%), completion verification queues, sector outliers, and duplicate transactions.",
    officerFocus: "Inspect the Duplicate Transaction tab: our signature matching engine flagged 38,866 identical transactions and repeated vendor bursts for audit scrutiny.",
    suggestedQuestions: [
      "How are duplicate transactions detected?",
      "What defines a payment density burst?",
      "What are sector peer median benchmarks?"
    ]
  },
  "/mps": {
    title: "MP & Constituency Analytics",
    badge: "Step 5 of Tour",
    focusElementLabel: "MP Implementation Directory & Performance",
    focusElementSelector: "table, .grid",
    summary: "Here we examine implementation performance across all 774 Members of Parliament and 543+ constituencies across Lok Sabha and Rajya Sabha.",
    officerFocus: "Sort MPs by utilization percentage, completed works, or average risk score to identify implementation bottlenecks by parliamentary territory.",
    suggestedQuestions: [
      "Which MPs have highest expenditure?",
      "How are Rajya Sabha works tracked?",
      "Can I filter by specific constituency?"
    ]
  },
  "/states": {
    title: "State & Regional Matrix",
    badge: "Step 6 of Tour",
    focusElementLabel: "Interactive State Matrix & Geographic Allocation",
    focusElementSelector: "svg, table",
    summary: "The State Matrix aggregates MPLAD allocations, expenditure, completion rates, and high-risk clusters across all 36 States and Union Territories.",
    officerFocus: "Use the interactive map and regional table to contrast high-spending states with states having pending completion verification backlogs.",
    suggestedQuestions: [
      "Which state has the largest allocation?",
      "How does completion rate vary across states?",
      "Where are high-risk clusters concentrated?"
    ]
  },
  "/reports": {
    title: "Officer Inspection Reports",
    badge: "Step 7 of Tour",
    focusElementLabel: "Official Printable Dossiers & Audit Digests",
    focusElementSelector: ".grid",
    summary: "The Inspection Dossier engine generates comprehensive, audit-ready PDF dossiers complete with financial timelines, peer benchmarks, and advisory checklists.",
    officerFocus: "Inspectors can export Project #80673's complete audit dossier with one click for formal field verification under MoSPI guidelines.",
    suggestedQuestions: [
      "What is included in the inspection dossier?",
      "Can I download a print-ready PDF?",
      "What are statutory advisory action items?"
    ]
  },
  "/transparency": {
    title: "Data & Methodology Transparency",
    badge: "Step 8 of Tour",
    focusElementLabel: "Data Provenance & Mathematical Validation Report",
    focusElementSelector: ".grid",
    summary: "Transparency is our foundational pillar. This page displays the live transformation audit log and automated validation report matching official MoSPI numbers.",
    officerFocus: "Every metric is validated down to 0.00 rupee discrepancy against official baselines, adhering strictly to non-accusatory legal standards.",
    suggestedQuestions: [
      "How is data validation verified?",
      "What is the non-accusatory compliance standard?",
      "How does two-tier relational matching work?"
    ]
  }
};

/**
 * Call Gemini 3.6 Flash for dynamic page guidance
 */
export async function getGeminiPageGuide(pathname, pageData = {}) {
  // Normalize path
  let matchedKey = Object.keys(PAGE_GUIDE_KNOWLEDGE).find(k => 
    k === pathname || (k !== '/' && pathname.startsWith(k))
  ) || "/";

  const staticKnowledge = PAGE_GUIDE_KNOWLEDGE[matchedKey];

  try {
    const prompt = `
You are the official 3D Animated Humanoid Robot Guide for the Smart India Hackathon (SIH26102) MPLAD AI Risk & Anomaly Intelligence System for the Ministry of Statistics and Programme Implementation (MoSPI).
The user is currently viewing the page: "${staticKnowledge.title}" (URL path: ${pathname}).
Context information:
- Summary: ${staticKnowledge.summary}
- Officer Focus: ${staticKnowledge.officerFocus}

Provide an engaging, highly professional, 2-to-3 sentence spoken guide explanation from your perspective as the 3D Humanoid Robot. 
Rules:
1. Speak as a friendly, cutting-edge AI robot companion ("I have analyzed this section...", "Notice that...").
2. Highlight the most crucial anomaly or metric on this page for the inspecting officer.
3. Keep it under 65 words so it fits nicely in a speech bubble.
4. Strictly maintain MoSPI legal neutrality: never accuse anyone of fraud; refer to statistical anomalies and items requiring human verification.
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return {
          title: staticKnowledge.title,
          badge: staticKnowledge.badge,
          explanation: text.trim(),
          officerFocus: staticKnowledge.officerFocus,
          suggestedQuestions: staticKnowledge.suggestedQuestions,
          isAI: true
        };
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.warn("Gemini API call fallback:", err.message);
    }
  }

  // Graceful fallback to rich static knowledge
  return {
    title: staticKnowledge.title,
    badge: staticKnowledge.badge,
    explanation: `${staticKnowledge.summary} ${staticKnowledge.officerFocus}`,
    officerFocus: staticKnowledge.officerFocus,
    suggestedQuestions: staticKnowledge.suggestedQuestions,
    isAI: false
  };
}

/**
 * Ask the 3D Robot Guide any free-form question
 */
export async function askGeminiRobot(question, pathname) {
  let matchedKey = Object.keys(PAGE_GUIDE_KNOWLEDGE).find(k => 
    k === pathname || (k !== '/' && pathname.startsWith(k))
  ) || "/";

  const staticKnowledge = PAGE_GUIDE_KNOWLEDGE[matchedKey];

  try {
    const prompt = `
You are the 3D Animated Humanoid Robot Guide for the MPLAD AI Intelligence System (MoSPI / SIH26102).
The user is viewing: "${staticKnowledge.title}".
User question: "${question}"

Answer the officer's question concisely in 2 to 3 sentences (under 60 words). Be helpful, cite real MPLAD system logic (explainable risk score 0-100, peer benchmarks, Isolation Forest, duplicate transaction signatures), and maintain ethical compliance.
`;

    if (GEMINI_ENDPOINT) {
      const response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      }
    }
  } catch (err) {
    console.error("Gemini robot query error:", err);
  }

  return `Based on our system data for ${staticKnowledge.title}, all indicators reflect explainable multi-vector deviation metrics designed to prioritize human review under official MoSPI guidelines.`;
}
