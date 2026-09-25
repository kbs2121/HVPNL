/**
 * HVPNL statutory & operational compliance framework for 220kV/400kV assets.
 * Reference: HERC/CERC transmission license conditions, CEA regulations, HVPNL O&M SOPs.
 */

export type PmFrequency = "daily_weekly" | "monthly_quarterly" | "annual_biennial";
export type ComplianceDomain = "saf" | "testing" | "safety" | "pm";

export const SAF_NORMATIVE_TARGET = 98; // HERC SAF normative for 220/400 kV (%)
export const SAF_INCENTIVE_TARGET = 99.2; // Bonus eligibility threshold (%)

export interface SafConsequence {
  id: string;
  title: string;
  impact: string;
  severity: "critical" | "high" | "medium";
}

export interface ProtocolItem {
  id: string;
  frequency: PmFrequency | "continuous";
  category: string;
  task: string;
  voltages: ("220kV" | "400kV")[];
  standard?: string;
}

export interface SafetyRequirement {
  id: string;
  area: string;
  requirement: string;
  consequence: string;
}

export interface PmChecklistTask {
  id: string;
  frequency: PmFrequency;
  category: string;
  tasks: string[];
  voltages: ("220kV" | "400kV")[];
}

export const SAF_CONSEQUENCES: SafConsequence[] = [
  {
    id: "arr-cut",
    title: "ARR / AFC under-recovery",
    impact:
      "Below 98% SAF — HVPNL cannot recover full Annual Fixed Cost from discoms (DHBVN/UHBVN); revenue shortfall absorbed by utility.",
    severity: "critical",
  },
  {
    id: "incentive-loss",
    title: "Loss of HERC incentive",
    impact:
      "Missing 99.2%+ availability forfeits operational efficiency bonus added directly to transmission revenue.",
    severity: "high",
  },
  {
    id: "grid-outage",
    title: "Grid cascading & outages",
    impact:
      "Neglected O&M → prolonged 220/400 kV trips → district-wide blackouts and further SAF degradation.",
    severity: "critical",
  },
  {
    id: "mod-penalty",
    title: "Merit-order despatch (MOD) cost",
    impact:
      "Major substation trip forces expensive power procurement when cheap generation cannot reach load centres.",
    severity: "high",
  },
  {
    id: "audit-disallow",
    title: "True-up disallowances",
    impact:
      "Emergency breakdown costs routinely slashed by HERC/CAG when PM logs are missing or incomplete.",
    severity: "medium",
  },
  {
    id: "capex-loss",
    title: "Asset capital destruction",
    impact:
      "Skipped DGA/diagnostics → undetected transformer fault → ₹15–25+ Cr replacement; insurance rejected without PM records.",
    severity: "critical",
  },
];

export const TESTING_PROTOCOLS: ProtocolItem[] = [
  {
    id: "sf6-daily",
    frequency: "daily_weekly",
    category: "GIS / SF6",
    task: "Log SF6 gas pressure on all density monitors; catch micro-leaks early",
    voltages: ["220kV", "400kV"],
  },
  {
    id: "dc-daily",
    frequency: "daily_weekly",
    category: "DC System",
    task: "Battery bank voltage, cell specific gravity, charger fault status, ventilation",
    voltages: ["220kV", "400kV"],
  },
  {
    id: "oti-wti",
    frequency: "daily_weekly",
    category: "Transformers",
    task: "OTI/WTI peaks, oil levels (main + OLTC conservator), silica gel breather colour",
    voltages: ["220kV", "400kV"],
  },
  {
    id: "thermo",
    frequency: "monthly_quarterly",
    category: "Thermal",
    task: "Thermo-vision (IR) scan of clamps, bushings, isolator contacts for hot spots",
    voltages: ["220kV", "400kV"],
  },
  {
    id: "earth",
    frequency: "monthly_quarterly",
    category: "Earthing",
    task: "Earth pit resistance test (< 0.5 Ω); inspect earth riser integrity",
    voltages: ["220kV", "400kV"],
    standard: "< 0.5 Ω",
  },
  {
    id: "insulator",
    frequency: "monthly_quarterly",
    category: "Insulators",
    task: "Clean/wash polluted strings; pre-fog season wash in Haryana winters",
    voltages: ["220kV", "400kV"],
  },
  {
    id: "la",
    frequency: "monthly_quarterly",
    category: "Surge Arresters",
    task: "Log LA leakage current and surge counter readings",
    voltages: ["220kV", "400kV"],
  },
  {
    id: "dga",
    frequency: "annual_biennial",
    category: "Transformers",
    task: "DGA, BDV, moisture content; IR/PI Megger; Tan-Delta on bushings",
    voltages: ["220kV", "400kV"],
  },
  {
    id: "breaker",
    frequency: "annual_biennial",
    category: "Circuit Breakers",
    task: "Operation time, phase synchronism, static/dynamic CRM, drive mechanism health",
    voltages: ["220kV", "400kV"],
  },
  {
    id: "relay",
    frequency: "annual_biennial",
    category: "Protection",
    task: "Relay calibration, secondary injection, 86 master trip test, CT/PT ratio & insulation",
    voltages: ["220kV", "400kV"],
  },
  {
    id: "isolator",
    frequency: "annual_biennial",
    category: "Isolators",
    task: "Clean/grease contacts; verify electrical & mechanical interlocks under load",
    voltages: ["220kV", "400kV"],
  },
  {
    id: "sf6-annual",
    frequency: "annual_biennial",
    category: "GIS / SF6",
    task: "SF6 gas leakage test, partial discharge (PD) monitoring where installed",
    voltages: ["220kV", "400kV"],
  },
];

export const SAFETY_REQUIREMENTS: SafetyRequirement[] = [
  {
    id: "ptw",
    area: "Permit to Work (PTW)",
    requirement:
      "Written PTW from control room before any maintenance; mechanical isolation, LOTO, earthing mandatory.",
    consequence: "PTW bypass → arc flash / electrocution → FIR (BNS/IPC), criminal liability.",
  },
  {
    id: "clearance",
    area: "Statutory Clearances",
    requirement:
      "Ground & phase clearances per Indian Electricity Rules; exclusion zones enforced during line/substation work.",
    consequence: "Clearance breach → instant fatal arc flash; public safety liability.",
  },
  {
    id: "ppe",
    area: "Personal Protective Equipment",
    requirement:
      "FR clothing (arc-rated cal/cm²), EH-rated safety boots, discharge rods for residual charge.",
    consequence: "Inadequate PPE → severe burns, permanent injury, labor court penalties.",
  },
  {
    id: "supervision",
    area: "Competent Supervision",
    requirement:
      "EHV line/substation work directly supervised by competent person familiar with risks.",
    consequence: "Unsupervised work → regulatory reprimand, accident investigation, compensation payouts.",
  },
  {
    id: "ex-gratia",
    area: "Fatality Response",
    requirement:
      "Immediate incident reporting, statutory ex-gratia to victim families, root-cause analysis within SLA.",
    consequence: "Delayed reporting → NGT/HERC scrutiny, enhanced compensation mandates.",
  },
];

export const PM_CHECKLIST_220_400: PmChecklistTask[] = [
  {
    id: "pm-dw-tx",
    frequency: "daily_weekly",
    category: "Transformers & Reactors",
    tasks: [
      "Log OTI/WTI peaks",
      "Verify main & OLTC conservator oil levels",
      "Inspect silica gel breather (replace if pink)",
    ],
    voltages: ["220kV", "400kV"],
  },
  {
    id: "pm-dw-gis",
    frequency: "daily_weekly",
    category: "Gas Insulated Switchgear",
    tasks: ["Log & verify SF6 pressure on all density monitors"],
    voltages: ["220kV", "400kV"],
  },
  {
    id: "pm-dw-dc",
    frequency: "daily_weekly",
    category: "DC Battery Bank",
    tasks: [
      "Bank & cell voltage, specific gravity",
      "Charger zero-fault check",
      "Ventilation & exhaust fan operation",
    ],
    voltages: ["220kV", "400kV"],
  },
  {
    id: "pm-dw-yard",
    frequency: "daily_weekly",
    category: "Yard Patrolling",
    tasks: [
      "Night corona / sparking check",
      "Abnormal hum, vibration, chattering",
      "Active oil leak inspection",
    ],
    voltages: ["220kV", "400kV"],
  },
  {
    id: "pm-mq-thermal",
    frequency: "monthly_quarterly",
    category: "Thermal Management",
    tasks: ["IR thermography on clamps, bushings, isolator contacts"],
    voltages: ["220kV", "400kV"],
  },
  {
    id: "pm-mq-earth",
    frequency: "monthly_quarterly",
    category: "Earthing Network",
    tasks: [
      "Earth pit resistance (< 0.5 Ω)",
      "Earth riser connection integrity",
    ],
    voltages: ["220kV", "400kV"],
  },
  {
    id: "pm-mq-insulator",
    frequency: "monthly_quarterly",
    category: "Insulator Health",
    tasks: [
      "Crack & dust accumulation inspection",
      "Wash polluted strings (pre-fog season)",
    ],
    voltages: ["220kV", "400kV"],
  },
  {
    id: "pm-mq-la",
    frequency: "monthly_quarterly",
    category: "Lightning Arresters",
    tasks: ["Leakage current log", "Surge counter readings"],
    voltages: ["220kV", "400kV"],
  },
  {
    id: "pm-ab-tx",
    frequency: "annual_biennial",
    category: "Power Transformers",
    tasks: [
      "DGA, BDV, moisture analysis",
      "IR/PI Megger on windings",
      "Tan-Delta & capacitance on bushings",
    ],
    voltages: ["220kV", "400kV"],
  },
  {
    id: "pm-ab-cb",
    frequency: "annual_biennial",
    category: "Circuit Breakers",
    tasks: [
      "Opening/closing time tests (3-phase)",
      "Phase synchronism",
      "Static & dynamic CRM",
      "Spring/pneumatic drive health",
    ],
    voltages: ["220kV", "400kV"],
  },
  {
    id: "pm-ab-iso",
    frequency: "annual_biennial",
    category: "Isolators & Earth Switches",
    tasks: [
      "Clean, grease, align blade contacts",
      "Electrical & mechanical interlock test",
    ],
    voltages: ["220kV", "400kV"],
  },
  {
    id: "pm-ab-prot",
    frequency: "annual_biennial",
    category: "Protection & Instrumentation",
    tasks: [
      "Distance/differential/overcurrent relay calibration",
      "Secondary injection & 86 trip verification",
      "CT/PT insulation, ratio accuracy",
    ],
    voltages: ["220kV", "400kV"],
  },
];

export const PM_FREQUENCY_LABEL: Record<PmFrequency, string> = {
  daily_weekly: "Daily / Weekly",
  monthly_quarterly: "Monthly / Quarterly",
  annual_biennial: "Annual / Bi-annual",
};

export const PM_FREQUENCY_SHORT: Record<PmFrequency, string> = {
  daily_weekly: "D/W",
  monthly_quarterly: "M/Q",
  annual_biennial: "A/B",
};
