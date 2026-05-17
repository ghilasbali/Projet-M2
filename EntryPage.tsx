import { useState } from 'react';
import {
  Shield, Lock, Mail, Eye, EyeOff, AlertTriangle, LogIn,
  UserPlus, Activity, Stethoscope, Key, Sparkles, Check,
  ArrowRight, Globe, User, Calendar, Phone, Copy, Fingerprint
} from 'lucide-react';
import { Patient } from '../types';

interface EntryPageProps {
  loginError: string;
  registerError: string;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, firstName: string, lastName: string, dob: string, gender: 'M' | 'F', phone: string, role: 'patient' | 'medecin', specialty?: string, assignedDoctorId?: string, doctorCode?: string) => { success: boolean; error?: string; patient?: Patient };
  enterAsGuest: () => void;
  patients: Patient[];
}

export function EntryPage({ loginError, registerError, login, register, enterAsGuest, patients }: EntryPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPwd, setShowPwd] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd] = useState('');

  // Register
  const [regForm, setRegForm] = useState({
    firstName: '', lastName: '', email: '', password: '', passwordConfirm: '',
    dateOfBirth: '', gender: 'M' as 'M' | 'F', phone: '',
    role: 'patient' as 'patient' | 'medecin', specialty: 'Endocrinologie',
    assignedDoctorId: '', doctorCode: ''
  });
  const availableDoctors = patients.filter(p => p.role === 'medecin');
  const [regError, setRegError] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginEmail, loginPwd);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (regForm.password.length < 6) { setRegError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (regForm.password !== regForm.passwordConfirm) { setRegError('Les mots de passe ne correspondent pas.'); return; }
    if (regForm.role === 'patient' && !regForm.assignedDoctorId && availableDoctors.length > 0) {
      setRegError('Veuillez choisir votre médecin endocrinologue.');
      return;
    }
    const result = register(
      regForm.email, regForm.password, regForm.firstName, regForm.lastName,
      regForm.dateOfBirth, regForm.gender, regForm.phone, regForm.role,
      regForm.role === 'medecin' ? 'Endocrinologie' : undefined,
      regForm.role === 'patient' ? regForm.assignedDoctorId : undefined,
      regForm.role === 'medecin' ? regForm.doctorCode : undefined
    );
    if (result.success && result.patient) {
      setCreatedPatient(result.patient);
    } else {
      setRegError(result.error || registerError || 'Erreur lors de la création.');
    }
  };

  const copyCode = () => {
    if (createdPatient) {
      navigator.clipboard.writeText(createdPatient.accessCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // ─── POST-INSCRIPTION : Afficher le code d'accès ───
  if (createdPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-6 text-white text-center">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Check size={30} />
              </div>
              <h2 className="font-bold text-xl">Compte créé avec succès ! 🎉</h2>
              <p className="text-emerald-100 text-sm mt-1">Votre code d'accès au dossier médical a été généré automatiquement</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#1a56db] text-white flex items-center justify-center font-bold shrink-0">
                  {createdPatient.firstName.charAt(0)}{createdPatient.lastName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{createdPatient.firstName} {createdPatient.lastName}</p>
                  <p className="text-xs text-slate-400">{createdPatient.email}</p>
                </div>
              </div>

              {/* Code d'accès au dossier */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1a56db]/20 rounded-full blur-3xl -translate-y-8 translate-x-8"></div>
                <div className="relative z-10">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Key size={10} /> Code d'accès au dossier médical
                    <span className="ml-1 text-amber-400 font-bold flex items-center gap-0.5"><Sparkles size={9} /> auto-généré</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="font-mono text-3xl font-black tracking-[0.4em] text-amber-300 flex-1">{createdPatient.accessCode}</p>
                    <button onClick={copyCode} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer shrink-0">
                      {copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-400" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-amber-800">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Conservez ce code précieusement !</p>
                  <p className="mt-0.5">Ce code est unique et <strong>seul vous le voyez</strong>. Communiquez-le à votre médecin pour qu'il puisse consulter votre dossier médical. Il est aussi visible dans l'onglet <strong>Dossiers Patients</strong>.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-700 flex items-center gap-1"><Lock size={12} /> 🔐 Mot de passe</p>
                  <p className="text-slate-500 mt-0.5">Choisi par vous — pour ouvrir votre compte</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="font-bold text-blue-800 flex items-center gap-1"><Key size={12} /> 🔑 Code d'accès</p>
                  <p className="text-blue-700 mt-0.5">Auto-généré — pour accéder au dossier médical</p>
                </div>
              </div>

              <button onClick={() => setCreatedPatient(null)}
                className="w-full py-3.5 bg-[#1a56db] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm">
                <ArrowRight size={16} /> Accéder à mon espace
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PAGE D'ENTRÉE PRINCIPALE ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a56db] text-white p-2.5 rounded-lg shadow-inner flex items-center gap-1">
            <Activity size={20} /><Stethoscope size={18} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              ParaThyroDetect <span className="bg-blue-100 text-[#1a56db] text-xs font-semibold px-2 py-0.5 rounded-md">IA v4.0</span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Détection Intelligente des Pathologies Parathyroïdiennes</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ═══ COLONNE GAUCHE : Formulaire ═══ */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Tabs Login / Register */}
            <div className="flex border-b border-slate-200">
              <button onClick={() => setMode('login')}
                className={`flex-1 px-4 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
                  mode === 'login' ? 'text-[#1a56db] border-[#1a56db] bg-blue-50/50' : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}><LogIn size={16} /> Se connecter</button>
              <button onClick={() => setMode('register')}
                className={`flex-1 px-4 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
                  mode === 'register' ? 'text-[#1a56db] border-[#1a56db] bg-blue-50/50' : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}><UserPlus size={16} /> Créer un compte</button>
            </div>

            {/* ─── CONNEXION ─── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="p-6 space-y-5 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Mail size={14} className="text-[#1a56db]" /> Email</label>
                  <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="votre@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1a56db] focus:border-[#1a56db] outline-none text-sm bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Lock size={14} className="text-[#1a56db]" /> Mot de passe</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} required value={loginPwd} onChange={e => setLoginPwd(e.target.value)} placeholder="Votre mot de passe"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1a56db] focus:border-[#1a56db] outline-none text-sm bg-slate-50 pr-10" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {loginError && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200"><AlertTriangle size={14} />{loginError}</div>
                )}
                <button type="submit" className="w-full bg-[#1a56db] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md btn-medical-shine transition-all cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                  <LogIn size={18} /> Se connecter
                </button>
                <div className="border-t border-slate-100 pt-4 text-center">
                  <p className="text-[11px] text-slate-400">Pas encore de compte ? <button type="button" onClick={() => setMode('register')} className="text-[#1a56db] font-bold hover:underline cursor-pointer">Créer un compte</button></p>
                </div>
              </form>
            )}

            {/* ─── INSCRIPTION ─── */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="p-6 space-y-4 animate-fadeIn">
                {/* SÉLECTION DU RÔLE */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-2">Je suis *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setRegForm(f => ({ ...f, role: 'patient' }))}
                      className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${regForm.role === 'patient' ? 'border-[#1a56db] bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🧑‍⚕️</span>
                        <span className={`font-bold text-sm ${regForm.role === 'patient' ? 'text-[#1a56db]' : 'text-slate-700'}`}>Patient</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Je souhaite consulter et suivre mon dossier médical</p>
                    </button>
                    <button type="button" onClick={() => setRegForm(f => ({ ...f, role: 'medecin' }))}
                      className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${regForm.role === 'medecin' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">👨‍⚕️</span>
                        <span className={`font-bold text-sm ${regForm.role === 'medecin' ? 'text-emerald-700' : 'text-slate-700'}`}>Médecin</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Je souhaite accéder aux dossiers de mes patients</p>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1"><User size={11} /> {regForm.role === 'medecin' ? 'Prénom (Dr.)' : 'Prénom'} *</label>
                    <input type="text" required value={regForm.firstName} onChange={e => setRegForm(f => ({ ...f, firstName: e.target.value }))} placeholder={regForm.role === 'medecin' ? "Sophie" : "Marie"}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#1a56db]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nom *</label>
                    <input type="text" required value={regForm.lastName} onChange={e => setRegForm(f => ({ ...f, lastName: e.target.value }))} placeholder="DURAND"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#1a56db]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1"><Mail size={11} /> Email *</label>
                  <input type="email" required value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#1a56db]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1"><Lock size={11} /> Mot de passe * <span className="text-slate-400 font-normal">(min. 6)</span></label>
                    <div className="relative">
                      <input type={showRegPwd ? 'text' : 'password'} required minLength={6} value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} placeholder="Choisissez"
                        className="w-full p-2.5 pr-9 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#1a56db]" />
                      <button type="button" onClick={() => setShowRegPwd(!showRegPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"><Eye size={13} /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Confirmer *</label>
                    <input type={showRegPwd ? 'text' : 'password'} required minLength={6} value={regForm.passwordConfirm} onChange={e => setRegForm(f => ({ ...f, passwordConfirm: e.target.value }))} placeholder="Retaper"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#1a56db]" />
                  </div>
                </div>
                {regForm.role === 'medecin' && (
                  <>
                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 flex items-center gap-3">
                      <Stethoscope size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-800">Spécialité : Endocrinologie</p>
                        <p className="text-[10px] text-emerald-600">Réservé aux endocrinologues autorisés par l'administration.</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Key size={11} className="text-amber-600" /> Code d'inscription médecin *
                      </label>
                      <input type="text" required value={regForm.doctorCode} onChange={e => setRegForm(f => ({ ...f, doctorCode: e.target.value.toUpperCase() }))}
                        placeholder="Ex: MED-2026-A1"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono tracking-wider uppercase outline-none focus:border-emerald-500" />
                      <p className="text-[10px] text-slate-400 mt-1">Ce code unique est fourni par l'administrateur. Sans ce code, la création du compte médecin est refusée.</p>
                    </div>
                  </>
                )}
                {regForm.role === 'patient' && availableDoctors.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Stethoscope size={11} className="text-emerald-600" /> Choisissez votre médecin endocrinologue *
                    </label>
                    <select required value={regForm.assignedDoctorId} onChange={e => setRegForm(f => ({ ...f, assignedDoctorId: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#1a56db]">
                      <option value="">— Sélectionner un médecin —</option>
                      {availableDoctors.map(d => (
                        <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} — {d.specialty || 'Endocrinologie'}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">Votre dossier médical sera accessible par le médecin choisi.</p>
                  </div>
                )}
                {regForm.role === 'patient' && availableDoctors.length === 0 && (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-[11px] text-amber-700 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p>Aucun médecin endocrinologue n'est encore inscrit. Vous pourrez en choisir un plus tard depuis votre dossier.</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1"><Calendar size={11} /> Naissance *</label>
                    <input type="date" required value={regForm.dateOfBirth} onChange={e => setRegForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#1a56db]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sexe *</label>
                    <select value={regForm.gender} onChange={e => setRegForm(f => ({ ...f, gender: e.target.value as 'M' | 'F' }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#1a56db]">
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1"><Phone size={11} /> Tél.</label>
                    <input type="tel" value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} placeholder="06..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#1a56db]" />
                  </div>
                </div>

                {regError && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200"><AlertTriangle size={12} />{regError}</div>
                )}

                {regForm.role === 'patient' && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-[11px] text-blue-700 flex items-start gap-2">
                    <Sparkles size={14} className="text-[#1a56db] shrink-0 mt-0.5" />
                    <p>Un <strong>code d'accès unique au dossier médical</strong> sera généré automatiquement. Seul vous le verrez, et vous le communiquerez à votre médecin.</p>
                  </div>
                )}
                {regForm.role === 'medecin' && (
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-[11px] text-emerald-700 flex items-start gap-2">
                    <Stethoscope size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <p>En tant que médecin, vous pourrez <strong>accéder aux dossiers</strong> de vos patients via leur code d'accès, <strong>prescrire des traitements</strong> et <strong>planifier des rendez-vous</strong>.</p>
                  </div>
                )}

                <button type="submit" className={`w-full font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wide ${regForm.role === 'medecin' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-[#1a56db] hover:bg-blue-700 text-white'}`}>
                  <UserPlus size={18} /> Créer mon compte {regForm.role === 'medecin' ? 'Médecin' : 'Patient'}
                </button>
              </form>
            )}
          </div>

          {/* ═══ COLONNE DROITE : Infos + Visiter ═══ */}
          <div className="space-y-5">
            {/* Visiter sans compte */}
            <button onClick={enterAsGuest}
              className="w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:border-[#1a56db] hover:shadow-xl transition-all cursor-pointer text-left group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-blue-50 group-hover:to-blue-100 transition-all">
                  <Globe size={28} className="text-slate-400 group-hover:text-[#1a56db] transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    Visiter l'application
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-[#1a56db] group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Explorez l'interface sans créer de compte — accès en lecture seule au Dashboard IA, aux abaques et aux informations.</p>
                </div>
              </div>
            </button>

            {/* Deux systèmes */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Shield size={18} className="text-[#1a56db]" /> Connexion et Sécurité
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <Lock size={18} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">🔐 Mot de passe du compte</p>
                    <p className="mt-0.5"><strong>Choisi par vous</strong> à l'inscription. Utilisé avec votre email pour ouvrir votre compte (patient ou médecin).</p>
                  </div>
                </div>
                <hr className="border-slate-200" />
                <div className="flex items-start gap-3">
                  <Key size={18} className="text-[#1a56db] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-blue-800">🔑 Code d'accès au dossier médical</p>
                    <p className="mt-0.5"><strong>Généré automatiquement</strong> à la création du compte. Seul le patient le voit. Il le communique à son médecin pour que celui-ci puisse consulter son dossier.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2"><Fingerprint size={16} className="text-emerald-600" /> Ce que fait l'application</h3>
              <div className="space-y-2 text-xs text-slate-600">
                {[
                  "Analyse IA des symptômes parathyroïdiens",
                  "Classification multi-classes (HPT 1°/2°/3°, Hypo, Pseudo)",
                  "Protocoles de traitement personnalisés",
                  "Suivi des rendez-vous et ajustement des doses",
                  "Dossier médical sécurisé partageable",
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-emerald-500">✓</span>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200 bg-white/50">
        © 2025 ParaThyroDetect — Détection Intelligente par IA Supervisée
      </footer>
    </div>
  );
}
