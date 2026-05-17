import { ParathyroidType } from '../types';

export interface TreatmentProtocol {
  type: ParathyroidType;
  name: string;
  description: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    notes: string;
  }[];
  lifestyle: string[];
  monitoring: string[];
  followUpWeeks: number[];
}

export const treatmentProtocols: TreatmentProtocol[] = [
  {
    type: 'hyperparathyroïdie_primaire',
    name: 'Hyperparathyroïdie Primaire',
    description: 'Sécrétion excessive de PTH par un adénome ou une hyperplasie des glandes parathyroïdes. C\'est la forme la plus fréquente.',
    medications: [
      { name: 'Cinacalcet (Mimpara)', dosage: '30 mg', frequency: '2x/jour', notes: 'Calcimimétique – réduit la PTH. À prendre avec les repas.' },
      { name: 'Alendronate (Fosamax)', dosage: '70 mg', frequency: '1x/semaine', notes: 'Bisphosphonate – protège les os. À prendre à jeun avec un grand verre d\'eau.' },
      { name: 'Hydratation abondante', dosage: '2-3 L/jour', frequency: 'Quotidien', notes: 'Prévention des calculs rénaux' },
      { name: 'Vitamine D', dosage: '800-1000 UI', frequency: '1x/jour', notes: 'Si carence documentée. Surveillance calcémie nécessaire.' },
    ],
    lifestyle: [
      'Hydratation abondante (2-3 L d\'eau par jour)',
      'Éviter les excès de calcium alimentaire (>1000 mg/j)',
      'Activité physique régulière pour protéger les os',
      'Éviter l\'immobilisation prolongée',
      'Surveillance de la tension artérielle',
    ],
    monitoring: [
      'Calcémie et PTH tous les 3-6 mois',
      'Fonction rénale (créatinine) tous les 6 mois',
      'Densitométrie osseuse annuelle',
      'Échographie rénale annuelle',
      'Calciurie des 24h tous les 6 mois',
    ],
    followUpWeeks: [2, 6, 12, 24, 36, 48],
  },
  {
    type: 'hyperparathyroïdie_secondaire',
    name: 'Hyperparathyroïdie Secondaire',
    description: 'Réponse compensatoire des glandes parathyroïdes à une hypocalcémie chronique, souvent liée à l\'insuffisance rénale ou carence en vitamine D.',
    medications: [
      { name: 'Vitamine D active (Calcitriol)', dosage: '0.25-0.5 µg', frequency: '1x/jour', notes: 'Corrige le déficit en vitamine D active.' },
      { name: 'Carbonate de calcium', dosage: '500-1500 mg', frequency: '3x/jour aux repas', notes: 'Chélateur du phosphore et supplément calcique.' },
      { name: 'Sevelamer (Renvela)', dosage: '800 mg', frequency: '3x/jour aux repas', notes: 'Chélateur du phosphore sans calcium.' },
      { name: 'Cinacalcet (Mimpara)', dosage: '30-90 mg', frequency: '1x/jour', notes: 'Si PTH reste élevée malgré le traitement.' },
    ],
    lifestyle: [
      'Régime pauvre en phosphore (limiter produits laitiers, sodas, viandes transformées)',
      'Apport en calcium selon prescription',
      'Suivi néphrologique régulier',
      'Éviter les aliments riches en potassium si insuffisance rénale',
    ],
    monitoring: [
      'Calcémie, phosphorémie et PTH tous les 1-3 mois',
      'Fonction rénale mensuelle',
      'Phosphatase alcaline tous les 3 mois',
      'Bilan phosphocalcique complet trimestriel',
    ],
    followUpWeeks: [2, 4, 8, 12, 24, 36, 48],
  },
  {
    type: 'hyperparathyroïdie_tertiaire',
    name: 'Hyperparathyroïdie Tertiaire',
    description: 'Autonomisation des glandes parathyroïdes après une hyperparathyroïdie secondaire prolongée, souvent après transplantation rénale.',
    medications: [
      { name: 'Cinacalcet (Mimpara)', dosage: '30-90 mg', frequency: '1-2x/jour', notes: 'En attendant ou en alternative à la chirurgie.' },
      { name: 'Bisphosphonates', dosage: 'Variable', frequency: 'Selon prescription', notes: 'Protection osseuse si ostéoporose.' },
      { name: 'Hydratation abondante', dosage: '2-3 L/jour', frequency: 'Quotidien', notes: 'Prévention des calculs.' },
    ],
    lifestyle: [
      'Suivi post-transplantation strict',
      'Hydratation abondante',
      'Activité physique adaptée',
      'Surveillance régulière de la fonction du greffon',
    ],
    monitoring: [
      'Calcémie et PTH tous les 1-3 mois',
      'Fonction rénale (du greffon) régulière',
      'Densitométrie osseuse annuelle',
      'Discussion chirurgicale si échec médical',
    ],
    followUpWeeks: [1, 2, 4, 8, 12, 24, 48],
  },
  {
    type: 'hypoparathyroïdie',
    name: 'Hypoparathyroïdie',
    description: 'Insuffisance de sécrétion de PTH, entraînant une hypocalcémie. Souvent post-chirurgicale.',
    medications: [
      { name: 'Calcium élémentaire', dosage: '1000-3000 mg/jour', frequency: 'En 3 prises', notes: 'Fractionnement pour meilleure absorption.' },
      { name: 'Calcitriol (Rocaltrol)', dosage: '0.25-2 µg', frequency: '2x/jour', notes: 'Vitamine D active pour favoriser l\'absorption du calcium.' },
      { name: 'Magnésium', dosage: '300-400 mg', frequency: '1-2x/jour', notes: 'Si magnésémie basse.' },
      { name: 'PTH recombinante (Natpara)', dosage: '50-100 µg', frequency: '1x/jour SC', notes: 'Dans les cas réfractaires. Injection sous-cutanée.' },
    ],
    lifestyle: [
      'Régime riche en calcium (produits laitiers, légumes verts)',
      'Éviter les aliments riches en phosphates',
      'Apprendre à reconnaître les signes d\'hypocalcémie',
      'Porter un bracelet d\'identification médicale',
    ],
    monitoring: [
      'Calcémie hebdomadaire puis mensuelle',
      'Phosphorémie et magnésémie mensuelles',
      'Calciurie des 24h tous les 3 mois',
      'Fonction rénale tous les 3-6 mois',
      'Recherche de calcifications (rein, cerveau) annuelle',
    ],
    followUpWeeks: [1, 2, 4, 8, 12, 24, 48],
  },
  {
    type: 'pseudohypoparathyroïdie',
    name: 'Pseudohypoparathyroïdie',
    description: 'Résistance des tissus cibles à l\'action de la PTH. Le taux de PTH est élevé mais les tissus ne répondent pas.',
    medications: [
      { name: 'Calcium élémentaire', dosage: '1000-2000 mg/jour', frequency: 'En 2-3 prises', notes: 'Compensation de l\'hypocalcémie.' },
      { name: 'Calcitriol (Rocaltrol)', dosage: '0.5-2 µg', frequency: '2x/jour', notes: 'Contourne la résistance à la PTH.' },
    ],
    lifestyle: [
      'Suivi endocrinologique régulier',
      'Régime riche en calcium',
      'Surveillance du poids (risque d\'obésité)',
      'Surveillance thyroïdienne associée',
    ],
    monitoring: [
      'Calcémie et phosphorémie mensuelles',
      'PTH tous les 3 mois',
      'TSH et T4 libre annuels',
      'Calciurie des 24h tous les 6 mois',
    ],
    followUpWeeks: [2, 4, 8, 12, 24, 48],
  },
];

export const diseaseDescriptions: Record<ParathyroidType, { title: string; description: string; color: string }> = {
  hyperparathyroïdie_primaire: {
    title: 'Hyperparathyroïdie Primaire',
    description: 'Excès de PTH dû à un adénome parathyroïdien (85%), hyperplasie (10%) ou carcinome (<1%). Entraîne hypercalcémie, lithiase rénale, ostéoporose.',
    color: '#dc2626',
  },
  hyperparathyroïdie_secondaire: {
    title: 'Hyperparathyroïdie Secondaire',
    description: 'Hyperproduction compensatoire de PTH en réponse à une hypocalcémie chronique (insuffisance rénale, carence en vitamine D).',
    color: '#d97706',
  },
  hyperparathyroïdie_tertiaire: {
    title: 'Hyperparathyroïdie Tertiaire',
    description: 'Autonomisation des glandes parathyroïdes après hyperparathyroïdie secondaire prolongée. Souvent post-transplantation rénale.',
    color: '#7c3aed',
  },
  hypoparathyroïdie: {
    title: 'Hypoparathyroïdie',
    description: 'Déficit en PTH causant hypocalcémie et hyperphosphatémie. Cause principale: post-chirurgicale (thyroïdectomie).',
    color: '#2563eb',
  },
  pseudohypoparathyroïdie: {
    title: 'Pseudohypoparathyroïdie',
    description: 'Résistance périphérique à la PTH malgré un taux élevé. Associée à l\'ostéodystrophie héréditaire d\'Albright.',
    color: '#059669',
  },
  normal: {
    title: 'Normal',
    description: 'Aucune anomalie parathyroïdienne détectée.',
    color: '#16a34a',
  },
};
