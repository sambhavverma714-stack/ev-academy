export interface Programme {
  id: string;
  title: string;
  shortTitle: string;
  level: "Foundation" | "Intermediate" | "Advanced";
  hours: number;
  modules: number;
  questions: number;
  passingScore: number;
  price: number;
  description: string;
}

/**
 * Fallback catalogue. The live data comes from the Express API
 * (GET /api/courses); this keeps the interface complete and readable
 * when the API is not running, for example on a first local start.
 */
export const PROGRAMMES: Programme[] = [
  {
    id: "hv-safety",
    title: "High-Voltage Safety & PPE",
    shortTitle: "HV Safety",
    level: "Foundation",
    hours: 4,
    modules: 6,
    questions: 5,
    passingScore: 80,
    price: 499,
    description:
      "Learn how high-voltage systems in electric and hybrid vehicles can injure or kill, which PPE to wear, how to isolate a vehicle safely, and how to respond to a damaged EV.",
  },
  {
    id: "battery-diagnostics",
    title: "Lithium-Ion Battery Diagnostics",
    shortTitle: "Battery Diagnostics",
    level: "Intermediate",
    hours: 6,
    modules: 6,
    questions: 5,
    passingScore: 80,
    price: 999,
    description:
      "Understand EV pack architecture and cell chemistry, the Battery Management System, insulation resistance testing, state-of-health assessment, and how to respond to a thermal event.",
  },
  {
    id: "motor-inverter",
    title: "Drive Motor & Inverter Troubleshooting",
    shortTitle: "Drive Systems",
    level: "Advanced",
    hours: 6,
    modules: 5,
    questions: 5,
    passingScore: 80,
    price: 799,
    description:
      "Diagnose traction motors, inverters, rotor position sensors and resolvers, and diagnostic trouble codes in EV drive systems, with a structured approach to every fault.",
  },
  {
    id: "charging-systems",
    title: "EV Charging Systems: AC and DC",
    shortTitle: "Charging Systems",
    level: "Intermediate",
    hours: 5,
    modules: 5,
    questions: 5,
    passingScore: 80,
    price: 799,
    description:
      "Learn how AC and DC charging equipment works, how the vehicle and charger communicate, how the onboard charger operates, and how to diagnose charging faults safely.",
  },
  {
    id: "hv-wiring-repair",
    title: "High-Voltage Wiring and Connector Repair",
    shortTitle: "HV Wiring",
    level: "Advanced",
    hours: 5,
    modules: 5,
    questions: 5,
    passingScore: 80,
    price: 999,
    description:
      "Inspect, diagnose, and repair orange high-voltage cables, shielded wiring, and HV connectors using manufacturer-approved methods and insulation-safe techniques.",
  },
];

export const LEVELS = ["All", "Foundation", "Intermediate", "Advanced"] as const;

export const findProgramme = (id: string) => PROGRAMMES.find((p) => p.id === id);
