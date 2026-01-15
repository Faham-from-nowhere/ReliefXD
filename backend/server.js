// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const { analyzeRequest } = require("./services/ai");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // 🔹 Single API endpoint (correct design)
// app.post("/api/analyze", async (req, res) => {
//   try {
//     const { description } = req.body;

//     if (!description || description.trim() === "") {
//       return res.status(400).json({ error: "Description required" });
//     }

//     const aiResult = await analyzeRequest(description);
//     res.json(aiResult);

//   } catch (err) {
//     console.error("Backend Error:", err);
//     res.status(500).json({
//       urgency: "Medium",
//       category: "Other",
//       summary: "Service unavailable",
//       resources: []
//     });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Backend running on port ${PORT}`);
// });



const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { analyzeRequest } = require("./services/ai");

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Helper: Severity Normalization ----------
function normalizeSeverity(aiResult) {
  const normalized = { ...aiResult };

  // Food/Water cannot be Critical
  if (
    normalized.category === "Food/Water" &&
    normalized.urgency === "Critical"
  ) {
    normalized.urgency = "High";
  }

  // Infrastructure issues max Medium
  if (
    normalized.category === "Infrastructure" &&
    ["Critical", "High"].includes(normalized.urgency)
  ) {
    normalized.urgency = "Medium";
  }

  // Rescue / Medical / Fire should be at least High
  if (
    ["Rescue", "Medical", "Fire"].includes(normalized.category) &&
    normalized.urgency === "Medium"
  ) {
    normalized.urgency = "High";
  }

  return normalized;
}

// ---------- Helper: Confidence Score ----------
function calculateConfidence(aiResult) {
  let confidence = 0.6;

  if (aiResult.urgency === "Critical") confidence += 0.15;
  if (aiResult.category !== "Other") confidence += 0.1;
  if (aiResult.resources && aiResult.resources.length > 0) confidence += 0.1;
  if (aiResult.summary && aiResult.summary.split(" ").length <= 5) confidence += 0.05;

  if (aiResult.category === "Other") confidence -= 0.2;
  if (!aiResult.resources || aiResult.resources.length === 0) confidence -= 0.1;

  return Math.max(0, Math.min(confidence, 1));
}

// ---------- API Endpoint ----------
app.post("/api/analyze", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length < 5) {
      return res.status(400).json({ error: "Invalid description" });
    }

    // Step 1: AI analysis
    let aiResult = await analyzeRequest(description);

    // Step 2: Normalize severity
    aiResult = normalizeSeverity(aiResult);

    // Step 3: Add confidence score
    const confidence = calculateConfidence(aiResult);

    res.json({
      ...aiResult,
      confidence
    });

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({
      urgency: "Medium",
      category: "Other",
      summary: "Service unavailable",
      resources: [],
      confidence: 0.4
    });
  }
});

// ---------- Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
