export interface Symptom {
  id: string;
  name: string;
  category: string;
  weight: number;
  description: string;
}

export interface DiagnosisResult {
  disease: string;
  type: ParathyroidType;
  probability: number;
  severity: 'légère' | 'modérée' | 'sévère';
  description: string;
  recommendedTests: string[];
  recommendedImaging: string[];
}

export type ParathyroidType =
  | 'hyperparathyroïdie_primaire'
  | 'hyperparathyroïdie_secondaire'
  | 'hyperparathyroïdie_tertiaire'
  | 'hypoparathyroïdie'
  | 'pseudohypoparathyroïdie'
  | 'normal';

export interface PatientFile {
  id: string;
  name: string;
  size: string;
  type: 'analyse' | 'radio' | 'ordonnance' | 'autre';
  category: string;
  date: string;
  dataUrl?: string; // base64 preview for images
}

export interface LabResult {
  id: string;
  date: string;
  time: string;
  pth: number;
  calcium: number;
  phosphore: number;
  vitaminD: number;
  creatinine: number;
  calciurie24h: number;
  phosphataseAlcaline: number;
  files: PatientFile[];
}

export interface ImagingResult {
  id: string;
  date: string;
  time: string;
  type: 'echographie' | 'scintigraphie' | 'scanner' | 'densitometrie';
  description: string;
  findings: string;
  conclusion: string;
  files: PatientFile[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes: string;
  prescribedBy?: string; // doctorId
  prescribedByName?: string;
  prescribedDate: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: 'consultation' | 'analyse' | 'imagerie' | 'suivi';
  status: 'planifié' | 'en_attente' | 'effectué' | 'annulé';
  notes: string;
  doctorId?: string;
  doctorName?: string;
  patientId?: string;
  patientName?: string;
  createdAt: string;
  // Validation mutuelle
  doctorAccepted?: boolean;
  patientAccepted?: boolean;
  requestedBy?: 'patient' | 'medecin';
  // Demande de changement
  requestedDate?: string;
  requestedTime?: string;
  requestReason?: string;
}

export interface AppMessage {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: UserRole;
  toId: string;
  toName: string;
  appointmentId?: string;
  text: string;
  date: string;
  read: boolean;
}

export type UserRole = 'patient' | 'medecin' | 'admin';

export interface Patient {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  password: string;
  address: string;
  createdAt: string;
  symptoms: string[];
  symptomsText: string;
  diagnosisResults: DiagnosisResult[];
  labResults: LabResult[];
  imagingResults: ImagingResult[];
  medications: Medication[];
  appointments: Appointment[];
  confirmedDiagnosis?: ParathyroidType;
  accessCode: string;
  sharedWith: string[];
  treatmentNotes: string[];
  messages: AppMessage[];
  patientFiles: PatientFile[];
  hasMedicalRecord: boolean;     // true si le patient a créé son dossier médical
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  calcium: number;
  pth: number;
  phosphorus: number;
  history: string;
  specialty?: string;
  adminNumber?: string;        // identifiant administratif interne
  // Médecin : créneaux occupés (date+heure)
  busySlots?: string[];        // format "YYYY-MM-DD HH:MM"
}

export type AppPage =
  | 'dashboard'
  | 'patients'
  | 'abaques'
  | 'config'
  | 'treatment'
  | 'appointments'
  | 'admin-users'
  | 'about';

export interface DoctorCode {
  id: string;
  code: string;
  createdAt: string;
  expiresAt?: string;
  used: boolean;
  usedAt?: string;
  usedBy?: string;
}

export interface CustomNorms {
  caMin: number;
  caMax: number;
  pthMin: number;
  pthMax: number;
  phosMin: number;
  phosMax: number;
  vitDMin: number;
  vitDMax: number;
}

export interface AIConfig {
  nlpWeight: number;
  latencyMs: number;
}

export interface LogEntry {
  time: string;
  text: string;
}

export interface AnalysisResults {
  caVal: number;
  pthVal: number;
  phosVal: number;
  foundKw: string[];
  nlpScore: number;
  prob: number;
  title: string;
  desc: string;
  code: string;
  diff: string;
  diagnosisType: ParathyroidType;
  investigations: string[];
}

export interface UploadedFile {
  name: string;
  size: string;
}
