"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Metric explainers for learners */
export const METRIC_TIPS: Record<string, string> = {
  "Accuracy": "How often the model is correct overall. 80% = correct 80 out of 100 times.",
  "Precision": "Of all patients predicted to have dry eye, how many actually do. High precision = fewer false alarms.",
  "Recall": "Of all actual dry eye patients, how many did the model catch. High recall = fewer missed cases.",
  "F1 Score": "The balance between Precision and Recall. Best single metric to compare models.",
  "AUC-ROC": "How well the model separates dry eye from non-dry eye. 50% = random guess, 100% = perfect.",
  "CV Acc": "Cross-validation accuracy — tested on 5 different data splits to check consistency.",
  "CV Std": "Standard deviation of CV scores. Lower = more consistent model performance.",
};

export const TAB_TIPS: Record<string, string> = {
  comparison: "📖 Each group of bars represents one metric. Taller bars = better. Look for the model with consistently tall bars across all metrics.",
  roc: "📖 The ROC curve shows how well a model separates classes. Curves closer to the top-left corner are better. The dashed diagonal = random guessing.",
  radar: "📖 Each axis is a different metric. A larger, rounder shape means the model performs well across all metrics — not just one.",
  confusion: "📖 The confusion matrix shows exactly where the model gets things right and wrong. TP (True Positive) and TN (True Negative) are correct predictions. FP and FN are errors.",
  features: "📖 Shows which patient features (e.g., screen time, stress) the model relies on most for its predictions. Longer bars = more influential features.",
};

export const CM_LABELS: Record<string, string> = {
  TN: "True Neg — Correctly predicted NO dry eye",
  FP: "False Pos — Wrongly predicted dry eye",
  FN: "False Neg — Missed actual dry eye case",
  TP: "True Pos — Correctly predicted dry eye",
};

export function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block ml-1 align-middle">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[9px] font-bold hover:bg-blue-200 transition-colors cursor-help"
        aria-label="Learn more"
      >
        ?
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-lg bg-slate-800 text-white text-[11px] leading-relaxed shadow-xl pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

export function LearnHint({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 bg-blue-50/60 border border-blue-100/60 rounded-lg px-3 py-2.5 mb-4"
    >
      <span className="text-sm shrink-0 mt-0.5">💡</span>
      <p className="text-[11px] text-blue-700/70 leading-relaxed">{text}</p>
    </motion.div>
  );
}
