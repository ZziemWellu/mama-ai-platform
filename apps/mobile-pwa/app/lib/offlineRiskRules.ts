// A direct port of check_hard_rules() from services/api-gateway/app/api/assessments.py — the source
// of truth for these thresholds. If either one changes, ../../../shared/clinical-rules-fixtures.json
// and the other implementation must change with it; scripts/verify-offline-rules.mjs checks the two
// stay identical.
//
// This exists so a CHW with no signal still gets an immediate risk read instead of nothing — see
// app/assessment/page.tsx. It is explicitly never presented as equivalent to a real server-verified
// result; the real submission is queued (app/lib/offlineQueue.ts) and re-checked for real the moment
// connectivity returns.

export interface Symptoms {
  bleeding_volume?: number | null;
  headache_severity?: number | null;
  visual_changes?: boolean;
  abdominal_pain_severity?: number | null;
  foul_discharge?: boolean;
  fever?: boolean;
}
export interface Vitals {
  systolic_bp?: number | null;
  diastolic_bp?: number | null;
  temperature?: number | null;
}
export interface ObstetricHistory {
  gestation_weeks: number;
  labour_hours?: number | null;
  previous_csection?: boolean;
  multiple_pregnancy?: boolean;
}
export interface AssessmentInput {
  symptoms: Symptoms;
  vitals: Vitals;
  obstetric_history: ObstetricHistory;
}

export interface HardRuleResult {
  condition: "PPH" | "PRE_ECLAMPSIA" | "OBSTRUCTED_LABOUR" | "SEPSIS";
  confidence_score: number;
  explanation: string;
  actions: string[];
}

const ACTIONS = {
  PPH: ["Uterine massage", "Oxytocin 10IU IM", "Prepare blood transfusion", "Prepare urgent referral"],
  PRE_ECLAMPSIA: ["Administer magnesium sulfate", "Prepare urgent referral", "Monitor BP every 15 minutes"],
  OBSTRUCTED_LABOUR: [
    "Do NOT augment labour with oxytocin", "Keep patient nil by mouth", "Position in left lateral position",
    "Monitor fetal heart rate continuously", "Prepare urgent referral for possible caesarean section",
  ],
  SEPSIS: [
    "Start IV fluids", "Give broad-spectrum IV antibiotics if available", "Reduce fever (tepid sponging / antipyretic)",
    "Monitor temperature and pulse every 30 minutes", "Prepare urgent referral",
  ],
};

export function checkHardRules(request: AssessmentInput): HardRuleResult | null {
  const { symptoms, vitals, obstetric_history } = request;

  if (symptoms.bleeding_volume && symptoms.bleeding_volume > 500) {
    return {
      condition: "PPH",
      confidence_score: 0.98,
      explanation: `Bleeding >500mL (${symptoms.bleeding_volume}mL) requires immediate intervention`,
      actions: ACTIONS.PPH,
    };
  }

  if (vitals.systolic_bp && vitals.systolic_bp >= 160 && symptoms.headache_severity && symptoms.headache_severity >= 7) {
    return {
      condition: "PRE_ECLAMPSIA",
      confidence_score: 0.95,
      explanation: `BP ${vitals.systolic_bp} with severe headache indicates pre-eclampsia`,
      actions: ACTIONS.PRE_ECLAMPSIA,
    };
  }

  if (obstetric_history.labour_hours && obstetric_history.labour_hours >= 12 && symptoms.abdominal_pain_severity && symptoms.abdominal_pain_severity >= 8) {
    return {
      condition: "OBSTRUCTED_LABOUR",
      confidence_score: 0.85,
      explanation: `Labour lasting ${obstetric_history.labour_hours}h with severe abdominal pain (severity ${symptoms.abdominal_pain_severity}/10) suggests obstructed labour`,
      actions: ACTIONS.OBSTRUCTED_LABOUR,
    };
  }

  if ((symptoms.fever || (vitals.temperature != null && vitals.temperature >= 38.0)) && symptoms.foul_discharge) {
    return {
      condition: "SEPSIS",
      confidence_score: 0.85,
      explanation: "Fever with foul-smelling discharge suggests maternal sepsis",
      actions: ACTIONS.SEPSIS,
    };
  }

  return null;
}

export interface OfflineAssessmentResult {
  risk_level: "LOW" | "CRITICAL";
  primary_condition: string;
  confidence_score: number;
  explanation: string;
  recommended_actions: string[];
  offline: true;
}

export function assessOffline(request: AssessmentInput): OfflineAssessmentResult {
  const hardRisk = checkHardRules(request);
  if (hardRisk) {
    return {
      risk_level: "CRITICAL",
      primary_condition: hardRisk.condition,
      confidence_score: hardRisk.confidence_score,
      explanation: hardRisk.explanation,
      recommended_actions: hardRisk.actions,
      offline: true,
    };
  }
  return {
    risk_level: "LOW",
    primary_condition: "NORMAL",
    confidence_score: 0.90,
    explanation: "No significant danger signs detected",
    recommended_actions: ["Routine monitoring", "Document findings"],
    offline: true,
  };
}
