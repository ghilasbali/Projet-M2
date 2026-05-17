import { DiagnosisResult, LabResult, ParathyroidType } from '../types';
import { symptoms, diseaseSymptomMap } from '../data/symptoms';

// Supervised learning-inspired scoring system for symptom-based pre-diagnosis
export function analyzeSymptoms(selectedSymptomIds: string[]): DiagnosisResult[] {
  if (selectedSymptomIds.length === 0) return [];

  const results: DiagnosisResult[] = [];
  const selectedSymptoms = symptoms.filter(s => selectedSymptomIds.includes(s.id));

  for (const [disease, associatedIds] of Object.entries(diseaseSymptomMap)) {
    const matchedIds = selectedSymptomIds.filter(id => associatedIds.includes(id));
    const matchedSymptoms = selectedSymptoms.filter(s => associatedIds.includes(s.id));

    if (matchedIds.length === 0) continue;

    // Weighted score calculation
    const totalWeight = matchedSymptoms.reduce((sum, s) => sum + s.weight, 0);
    const maxPossibleWeight = associatedIds.reduce((sum, id) => {
      const sym = symptoms.find(s => s.id === id);
      return sum + (sym ? sym.weight : 0);
    }, 0);

    // Coverage ratio
    const coverageRatio = matchedIds.length / associatedIds.length;

    // Weighted match ratio
    const weightedRatio = totalWeight / maxPossibleWeight;

    // Combined probability (weighted average of coverage and weight ratios)
    let probability = (coverageRatio * 0.4 + weightedRatio * 0.6) * 100;

    // Bonus for having key discriminating symptoms
    const keySymptomBonus = getKeySymptomBonus(disease as ParathyroidType, selectedSymptomIds);
    probability = Math.min(95, probability + keySymptomBonus);

    // Penalty for contradicting symptoms
    const penalty = getContradictionPenalty(disease as ParathyroidType, selectedSymptomIds);
    probability = Math.max(5, probability - penalty);

    const severity = probability > 70 ? 'sévère' : probability > 45 ? 'modérée' : 'légère';

    const { recommendedTests, recommendedImaging } = getRecommendations(disease as ParathyroidType);

    results.push({
      disease: getDiseaseDisplayName(disease as ParathyroidType),
      type: disease as ParathyroidType,
      probability: Math.round(probability),
      severity,
      description: getDiseaseDescription(disease as ParathyroidType),
      recommendedTests,
      recommendedImaging,
    });
  }

  return results.sort((a, b) => b.probability - a.probability);
}

// Refine diagnosis with lab results
export function refineDiagnosisWithLabs(labResult: LabResult): {
  type: ParathyroidType;
  confidence: number;
  interpretation: string[];
} {
  const interpretations: string[] = [];
  let scores: Record<ParathyroidType, number> = {
    hyperparathyroïdie_primaire: 0,
    hyperparathyroïdie_secondaire: 0,
    hyperparathyroïdie_tertiaire: 0,
    hypoparathyroïdie: 0,
    pseudohypoparathyroïdie: 0,
    normal: 0,
  };

  // PTH Analysis (normal: 15-65 pg/mL)
  if (labResult.pth > 65) {
    interpretations.push(`PTH élevée (${labResult.pth} pg/mL) – Hyperfonctionnement parathyroïdien`);
    scores.hyperparathyroïdie_primaire += 30;
    scores.hyperparathyroïdie_secondaire += 30;
    scores.hyperparathyroïdie_tertiaire += 25;
    scores.pseudohypoparathyroïdie += 20;
  } else if (labResult.pth < 15) {
    interpretations.push(`PTH basse (${labResult.pth} pg/mL) – Hypofonctionnement parathyroïdien`);
    scores.hypoparathyroïdie += 40;
  } else {
    interpretations.push(`PTH normale (${labResult.pth} pg/mL)`);
    scores.normal += 20;
  }

  // Calcium Analysis (normal: 8.5-10.5 mg/dL)
  if (labResult.calcium > 10.5) {
    interpretations.push(`Hypercalcémie (${labResult.calcium} mg/dL) – Excès de calcium sanguin`);
    scores.hyperparathyroïdie_primaire += 35;
    scores.hyperparathyroïdie_tertiaire += 30;
  } else if (labResult.calcium < 8.5) {
    interpretations.push(`Hypocalcémie (${labResult.calcium} mg/dL) – Déficit en calcium sanguin`);
    scores.hyperparathyroïdie_secondaire += 25;
    scores.hypoparathyroïdie += 35;
    scores.pseudohypoparathyroïdie += 30;
  } else {
    interpretations.push(`Calcémie normale (${labResult.calcium} mg/dL)`);
    scores.normal += 15;
  }

  // Phosphore Analysis (normal: 2.5-4.5 mg/dL)
  if (labResult.phosphore < 2.5) {
    interpretations.push(`Hypophosphatémie (${labResult.phosphore} mg/dL)`);
    scores.hyperparathyroïdie_primaire += 20;
    scores.hyperparathyroïdie_tertiaire += 15;
  } else if (labResult.phosphore > 4.5) {
    interpretations.push(`Hyperphosphatémie (${labResult.phosphore} mg/dL)`);
    scores.hyperparathyroïdie_secondaire += 20;
    scores.hypoparathyroïdie += 25;
    scores.pseudohypoparathyroïdie += 25;
  } else {
    interpretations.push(`Phosphorémie normale (${labResult.phosphore} mg/dL)`);
    scores.normal += 10;
  }

  // Vitamin D (normal: 30-100 ng/mL)
  if (labResult.vitaminD < 20) {
    interpretations.push(`Carence sévère en vitamine D (${labResult.vitaminD} ng/mL)`);
    scores.hyperparathyroïdie_secondaire += 30;
  } else if (labResult.vitaminD < 30) {
    interpretations.push(`Insuffisance en vitamine D (${labResult.vitaminD} ng/mL)`);
    scores.hyperparathyroïdie_secondaire += 15;
  } else {
    interpretations.push(`Vitamine D normale (${labResult.vitaminD} ng/mL)`);
    scores.normal += 10;
  }

  // Creatinine (normal: 0.7-1.3 mg/dL)
  if (labResult.creatinine > 1.3) {
    interpretations.push(`Créatinine élevée (${labResult.creatinine} mg/dL) – Fonction rénale altérée`);
    scores.hyperparathyroïdie_secondaire += 25;
    scores.hyperparathyroïdie_tertiaire += 20;
  } else {
    interpretations.push(`Créatinine normale (${labResult.creatinine} mg/dL)`);
    scores.normal += 5;
  }

  // Calciurie 24h (normal: 100-300 mg/24h)
  if (labResult.calciurie24h > 300) {
    interpretations.push(`Hypercalciurie (${labResult.calciurie24h} mg/24h)`);
    scores.hyperparathyroïdie_primaire += 15;
  } else if (labResult.calciurie24h < 100) {
    interpretations.push(`Hypocalciurie (${labResult.calciurie24h} mg/24h)`);
    scores.hypoparathyroïdie += 10;
  }

  // Phosphatase alcaline (normal: 44-147 U/L)
  if (labResult.phosphataseAlcaline > 147) {
    interpretations.push(`Phosphatase alcaline élevée (${labResult.phosphataseAlcaline} U/L) – Atteinte osseuse probable`);
    scores.hyperparathyroïdie_primaire += 10;
    scores.hyperparathyroïdie_secondaire += 15;
    scores.hyperparathyroïdie_tertiaire += 10;
  }

  // Decision logic: combine scores with specific patterns
  // Primary: high PTH + high Ca + low P
  if (labResult.pth > 65 && labResult.calcium > 10.5 && labResult.phosphore < 2.5) {
    scores.hyperparathyroïdie_primaire += 30;
    interpretations.push('⚠️ Profil typique d\'hyperparathyroïdie primaire: PTH↑ Ca↑ P↓');
  }

  // Secondary: high PTH + low Ca + high P + low vitD
  if (labResult.pth > 65 && labResult.calcium <= 10.5 && labResult.vitaminD < 30) {
    scores.hyperparathyroïdie_secondaire += 25;
    interpretations.push('⚠️ Profil évocateur d\'hyperparathyroïdie secondaire: PTH↑ Ca↓/N VitD↓');
  }

  // Hypoparathyroidism: low PTH + low Ca + high P
  if (labResult.pth < 15 && labResult.calcium < 8.5 && labResult.phosphore > 4.5) {
    scores.hypoparathyroïdie += 30;
    interpretations.push('⚠️ Profil typique d\'hypoparathyroïdie: PTH↓ Ca↓ P↑');
  }

  // Pseudohypoparathyroidism: high PTH + low Ca + high P
  if (labResult.pth > 65 && labResult.calcium < 8.5 && labResult.phosphore > 4.5) {
    scores.pseudohypoparathyroïdie += 30;
    interpretations.push('⚠️ Profil évocateur de pseudohypoparathyroïdie: PTH↑ Ca↓ P↑');
  }

  // Find the best match
  const entries = Object.entries(scores) as [ParathyroidType, number][];
  entries.sort((a, b) => b[1] - a[1]);

  const maxScore = entries[0][1];
  const totalScore = entries.reduce((s, e) => s + e[1], 0);
  const confidence = totalScore > 0 ? Math.min(95, Math.round((maxScore / totalScore) * 100)) : 0;

  return {
    type: entries[0][0],
    confidence,
    interpretation: interpretations,
  };
}

function getKeySymptomBonus(disease: ParathyroidType, selectedIds: string[]): number {
  const keySymptoms: Record<string, string[]> = {
    hyperparathyroïdie_primaire: ['s2', 's6', 's3'], // fractures, calculs, ostéoporose
    hyperparathyroïdie_secondaire: ['s9', 's35'], // insuffisance rénale, calcifications
    hyperparathyroïdie_tertiaire: ['s9', 's6', 's35'],
    hypoparathyroïdie: ['s19', 's18', 's26'], // tétanie, paresthésies, convulsions
    pseudohypoparathyroïdie: ['s5', 's19', 's35'], // déformations, tétanie, calcifications
  };

  const keys = keySymptoms[disease] || [];
  const matched = keys.filter(k => selectedIds.includes(k));
  return matched.length * 8;
}

function getContradictionPenalty(disease: ParathyroidType, selectedIds: string[]): number {
  // Hypo symptoms contradict hyper and vice versa
  if (disease.startsWith('hyper') && selectedIds.includes('s19')) return 15; // tétanie is hypo
  if (disease === 'hypoparathyroïdie' && selectedIds.includes('s6')) return 15; // calculs is hyper
  return 0;
}

function getDiseaseDisplayName(type: ParathyroidType): string {
  const names: Record<ParathyroidType, string> = {
    hyperparathyroïdie_primaire: 'Hyperparathyroïdie Primaire',
    hyperparathyroïdie_secondaire: 'Hyperparathyroïdie Secondaire',
    hyperparathyroïdie_tertiaire: 'Hyperparathyroïdie Tertiaire',
    hypoparathyroïdie: 'Hypoparathyroïdie',
    pseudohypoparathyroïdie: 'Pseudohypoparathyroïdie',
    normal: 'Normal',
  };
  return names[type];
}

function getDiseaseDescription(type: ParathyroidType): string {
  const descriptions: Record<ParathyroidType, string> = {
    hyperparathyroïdie_primaire: 'Production excessive de PTH par un adénome ou une hyperplasie parathyroïdienne, causant hypercalcémie.',
    hyperparathyroïdie_secondaire: 'Hyperproduction compensatoire de PTH due à une hypocalcémie chronique (insuffisance rénale, carence vitamine D).',
    hyperparathyroïdie_tertiaire: 'Autonomisation des glandes parathyroïdes après hyperparathyroïdie secondaire prolongée.',
    hypoparathyroïdie: 'Production insuffisante de PTH causant hypocalcémie et hyperphosphatémie.',
    pseudohypoparathyroïdie: 'Résistance des tissus cibles à la PTH malgré un taux de PTH normal ou élevé.',
    normal: 'Pas d\'anomalie détectée.',
  };
  return descriptions[type];
}

function getRecommendations(type: ParathyroidType): { recommendedTests: string[]; recommendedImaging: string[] } {
  const tests: Record<string, string[]> = {
    hyperparathyroïdie_primaire: [
      'PTH intacte (sang)',
      'Calcémie totale et ionisée',
      'Phosphorémie',
      'Calciurie des 24h',
      'Vitamine D (25-OH)',
      'Créatinine + DFG',
      'Phosphatase alcaline',
    ],
    hyperparathyroïdie_secondaire: [
      'PTH intacte',
      'Calcémie et phosphorémie',
      'Vitamine D (25-OH et 1,25-OH)',
      'Créatinine + DFG',
      'Bilan rénal complet',
      'Albuminémie',
    ],
    hyperparathyroïdie_tertiaire: [
      'PTH intacte',
      'Calcémie ionisée',
      'Phosphorémie',
      'Fonction rénale complète',
      'Bilan du greffon rénal',
    ],
    hypoparathyroïdie: [
      'PTH intacte',
      'Calcémie totale et ionisée',
      'Phosphorémie',
      'Magnésémie',
      'Calciurie des 24h',
      'Vitamine D',
    ],
    pseudohypoparathyroïdie: [
      'PTH intacte',
      'Calcémie et phosphorémie',
      'AMPc urinaire après perfusion de PTH',
      'TSH et T4 libre',
      'Test génétique (GNAS1)',
    ],
  };

  const imaging: Record<string, string[]> = {
    hyperparathyroïdie_primaire: [
      'Échographie cervicale',
      'Scintigraphie au MIBI (Sestamibi)',
      'Densitométrie osseuse (DEXA)',
      'Scanner cervical si chirurgie envisagée',
    ],
    hyperparathyroïdie_secondaire: [
      'Échographie rénale',
      'Radiographies osseuses',
      'Densitométrie osseuse',
      'Échographie cervicale',
    ],
    hyperparathyroïdie_tertiaire: [
      'Scintigraphie au MIBI',
      'Échographie cervicale',
      'Densitométrie osseuse',
      'Scanner cervical',
    ],
    hypoparathyroïdie: [
      'Scanner cérébral (calcifications)',
      'Échographie rénale',
      'Radiographies des mains',
    ],
    pseudohypoparathyroïdie: [
      'Radiographies des mains et pieds',
      'Scanner cérébral',
      'Radiographies du squelette',
    ],
  };

  return {
    recommendedTests: tests[type] || [],
    recommendedImaging: imaging[type] || [],
  };
}
