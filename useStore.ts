import { useState, useCallback } from 'react';
import {
  Patient, AppPage, LabResult, ImagingResult, Medication,
  Appointment, ParathyroidType, CustomNorms, UserRole,
  AIConfig, LogEntry, AnalysisResults, UploadedFile, AppMessage, PatientFile, DoctorCode
} from '../types';

const STORAGE_KEY = 'parathyro_detect_data';
const STORAGE_VERSION_KEY = 'parathyro_data_version';
const DOCTOR_CODES_KEY = 'parathyro_doctor_codes';
const CURRENT_VERSION = '10'; // réintroduction propre de la couche admin
const ADMIN_EMAIL = 'admin@parathyrodetect.com';
const ADMIN_PASSWORD = 'Admin1234';

function generateId(prefix = 'PT'): string {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function buildAdminUser(): Patient {
  return {
    id: 'AD-0001',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'SYSTEM',
    dateOfBirth: '1990-01-01',
    gender: 'M',
    phone: '',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    address: '',
    createdAt: new Date().toISOString(),
    symptoms: [],
    symptomsText: '',
    diagnosisResults: [],
    labResults: [],
    imagingResults: [],
    medications: [],
    appointments: [],
    confirmedDiagnosis: undefined,
    accessCode: '',
    sharedWith: [],
    treatmentNotes: [],
    messages: [],
    patientFiles: [],
    hasMedicalRecord: false,
    assignedDoctorId: undefined,
    assignedDoctorName: undefined,
    calcium: 0,
    pth: 0,
    phosphorus: 0,
    history: '',
    specialty: undefined,
    adminNumber: '',
    busySlots: undefined,
  };
}

function buildFallbackUser(): Patient {
  return {
    id: 'TEMP-0000',
    role: 'patient',
    firstName: 'Visiteur',
    lastName: 'TEMP',
    dateOfBirth: '2000-01-01',
    gender: 'M',
    phone: '',
    email: '',
    password: '',
    address: '',
    createdAt: new Date().toISOString(),
    symptoms: [],
    symptomsText: '',
    diagnosisResults: [],
    labResults: [],
    imagingResults: [],
    medications: [],
    appointments: [],
    confirmedDiagnosis: undefined,
    accessCode: '',
    sharedWith: [],
    treatmentNotes: [],
    messages: [],
    patientFiles: [],
    hasMedicalRecord: false,
    assignedDoctorId: undefined,
    assignedDoctorName: undefined,
    calcium: 0,
    pth: 0,
    phosphorus: 0,
    history: '',
    specialty: undefined,
    adminNumber: '',
    busySlots: undefined,
  };
}

function loadPatients(): Patient[] {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(DOCTOR_CODES_KEY);
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
      return [buildAdminUser()];
    }
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as Patient[];
      const hasAdmin = parsed.some(p => p.role === 'admin' && p.email === ADMIN_EMAIL);
      return hasAdmin ? parsed : [buildAdminUser(), ...parsed];
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
  }
  return [buildAdminUser()];
}

function loadDoctorCodes(): DoctorCode[] {
  try {
    const data = localStorage.getItem(DOCTOR_CODES_KEY);
    if (data) return JSON.parse(data) as DoctorCode[];
  } catch {}
  return [
    { id: 'dc1', code: 'MED-2026-A1', createdAt: new Date().toISOString(), used: false },
    { id: 'dc2', code: 'MED-2026-B2', createdAt: new Date().toISOString(), used: false },
    { id: 'dc3', code: 'MED-2026-C3', createdAt: new Date().toISOString(), used: false },
  ];
}

function savePatients(patients: Patient[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

function saveDoctorCodes(codes: DoctorCode[]) {
  localStorage.setItem(DOCTOR_CODES_KEY, JSON.stringify(codes));
}

export function useAppStore() {
  const initialPatients = loadPatients();
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatients[0]?.id || '');
  const [currentPatientForAI, setCurrentPatientForAI] = useState<Patient>(initialPatients[0] || buildFallbackUser());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [doctorCodes, setDoctorCodes] = useState<DoctorCode[]>(loadDoctorCodes());

  const [customNorms, setCustomNorms] = useState<CustomNorms>({
    caMin: 8.5, caMax: 10.2, pthMin: 15, pthMax: 65, phosMin: 2.5, phosMax: 4.5, vitDMin: 30, vitDMax: 100,
  });
  const [aiConfig, setAiConfig] = useState<AIConfig>({ nlpWeight: 100, latencyMs: 2000 });
  const [consoleLogs, setConsoleLogs] = useState<LogEntry[]>([
    { time: new Date().toLocaleTimeString(), text: 'Système ParaThyroDetect initialisé avec succès.' },
    { time: new Date().toLocaleTimeString(), text: 'Moteur d\'analyse IA prêt pour l\'inférence.' },
    { time: new Date().toLocaleTimeString(), text: 'Abaques de référence calibrés aux normes standards.' },
  ]);

  const [symptomsText, setSymptomsText] = useState('');
  const [calcium, setCalcium] = useState('');
  const [pth, setPth] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>({ name: 'rapport_biologique_initial.pdf', size: '1.2 MB (OCR OK)' });

  const [analysisState, setAnalysisState] = useState<'idle' | 'loading' | 'completed'>('idle');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const updatePatients = useCallback((updater: (prev: Patient[]) => Patient[]) => {
    setPatients(prev => {
      const next = updater(prev);
      savePatients(next);
      return next;
    });
  }, []);

  const addLog = useCallback((text: string) => {
    setConsoleLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text }]);
  }, []);

  const clearLogs = useCallback(() => {
    setConsoleLogs([{ time: new Date().toLocaleTimeString(), text: 'Console réinitialisée.' }]);
  }, []);

  const adminAddDoctorCode = useCallback(() => {
    const suffix = Math.random().toString(36).substring(2, 4).toUpperCase();
    const year = new Date().getFullYear();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 90000);
    const newCode: DoctorCode = { id: generateId('DC'), code: `MED-${year}-${suffix}`, createdAt: createdAt.toISOString(), expiresAt: expiresAt.toISOString(), used: false };
    const updated = [...doctorCodes, newCode];
    setDoctorCodes(updated);
    saveDoctorCodes(updated);
    addLog(`Code médecin généré : ${newCode.code}`);
    return newCode.code;
  }, [doctorCodes, addLog]);

  const adminDeleteDoctorCode = useCallback((code: string) => {
    const updated = doctorCodes.filter(c => c.code !== code);
    setDoctorCodes(updated);
    saveDoctorCodes(updated);
    addLog(`Code médecin supprimé : ${code}`);
  }, [doctorCodes, addLog]);

  const adminDeleteUser = useCallback((userId: string) => {
    const user = patients.find(p => p.id === userId);
    if (user?.role === 'admin') return;
    updatePatients(prev => prev.filter(p => p.id !== userId));
    addLog(`Utilisateur supprimé : ${userId}`);
  }, [patients, updatePatients, addLog]);

  const adminUpdateUser = useCallback((userId: string, updates: Partial<Patient>) => {
    updatePatients(prev => prev.map(p => p.id === userId ? { ...p, ...updates } : p));
    addLog(`Utilisateur modifié : ${userId}`);
  }, [updatePatients, addLog]);

  // Connexion générale : patient, médecin, administrateur
  const login = useCallback((email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Connexion admin directement depuis la page principale
    if (normalizedEmail === ADMIN_EMAIL && normalizedPassword === ADMIN_PASSWORD) {
      let admin = patients.find(p => p.role === 'admin' && p.email.toLowerCase() === ADMIN_EMAIL);
      if (!admin) {
        admin = buildAdminUser();
        updatePatients(prev => {
          const others = prev.filter(p => p.role !== 'admin');
          return [admin!, ...others];
        });
      }
      setSelectedPatientId(admin.id);
      setCurrentPatientForAI(admin);
      setIsAuthenticated(true);
      setIsGuest(false);
      setIsFirstSession(false);
      setLoginError('');
      setCurrentPage('admin-users');
      addLog(`Connexion administrateur réussie : ${admin.firstName} ${admin.lastName}`);
      return true;
    }

    const user = patients.find(p => p.email.toLowerCase() === normalizedEmail && p.password === normalizedPassword && p.role !== 'admin');
    if (user) {
      setSelectedPatientId(user.id);
      setCurrentPatientForAI(user);
      setIsAuthenticated(true);
      setIsGuest(false);
      setIsFirstSession(false);
      setLoginError('');
      setCurrentPage('dashboard');
      addLog(`Connexion réussie : ${user.firstName} ${user.lastName}`);
      return true;
    }

    setLoginError('Email ou mot de passe invalide');
    return false;
  }, [patients, addLog, updatePatients]);

  // Connexion admin : uniquement via /admin
  const loginAdmin = useCallback((email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    if (normalizedEmail === ADMIN_EMAIL && normalizedPassword === ADMIN_PASSWORD) {
      let admin = patients.find(p => p.role === 'admin' && p.email.toLowerCase() === ADMIN_EMAIL);
      if (!admin) {
        admin = buildAdminUser();
        updatePatients(prev => {
          const others = prev.filter(p => p.role !== 'admin');
          return [admin!, ...others];
        });
      }
      setSelectedPatientId(admin.id);
      setCurrentPatientForAI(admin);
      setIsAuthenticated(true);
      setIsGuest(false);
      setIsFirstSession(false);
      setLoginError('');
      setCurrentPage('admin-users');
      addLog(`Connexion administrateur réussie : ${admin.firstName} ${admin.lastName}`);
      return true;
    }
    setLoginError('Accès administrateur invalide');
    return false;
  }, [patients, updatePatients, addLog]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setIsGuest(false);
    setCurrentPage('dashboard');
    setCurrentPatientForAI(buildFallbackUser());
    addLog('Déconnexion effectuée');
  }, [addLog]);

  const enterAsGuest = useCallback(() => {
    setIsGuest(true);
    setIsAuthenticated(false);
    setCurrentPatientForAI(buildFallbackUser());
    addLog('Accès visiteur activé');
  }, [addLog]);

  const register = useCallback((email: string, password: string, firstName: string, lastName: string, dateOfBirth: string, gender: 'M' | 'F', phone: string, role: UserRole, _specialty?: string, assignedDoctorId?: string, doctorCode?: string): { success: boolean; error?: string; patient?: Patient } => {
    if (patients.find(p => p.email.toLowerCase() === email.toLowerCase())) {
      setRegisterError('Un compte existe déjà avec cet email.');
      return { success: false, error: 'Un compte existe déjà avec cet email.' };
    }
    if (password.length < 6) {
      setRegisterError('Le mot de passe doit contenir au moins 6 caractères.');
      return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères.' };
    }
    if (role === 'medecin') {
      const foundCode = doctorCodes.find(c => c.code === doctorCode?.trim().toUpperCase() && !c.used);
      if (!doctorCode || !foundCode) {
        setRegisterError('Code médecin invalide ou déjà utilisé.');
        return { success: false, error: 'Code médecin invalide ou déjà utilisé. Contactez l\'administrateur.' };
      }
      const updatedCodes = doctorCodes.map(c => c.code === foundCode.code ? { ...c, used: true, usedBy: email } : c);
      setDoctorCodes(updatedCodes);
      saveDoctorCodes(updatedCodes);
    }

    const accessCode = generateAccessCode();
    const idPrefix = role === 'medecin' ? 'DR' : role === 'admin' ? 'AD' : 'PT';
    const doctor = assignedDoctorId ? patients.find(p => p.id === assignedDoctorId) : undefined;

    const newUser: Patient = {
      id: generateId(idPrefix),
      role,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      password,
      address: '',
      createdAt: new Date().toISOString(),
      symptoms: [],
      symptomsText: '',
      diagnosisResults: [],
      labResults: [],
      imagingResults: [],
      medications: [],
      appointments: [],
      confirmedDiagnosis: undefined,
      accessCode,
      sharedWith: [],
      treatmentNotes: [],
      messages: [],
      patientFiles: [],
      hasMedicalRecord: false,
      assignedDoctorId: assignedDoctorId || undefined,
      assignedDoctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : undefined,
      calcium: 9.5,
      pth: 40,
      phosphorus: 3.5,
      history: '',
      specialty: role === 'medecin' ? 'Endocrinologie' : undefined,
      busySlots: role === 'medecin' ? [] : undefined,
    };

    updatePatients(prev => [newUser, ...prev]);
    setSelectedPatientId(newUser.id);
    setCurrentPatientForAI(newUser);
    setIsAuthenticated(true);
    setIsGuest(false);
    setIsFirstSession(true);
    setRegisterError('');
    addLog(`Compte ${role} créé : ${firstName} ${lastName}`);
    return { success: true, patient: newUser };
  }, [patients, updatePatients, addLog]);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    updatePatients(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      const current = next.find(p => p.id === id);
      if (current) setCurrentPatientForAI(current);
      return next;
    });
  }, [updatePatients]);

  const addLabResult = useCallback((patientId: string, lab: Omit<LabResult, 'id'>) => {
    const labResult: LabResult = { ...lab, id: generateId() };
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, labResults: [...p.labResults, labResult] } : p));
    addLog(`Analyse biologique ajoutée pour patient ${patientId}`);
    return labResult;
  }, [updatePatients, addLog]);

  const addImagingResult = useCallback((patientId: string, img: Omit<ImagingResult, 'id'>) => {
    const imgResult: ImagingResult = { ...img, id: generateId() };
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, imagingResults: [...p.imagingResults, imgResult] } : p));
    addLog(`Examen d'imagerie ajouté pour patient ${patientId}`);
  }, [updatePatients, addLog]);

  const addMedication = useCallback((patientId: string, med: Omit<Medication, 'id'>) => {
    const medication: Medication = { ...med, id: generateId() };
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, medications: [...p.medications, medication] } : p));
    addLog(`Médicament ajouté : ${med.name}`);
  }, [updatePatients, addLog]);

  const addAppointment = useCallback((patientId: string, apt: Omit<Appointment, 'id'>) => {
    const appointment: Appointment = { ...apt, id: generateId() };
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, appointments: [...p.appointments, appointment] } : p));
    addLog(`Rendez-vous créé : ${apt.date} ${apt.time}`);
  }, [updatePatients, addLog]);

  const updateAppointment = useCallback((patientId: string, aptId: string, updates: Partial<Appointment>) => {
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, appointments: p.appointments.map(a => a.id === aptId ? { ...a, ...updates } : a) } : p));
  }, [updatePatients]);

  const isDoctorAvailable = useCallback((doctorId: string, date: string, time: string): boolean => {
    return !patients.filter(p => p.role === 'patient').some(p => p.appointments.some(a => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'annulé' && a.status !== 'effectué'));
  }, [patients]);

  const changeDoctor = useCallback((patientId: string, newDoctorId: string) => {
    const newDoc = patients.find(p => p.id === newDoctorId);
    if (!newDoc) return;
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, assignedDoctorId: newDoctorId, assignedDoctorName: `Dr. ${newDoc.firstName} ${newDoc.lastName}` } : p));
    addLog(`Médecin changé pour patient ${patientId}`);
  }, [patients, updatePatients, addLog]);

  const setConfirmedDiagnosis = useCallback((patientId: string, type: ParathyroidType) => {
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, confirmedDiagnosis: type } : p));
    addLog(`Diagnostic confirmé : ${type}`);
  }, [updatePatients, addLog]);

  const shareWithDoctor = useCallback((patientId: string, doctorEmail: string) => {
    updatePatients(prev => prev.map(p => p.id === patientId && !p.sharedWith.includes(doctorEmail) ? { ...p, sharedWith: [...p.sharedWith, doctorEmail] } : p));
    addLog(`Accès partagé avec : ${doctorEmail}`);
  }, [updatePatients, addLog]);

  const revokeAccess = useCallback((patientId: string, doctorEmail: string) => {
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, sharedWith: p.sharedWith.filter(e => e !== doctorEmail) } : p));
    addLog(`Accès révoqué pour : ${doctorEmail}`);
  }, [updatePatients, addLog]);

  const regenerateAccessCode = useCallback((patientId: string) => {
    const newCode = generateAccessCode();
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, accessCode: newCode } : p));
    addLog(`Code d'accès régénéré pour patient ${patientId}`);
    return newCode;
  }, [updatePatients, addLog]);

  const changePassword = useCallback((patientId: string, oldPassword: string, newPassword: string): boolean => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient || patient.password !== oldPassword) {
      addLog('Échec changement de mot de passe');
      return false;
    }
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, password: newPassword } : p));
    addLog('Mot de passe modifié');
    return true;
  }, [patients, updatePatients, addLog]);

  const lookupByAccessCode = useCallback((code: string): Patient | null => {
    const patient = patients.find(p => p.accessCode === code.toUpperCase() && p.role === 'patient' && p.hasMedicalRecord);
    if (patient) {
      addLog(`Dossier consulté via code : ${patient.firstName} ${patient.lastName}`);
      return patient;
    }
    addLog('Tentative d\'accès avec un code invalide');
    return null;
  }, [patients, addLog]);

  const sendMessage = useCallback((fromUser: Patient, toId: string, text: string, appointmentId?: string) => {
    const toUser = patients.find(p => p.id === toId);
    if (!toUser) return;
    const msg: AppMessage = {
      id: generateId(),
      fromId: fromUser.id,
      fromName: `${fromUser.firstName} ${fromUser.lastName}`,
      fromRole: fromUser.role,
      toId,
      toName: `${toUser.firstName} ${toUser.lastName}`,
      appointmentId,
      text,
      date: new Date().toISOString(),
      read: false,
    };
    updatePatients(prev => prev.map(p => p.id === toId ? { ...p, messages: [...p.messages, msg] } : p));
    addLog('Message envoyé');
  }, [patients, updatePatients, addLog]);

  const markMessageRead = useCallback((userId: string, msgId: string) => {
    updatePatients(prev => prev.map(p => p.id === userId ? { ...p, messages: p.messages.map(m => m.id === msgId ? { ...m, read: true } : m) } : p));
  }, [updatePatients]);

  const loadPatientIntoAI = useCallback((patient: Patient) => {
    setCurrentPatientForAI(patient);
    setSymptomsText(patient.symptomsText);
    setCalcium(String(patient.calcium));
    setPth(String(patient.pth));
    setPhosphorus(String(patient.phosphorus));
    setUploadedFile({ name: `archive_labo_${patient.id}.pdf`, size: '1.5 MB (OCR Validé)' });
    setCurrentPage('dashboard');
    setAnalysisState('idle');
    setResults(null);
    addLog(`Dossier chargé : ${patient.firstName} ${patient.lastName}`);
  }, [addLog]);

  const loadPreset = useCallback((type: 'urgence' | 'hyperparathyroidie' | 'hypoparathyroidie' | 'normal') => {
    if (type === 'urgence') {
      setSymptomsText('Patiente amenée aux urgences pour confusion mentale aiguë, vomissements incoercibles, déshydratation sévère et intenses douleurs osseuses généralisées.');
      setCalcium('13.8');
      setPth('195');
      setPhosphorus('1.8');
      setUploadedFile({ name: 'bilan_sanguin_urgence_mibi.pdf', size: '2.4 MB (OCR Validé)' });
      addLog('Préréglage : Urgence Critique');
    } else if (type === 'hyperparathyroidie') {
      setSymptomsText('Asthénie chronique invalidante, coliques néphrétiques bilatérales, douleurs osseuses diffuses.');
      setCalcium('11.2');
      setPth('94');
      setPhosphorus('2.2');
      setUploadedFile({ name: 'bilan_endocrinologie_standard.pdf', size: '1.9 MB (OCR Validé)' });
      addLog('Préréglage : Hyperparathyroïdie');
    } else if (type === 'hypoparathyroidie') {
      setSymptomsText('Paresthésies, crampes musculaires fréquentes, spasmes, antécédent de thyroïdectomie.');
      setCalcium('7.2');
      setPth('8');
      setPhosphorus('5.8');
      setUploadedFile({ name: 'bilan_post_thyroidectomie.pdf', size: '1.6 MB (OCR Validé)' });
      addLog('Préréglage : Hypoparathyroïdie');
    } else {
      setSymptomsText('Bilan de contrôle annuel standard. Patient asymptomatique.');
      setCalcium('9.5');
      setPth('40');
      setPhosphorus('3.4');
      setUploadedFile({ name: 'bilan_annuel_routine.jpg', size: '850 KB (OCR Validé)' });
      addLog('Préréglage : Bilan Normal');
    }
    setAnalysisState('idle');
    setResults(null);
  }, [addLog]);

  const resetForm = useCallback(() => {
    setSymptomsText('');
    setCalcium('');
    setPth('');
    setPhosphorus('');
    setUploadedFile(null);
    setAnalysisState('idle');
    setResults(null);
    addLog('Formulaire réinitialisé');
  }, [addLog]);

  const appendSymptomTag = useCallback((tag: string) => {
    setSymptomsText(prev => {
      const current = prev.trim();
      if (!current) return tag;
      if (!current.toLowerCase().includes(tag.toLowerCase())) return current + ', ' + tag.toLowerCase();
      return current;
    });
    addLog(`Tag inséré : ${tag}`);
  }, [addLog]);

  const restoreStandardNorms = useCallback(() => {
    setCustomNorms({ caMin: 8.5, caMax: 10.2, pthMin: 15, pthMax: 65, phosMin: 2.5, phosMax: 4.5, vitDMin: 30, vitDMax: 100 });
    addLog('Référentiels restaurés');
  }, [addLog]);

  const createMedicalRecord = useCallback((patientId: string, history: string): string => {
    const existingPatient = patients.find(p => p.id === patientId);
    if (!existingPatient) return '';
    if (existingPatient.hasMedicalRecord) {
      setCurrentPatientForAI(existingPatient);
      return existingPatient.accessCode;
    }
    const code = generateAccessCode();
    updatePatients(prev => {
      const updated = prev.map(p => p.id === patientId ? { ...p, hasMedicalRecord: true, accessCode: code, history } : p);
      const updatedPatient = updated.find(p => p.id === patientId);
      if (updatedPatient) setCurrentPatientForAI(updatedPatient);
      return updated;
    });
    addLog(`Dossier médical créé pour patient ${patientId}`);
    return code;
  }, [patients, updatePatients, addLog]);

  const addPatientFile = useCallback((patientId: string, file: Omit<PatientFile, 'id'>) => {
    const pf = { ...file, id: generateId() };
    updatePatients(prev => {
      const next = prev.map(p => p.id === patientId ? { ...p, patientFiles: [...p.patientFiles, pf] } : p);
      const updated = next.find(p => p.id === patientId);
      if (updated) setCurrentPatientForAI(updated);
      return next;
    });
    addLog(`Fichier ajouté : ${file.name}`);
  }, [updatePatients, addLog]);

  const removeMedication = useCallback((patientId: string, medId: string) => {
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, medications: p.medications.filter(m => m.id !== medId) } : p));
    addLog('Médicament supprimé');
  }, [updatePatients, addLog]);

  const updateMedication = useCallback((patientId: string, medId: string, updates: Partial<Medication>) => {
    updatePatients(prev => prev.map(p => p.id === patientId ? { ...p, medications: p.medications.map(m => m.id === medId ? { ...m, ...updates } : m) } : p));
    addLog('Médicament mis à jour');
  }, [updatePatients, addLog]);

  const exportFullState = useCallback(() => {
    const payload = { app_version: 'ParaThyroDetect React v4.0', export_date: new Date().toISOString(), active_abaques: customNorms, ai_parameters: aiConfig, registered_patients: patients, console_logs: consoleLogs };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 4));
    const anchor = document.createElement('a');
    anchor.href = dataStr;
    anchor.download = 'parathyrodetect_export_v4.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    addLog('Export JSON');
  }, [customNorms, aiConfig, patients, consoleLogs, addLog]);

  return {
    currentPage, setCurrentPage,
    patients, setPatients: updatePatients, selectedPatientId, setSelectedPatientId, currentPatientForAI, setCurrentPatientForAI,
    isAuthenticated, isGuest, isFirstSession, loginError, registerError, login, loginAdmin, logout, enterAsGuest, register,
    doctorCodes, adminAddDoctorCode, adminDeleteDoctorCode, adminDeleteUser, adminUpdateUser,
    updatePatient, addLabResult, addImagingResult, addMedication, addAppointment, updateAppointment, setConfirmedDiagnosis,
    shareWithDoctor, revokeAccess, regenerateAccessCode, changePassword, lookupByAccessCode, sendMessage, markMessageRead,
    customNorms, setCustomNorms, aiConfig, setAiConfig, restoreStandardNorms,
    consoleLogs, addLog, clearLogs,
    symptomsText, setSymptomsText, calcium, setCalcium, pth, setPth, phosphorus, setPhosphorus, uploadedFile, setUploadedFile,
    analysisState, setAnalysisState, loadingProgress, setLoadingProgress, loadingStepText, setLoadingStepText, results, setResults, showJsonModal, setShowJsonModal,
    loadPatientIntoAI, loadPreset, resetForm, appendSymptomTag, createMedicalRecord, addPatientFile, removeMedication, updateMedication, isDoctorAvailable, changeDoctor, exportFullState,
  };
}
