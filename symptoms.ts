import { Symptom } from '../types';

export const symptoms: Symptom[] = [
  // Symptômes osseux et articulaires
  { id: 's1', name: 'Douleurs osseuses', category: 'Osseux', weight: 0.85, description: 'Douleurs diffuses au niveau des os, surtout le dos et les membres' },
  { id: 's2', name: 'Fractures pathologiques', category: 'Osseux', weight: 0.95, description: 'Fractures survenant spontanément ou après un traumatisme minime' },
  { id: 's3', name: 'Ostéoporose', category: 'Osseux', weight: 0.9, description: 'Diminution de la densité osseuse détectée ou suspectée' },
  { id: 's4', name: 'Douleurs articulaires', category: 'Osseux', weight: 0.6, description: 'Douleurs au niveau des articulations' },
  { id: 's5', name: 'Déformations osseuses', category: 'Osseux', weight: 0.85, description: 'Changements visibles dans la forme des os' },

  // Symptômes rénaux
  { id: 's6', name: 'Calculs rénaux (lithiase)', category: 'Rénal', weight: 0.9, description: 'Formation de calculs dans les reins, coliques néphrétiques' },
  { id: 's7', name: 'Polyurie (uriner beaucoup)', category: 'Rénal', weight: 0.7, description: 'Besoin fréquent d\'uriner avec un volume urinaire augmenté' },
  { id: 's8', name: 'Polydipsie (soif intense)', category: 'Rénal', weight: 0.65, description: 'Sensation de soif permanente et intense' },
  { id: 's9', name: 'Insuffisance rénale', category: 'Rénal', weight: 0.8, description: 'Diminution de la fonction rénale' },

  // Symptômes digestifs
  { id: 's10', name: 'Nausées / Vomissements', category: 'Digestif', weight: 0.5, description: 'Sensation de malaise gastrique avec ou sans vomissements' },
  { id: 's11', name: 'Constipation', category: 'Digestif', weight: 0.55, description: 'Difficulté à aller à la selle, selles peu fréquentes' },
  { id: 's12', name: 'Douleurs abdominales', category: 'Digestif', weight: 0.5, description: 'Douleurs au niveau du ventre' },
  { id: 's13', name: 'Perte d\'appétit', category: 'Digestif', weight: 0.45, description: 'Diminution de l\'envie de manger' },
  { id: 's14', name: 'Ulcère gastrique', category: 'Digestif', weight: 0.6, description: 'Ulcère de l\'estomac ou du duodénum' },
  { id: 's15', name: 'Pancréatite', category: 'Digestif', weight: 0.75, description: 'Inflammation du pancréas' },

  // Symptômes neuromusculaires
  { id: 's16', name: 'Fatigue musculaire', category: 'Neuromusculaire', weight: 0.7, description: 'Sensation de faiblesse musculaire permanente' },
  { id: 's17', name: 'Crampes musculaires', category: 'Neuromusculaire', weight: 0.65, description: 'Contractions musculaires douloureuses involontaires' },
  { id: 's18', name: 'Fourmillements (paresthésies)', category: 'Neuromusculaire', weight: 0.75, description: 'Sensations de picotements dans les mains, pieds, lèvres' },
  { id: 's19', name: 'Spasmes musculaires / Tétanie', category: 'Neuromusculaire', weight: 0.9, description: 'Contractions musculaires prolongées (signe de Trousseau/Chvostek)' },
  { id: 's20', name: 'Faiblesse généralisée', category: 'Neuromusculaire', weight: 0.6, description: 'Sensation de faiblesse dans tout le corps' },

  // Symptômes neuropsychiatriques
  { id: 's21', name: 'Dépression', category: 'Neuropsychiatrique', weight: 0.55, description: 'Humeur dépressive, perte d\'intérêt' },
  { id: 's22', name: 'Confusion mentale', category: 'Neuropsychiatrique', weight: 0.7, description: 'Difficulté à penser clairement, désorientation' },
  { id: 's23', name: 'Troubles de la mémoire', category: 'Neuropsychiatrique', weight: 0.6, description: 'Difficultés à se souvenir, oublis fréquents' },
  { id: 's24', name: 'Anxiété / Irritabilité', category: 'Neuropsychiatrique', weight: 0.5, description: 'Nervosité excessive, irritabilité inhabituelle' },
  { id: 's25', name: 'Troubles du sommeil', category: 'Neuropsychiatrique', weight: 0.45, description: 'Insomnie ou sommeil perturbé' },
  { id: 's26', name: 'Convulsions', category: 'Neuropsychiatrique', weight: 0.85, description: 'Crises épileptiques ou convulsives' },

  // Symptômes cardiovasculaires
  { id: 's27', name: 'Hypertension artérielle', category: 'Cardiovasculaire', weight: 0.55, description: 'Tension artérielle élevée' },
  { id: 's28', name: 'Palpitations', category: 'Cardiovasculaire', weight: 0.5, description: 'Sensation de battements cardiaques rapides ou irréguliers' },
  { id: 's29', name: 'Arythmie cardiaque', category: 'Cardiovasculaire', weight: 0.65, description: 'Troubles du rythme cardiaque' },

  // Symptômes généraux
  { id: 's30', name: 'Fatigue chronique', category: 'Général', weight: 0.6, description: 'Fatigue persistante non expliquée par l\'effort' },
  { id: 's31', name: 'Perte de poids inexpliquée', category: 'Général', weight: 0.5, description: 'Amaigrissement sans raison apparente' },
  { id: 's32', name: 'Sécheresse cutanée', category: 'Général', weight: 0.4, description: 'Peau sèche et squameuse' },
  { id: 's33', name: 'Chute de cheveux', category: 'Général', weight: 0.35, description: 'Perte de cheveux anormale' },
  { id: 's34', name: 'Ongles cassants', category: 'Général', weight: 0.35, description: 'Ongles fragiles qui se cassent facilement' },
  { id: 's35', name: 'Calcifications des tissus mous', category: 'Général', weight: 0.8, description: 'Dépôts de calcium dans les tissus (peau, yeux, etc.)' },
];

export const symptomCategories = [
  'Osseux',
  'Rénal',
  'Digestif',
  'Neuromusculaire',
  'Neuropsychiatrique',
  'Cardiovasculaire',
  'Général',
];

// Symptoms strongly associated with each parathyroid condition
export const diseaseSymptomMap: Record<string, string[]> = {
  hyperparathyroïdie_primaire: ['s1', 's2', 's3', 's6', 's7', 's8', 's10', 's11', 's14', 's15', 's16', 's21', 's22', 's27', 's30'],
  hyperparathyroïdie_secondaire: ['s1', 's3', 's5', 's9', 's16', 's17', 's18', 's20', 's27', 's29', 's30', 's35'],
  hyperparathyroïdie_tertiaire: ['s1', 's2', 's3', 's6', 's7', 's9', 's16', 's22', 's27', 's30', 's35'],
  hypoparathyroïdie: ['s17', 's18', 's19', 's26', 's24', 's25', 's28', 's29', 's32', 's33', 's34', 's35'],
  pseudohypoparathyroïdie: ['s5', 's17', 's18', 's19', 's26', 's32', 's33', 's34', 's35'],
};
