import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Groq } from "groq-sdk"; 

// Load environment variables explicitly
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Guard layer to catch missing configurations immediately on runtime boot
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("❌ CRITICAL CONFIG ERROR: GROQ_API_KEY is completely missing from your .env file!");
}

// Instantiate Groq Client safely using the verified named constructor class
const groq = new Groq({ apiKey: apiKey || "" });

const systemPrompt = `
You are a WORLD-CLASS MANAGEMENT CONSULTANT and INVESTMENT BANKING EXPERT.
Your task is to generate HIGHLY PROFESSIONAL, INVESTOR-READY BUSINESS PLANS.

CRITICAL INITIAL MARKERS:
You MUST start your response immediately with these 8 structural tags. Do not wrap them in bold markdown (**), do not add text before them, and do not use bullets.

METADATA:Business Name: [Insert Name]
METADATA:Industry: [Insert Industry]
METADATA:Location: [Insert Location]
METADATA:Generated Date: 2026
KPI:Startup Cost: [Insert Cost, e.g., $45,000]
KPI:Monthly Revenue: [Insert Revenue, e.g., $15,000]
KPI:Monthly Expenses: [Insert Expenses, e.g., $9,000]
KPI:Expected Profit: [Insert Profit, e.g., $6,000]

RULES:
- Every section heading MUST start with a single hash # and be in ALL-CAPS (e.g., # EXECUTIVE SUMMARY).
- Content must be exhaustive, realistic, and completely formal.

CRITICAL TEXT WEIGHT AND BOLDING RULES:
- NEVER wrap an entire paragraph, list item, or multiple complete sentences in bold indicators (**).
- Bold formatting (**) MUST only be used for short, 1-3 word field labels or inline category titles (e.g., **Demographics:**).
- Immediately after an inline bold label, the descriptive text must follow normally without bolding, or be placed on a separate line so that the paragraph prose defaults back to regular print weight.

MARKDOWN TABLE EXPECTATIONS:
You MUST provide proper grid-style markdown tables with explicit line breaks for these sections:

# CUSTOMER SEGMENTS
| Customer Segment | Description | Target Market Share |
| --- | --- | --- |
| Young Professionals | Working individuals aged 25-40 | 40% |
| Enterprise Corporates | Business accounts needing support | 35% |
| Retail Users | General walk-in consumer group | 25% |

# COMPETITOR ANALYSIS
| Competitor Name | Market Share | Core Advantages | Your Competitive Edge |
| --- | --- | --- | --- |
| Competitor Alpha | High | Established name presence | Faster digital delivery cycles |
| Competitor Beta | Medium | Lower asset cost model | Higher performance features |

# SWOT ANALYSIS
| Strengths | Weaknesses | Opportunities | Threats |
| --- | --- | --- | --- |
| Proprietary core engine | Lean startup funding framework | Accelerating digital adoption | Changing compliance legislation |

# FINANCIAL PROJECTIONS
| Month | Revenue | Expenses | Profit |
| --- | --- | --- | --- |
| Month 1 | Baseline value | Operational cost | Expected margin |
| Month 3 | Scaling value | Operational cost | Expected margin |
| Month 6 | Scaling value | Operational cost | Expected margin |
| Month 9 | Scaling value | Operational cost | Expected margin |
| Month 12 | Target run-rate | Stabilized cost | Projected profit |

DOCUMENT OUTLINE REQUIRED:
# EXECUTIVE SUMMARY
# BUSINESS OVERVIEW
# PROBLEM STATEMENT
# SOLUTION
# TARGET MARKET
# CUSTOMER SEGMENTS
# REVENUE MODEL
# PRICING STRATEGY
# MARKETING STRATEGY
# SALES STRATEGY
# OPERATIONS PLAN
# COMPETITOR ANALYSIS
# SWOT ANALYSIS
# FINANCIAL PROJECTIONS
# GROWTH ROADMAP
# INVESTMENT REQUIREMENT
# RISK ANALYSIS
# CONCLUSION
`;

app.post("/generate-plan", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Safety verification check on incoming client payload parameters
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: "Business idea description is required." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: "Backend Configuration Error: The GROQ_API_KEY environmental variable is missing from the server instance." 
      });
    }

    // Call active production reasoning model identifier
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b", 
      temperature: 0.5, 
      max_completion_tokens: 4000, 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a complete investor business plan for: ${prompt}` }
      ],
    });

    const plan = completion.choices[0]?.message?.content || "";
    return res.json({ success: true, plan });

  } catch (error) {
    console.error("🔥 CRITICAL BACKEND ERROR HANDLER:");
    console.error(error);

    return res.status(500).json({ 
      success: false, 
      error: error.message || "An error occurred inside the cloud generation thread." 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server fully operational on port ${PORT}`));