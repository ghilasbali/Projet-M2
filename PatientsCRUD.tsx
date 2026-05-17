import { useState } from 'react';
import {
  Users, Shield, Copy, Check, Key, AlertTriangle, Sparkles,
  FolderHeart, Stethoscope, FlaskConical, ScanLine, Pill,
  CalendarClock, FileText, FolderSearch, History, Activity
} from 'lucide-react';
import { Patient, AppPage } from '../types';

interface PatientsCRUDProps {
  patients: Patient[];
  currentUser?: Patient;
  isAuthenticated?: boolean;
  isFirstSession?: boolean;
  createMedicalRecord: (patientId: string, history: string) => string;
  lookupByAccessCode: (code: string) => Patient | null;
  addLog: (text: string) => void;
  setCurrentPage: (page: AppPage) => void;
}

export function PatientsCRUD({
  patients, currentUser, isAuthenticated, isFirstSession,
  createMedicalRecord, lookupByAccessCode, addLog
}: PatientsCRUDProps) {
  const isDoctor = isAuthenticated && currentUser?.role === 'medecin';
  const isPatient = isAuthenticated && currentUser?.role === 'patient';
  // hasRecord used implicitly via me?.hasMedicalRecord in render

  // Create record form
  const [historyInput, setHistoryInput] = useState('');
  const [justCreatedCode, setJustCreatedCode] = useState<string | null>(null);

  // Lookup
  const [lookupCode, setLookupCode] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [viewedPatient, setViewedPatient] = useState<Patient | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text); setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const code = createMedicalRecord(currentUser.id, historyInput.trim());
    setJustCreatedCode(code);
    setHistoryInput('');
    addLog(`Dossier médical créé — Code: ${code}`);
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault(); setLookupError(''); setViewedPatient(null);
    const p = lookupByAccessCode(lookupCode.trim());
    if (!p) { 
      setLookupError('Code invalide. Aucun dossier trouvé.'); 
      return; 
    }
    // Patient can only access their OWN dossier
    if (isPatient && currentUser && p.id !== currentUser.id) {
      setLookupError('Vous ne pouvez accéder qu\'à votre propre dossier médical.');
      return;
    }
    // Doctor can only access their assigned patients' dossiers
    if (isDoctor && currentUser && p.assignedDoctorId !== currentUser.id) {
      setLookupError(`Ce patient n'est pas assigné à vous. Seul son médecin traitant (${p.assignedDoctorName || 'non assigné'}) peut accéder à ce dossier.`);
      return;
    }
    setViewedPatient(p);
  };

  // Refresh viewed patient
  const refreshed = viewedPatient ? patients.find(p => p.id === viewedPatient.id) || viewedPatient : null;
  // Refresh current user
  const me = currentUser ? patients.find(p => p.id === currentUser.id) || currentUser : null;

  // Build history timeline
  const buildTimeline = (p: Patient) => {
    const items: { date: string; time: string; icon: string; title: string; detail: string; color: string }[] = [];
    p.labResults.forEach(l => items.push({ date: l.date, time: l.time || '—', icon: '🧪', title: 'Analyse biologique', detail: `Ca: ${l.calcium} • PTH: ${l.pth} • P: ${l.phosphore}`, color: 'border-l-blue-400' }));
    p.imagingResults.forEach(i => items.push({ date: i.date, time: i.time || '—', icon: '📷', title: `Imagerie — ${i.type}`, detail: i.conclusion || i.findings, color: 'border-l-purple-400' }));
    p.appointments.forEach(a => items.push({ date: a.date, time: a.time, icon: a.status === 'effectué' ? '✅' : a.status === 'annulé' ? '❌' : '📅', title: `RDV ${a.type} (${a.status})`, detail: `${a.doctorName || ''}${a.notes ? ' — ' + a.notes : ''}`, color: a.status === 'effectué' ? 'border-l-emerald-400' : a.status === 'annulé' ? 'border-l-red-400' : 'border-l-blue-400' }));
    p.medications.forEach(m => items.push({ date: m.prescribedDate?.split('T')[0] || m.startDate, time: m.prescribedDate ? new Date(m.prescribedDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—', icon: '💊', title: `Traitement — ${m.name}`, detail: `${m.dosage} • ${m.frequency}${m.prescribedByName ? ' — ' + m.prescribedByName : ''}${m.active === false ? ' [ARRÊTÉ]' : ''}`, color: m.active !== false ? 'border-l-green-400' : 'border-l-slate-400' }));
    (p.patientFiles || []).forEach(f => items.push({ date: f.date.split('T')[0], time: new Date(f.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), icon: f.type === 'analyse' ? '🧪' : f.type === 'radio' ? '📷' : '📄', title: `Fichier — ${f.category || f.type}`, detail: f.name, color: 'border-l-amber-400' }));
    return items.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
  };

  // Render a patient record view (used by both patient self-view and lookup)
  const renderRecord = (p: Patient) => {
    const timeline = buildTimeline(p);
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1a56db] text-white flex items-center justify-center font-bold text-lg">{p.firstName.charAt(0)}{p.lastName.charAt(0)}</div>
            <div>
              <h3 className="font-bold text-slate-900">{p.firstName} {p.lastName}</h3>
              <p className="text-xs text-slate-500">{p.dateOfBirth ? `${new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()} ans` : '?'} / {p.gender === 'M' ? 'Homme' : 'Femme'} • {p.history || '—'}</p>
              {p.assignedDoctorName && <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">👨‍⚕️ Médecin: {p.assignedDoctorName}</p>}
            </div>
          </div>
          {viewedPatient && <button onClick={() => setViewedPatient(null)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer text-xs">Fermer</button>}
        </div>

        {/* Code d'accès */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#1a56db]/20 rounded-full blur-2xl -translate-y-6 translate-x-6"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1"><Key size={10} /> Code d'accès au dossier <span className="text-amber-400 font-bold ml-1 flex items-center gap-0.5"><Sparkles size={8} /> auto-généré</span></p>
              <p className="font-mono text-xl font-black tracking-[0.3em] text-amber-300">{p.accessCode}</p>
            </div>
            <button onClick={() => copyToClipboard(p.accessCode, 'code')} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer flex items-center gap-1.5">
              {copiedField === 'code' ? <><Check size={14} className="text-emerald-400" /><span className="text-[10px] text-emerald-400">Copié</span></> : <><Copy size={14} className="text-slate-400" /><span className="text-[10px] text-slate-400">Copier</span></>}
            </button>
          </div>
        </div>

        {/* Bio values */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: 'Calcium', v: `${p.calcium} mg/dL`, c: p.calcium > 10.2 ? 'text-red-600 bg-red-50 border-red-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { l: 'PTH', v: `${p.pth} pg/mL`, c: p.pth > 65 ? 'text-red-600 bg-red-50 border-red-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { l: 'Phosphore', v: `${p.phosphorus} mg/dL`, c: p.phosphorus < 2.5 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          ].map((b, i) => <div key={i} className={`rounded-xl p-3 text-center border ${b.c}`}><p className="text-lg font-black font-mono">{b.v}</p><p className="text-[10px] font-medium mt-0.5">{b.l}</p></div>)}
        </div>

        {p.confirmedDiagnosis && p.confirmedDiagnosis !== 'normal' && (
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
            <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5"><Activity size={14} /> Diagnostic: {p.confirmedDiagnosis.replace(/_/g, ' ')}</p>
          </div>
        )}

        {p.symptomsText && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Symptômes</p>
            <p className="text-xs text-slate-700">{p.symptomsText}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { l: 'Analyses', c: p.labResults.length, cl: 'text-[#1a56db] bg-blue-50', ic: <FlaskConical size={12} /> },
            { l: 'Imageries', c: p.imagingResults.length, cl: 'text-purple-600 bg-purple-50', ic: <ScanLine size={12} /> },
            { l: 'Fichiers', c: (p.patientFiles || []).length, cl: 'text-amber-600 bg-amber-50', ic: <FileText size={12} /> },
            { l: 'Traitements', c: p.medications.length, cl: 'text-green-600 bg-green-50', ic: <Pill size={12} /> },
            { l: 'RDV', c: p.appointments.length, cl: 'text-orange-600 bg-orange-50', ic: <CalendarClock size={12} /> },
          ].map((s, i) => <div key={i} className={`rounded-lg p-2 text-center ${s.cl}`}><p className="text-lg font-black">{s.c}</p><p className="text-[8px] font-medium flex items-center justify-center gap-0.5">{s.ic}{s.l}</p></div>)}
        </div>

        {/* Historique chronologique */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <History size={14} className="text-[#1a56db]" />
            <span className="font-bold text-xs text-slate-700">Historique complet — par date et heure</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold ml-auto">{timeline.length}</span>
          </div>
          {timeline.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400">Aucun événement enregistré.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {timeline.map((item, i) => (
                <div key={i} className={`px-4 py-3 flex items-start gap-3 border-l-4 ${item.color}`}>
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 text-xs">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{new Date(item.date).toLocaleDateString('fr-FR')} {item.time}</p>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 truncate">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════
  //  PATIENT VIEW
  // ═══════════════════════════════════════════
  if (isPatient && me) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <FolderHeart size={20} className="text-[#1a56db]" /> Mon Dossier Médical
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {me.hasMedicalRecord ? 'Votre dossier médical personnel. Partagez le code d\'accès avec votre médecin.' : 'Créez votre dossier médical unique. Un code d\'accès sera généré automatiquement.'}
          </p>
        </div>

        {/* Code just created — only on first session (register) */}
        {justCreatedCode && isFirstSession && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5 animate-fadeIn text-center">
            <Check size={32} className="text-emerald-600 mx-auto mb-2" />
            <h3 className="font-bold text-emerald-900 text-lg mb-1">Dossier médical créé ! 🎉</h3>
            <p className="text-xs text-emerald-700 mb-3">Votre code d'accès unique a été généré automatiquement :</p>
            <div className="bg-slate-900 rounded-xl p-4 inline-block">
              <p className="font-mono text-3xl font-black tracking-[0.4em] text-amber-300">{justCreatedCode}</p>
            </div>
            <p className="text-[11px] text-emerald-600 mt-3">Communiquez ce code à votre médecin pour qu'il puisse accéder à votre dossier.</p>
            <button onClick={() => setJustCreatedCode(null)} className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs cursor-pointer">Voir mon dossier</button>
          </div>
        )}

        {/* Not yet created */}
        {!me.hasMedicalRecord && !justCreatedCode && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
            <div className="text-center mb-5">
              <FolderHeart size={40} className="text-[#1a56db] mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 text-lg">Créer mon dossier médical</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Vous n'avez pas encore de dossier médical. Créez-le maintenant. Un <strong>code d'accès unique</strong> sera généré automatiquement par le système.
                <strong> Vous ne pouvez créer qu'un seul dossier.</strong>
              </p>
            </div>
            <form onSubmit={handleCreateRecord} className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Antécédents médicaux (optionnel)</label>
                <textarea value={historyInput} onChange={e => setHistoryInput(e.target.value)} rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs resize-none outline-none focus:border-[#1a56db]"
                  placeholder="Ex: Lithiase rénale récidivante, ostéoporose..." />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-[11px] text-blue-700 flex items-start gap-2">
                <Sparkles size={14} className="text-[#1a56db] shrink-0 mt-0.5" />
                <p>Un <strong>code d'accès unique</strong> sera généré automatiquement. Seul vous et votre médecin choisi pourrez accéder à ce dossier.</p>
              </div>
              <button type="submit" className="w-full py-3 bg-[#1a56db] hover:bg-blue-700 text-white font-bold rounded-xl text-sm cursor-pointer flex items-center justify-center gap-2">
                <Shield size={16} /> Créer mon dossier médical
              </button>
            </form>
          </div>
        )}

        {/* ═══ PREMIÈRE SESSION (création de compte) : afficher le dossier directement ═══ */}
        {me.hasMedicalRecord && isFirstSession && !justCreatedCode && (
          <>
            {renderRecord(me)}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
              <p className="text-xs text-blue-700">
                <strong>💡 Astuce :</strong> Lors de vos prochaines connexions, vous pourrez accéder à votre dossier en saisissant votre code d'accès 
                <span className="font-mono font-black text-[#1a56db] mx-1">{me.accessCode}</span>
                . Conservez-le précieusement et communiquez-le à votre médecin.
              </p>
            </div>
          </>
        )}

        {/* ═══ CONNEXIONS SUIVANTES : accès par code uniquement ═══ */}
        {me.hasMedicalRecord && !isFirstSession && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Key size={16} className="text-amber-600" /> Accéder à mon dossier avec mon code
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-bold border border-emerald-200 flex items-center gap-1">
                  <Sparkles size={10} /> Auto-généré
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-[11px] text-slate-500 mb-3">
                  Saisissez votre code d'accès pour consulter votre dossier médical. 
                  Seuls <strong>vous</strong> et <strong>votre médecin ({me.assignedDoctorName || 'non assigné'})</strong> pouvez y accéder.
                </p>
                <form onSubmit={(e) => { e.preventDefault(); handleLookup(e); }} className="flex gap-2">
                  <input type="text" required value={lookupCode} onChange={e => setLookupCode(e.target.value.toUpperCase())} maxLength={6}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-mono tracking-[0.3em] text-center uppercase outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-[#1a56db] bg-white" placeholder="XXXXXX" />
                  <button type="submit" className="px-4 py-2.5 bg-[#1a56db] hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0">
                    <FolderSearch size={14} /> Accéder
                  </button>
                </form>
                {lookupError && <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-[11px] border border-red-200"><AlertTriangle size={12} />{lookupError}</div>}
              </div>
            </div>

            {/* Show record only after successful code entry */}
            {viewedPatient && viewedPatient.id === me.id && (
              <>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs border border-emerald-200">
                  <Check size={14} /> <strong>Accès vérifié</strong> — Votre dossier médical est affiché ci-dessous.
                </div>
                {renderRecord(viewedPatient)}
              </>
            )}
            {viewedPatient && viewedPatient.id !== me.id && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                <AlertTriangle size={14} /> Ce code ne correspond pas à votre dossier. Vous ne pouvez accéder qu'à votre propre dossier médical.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  DOCTOR / GUEST VIEW — lookup by code
  // ═══════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <Users size={20} className="text-[#1a56db]" /> {isDoctor ? 'Dossiers de mes Patients' : 'Dossiers Patients'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isDoctor ? 'Saisissez le code d\'accès d\'un patient pour consulter son dossier complet.' : 'Consultez les dossiers patients via leur code d\'accès.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          {/* Doctor: list my patients with codes */}
          {isDoctor && currentUser && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5"><Stethoscope size={14} /> Mes patients</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                  {patients.filter(p => p.role === 'patient' && p.assignedDoctorId === currentUser.id && p.hasMedicalRecord).length}
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {patients.filter(p => p.role === 'patient' && p.assignedDoctorId === currentUser.id && p.hasMedicalRecord).length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">Aucun patient avec dossier.</p>
                ) : patients.filter(p => p.role === 'patient' && p.assignedDoctorId === currentUser.id && p.hasMedicalRecord).map(p => (
                  <div key={p.id} className="p-3 border-b border-slate-50 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1a56db] text-white flex items-center justify-center font-bold text-[9px]">{p.firstName.charAt(0)}{p.lastName.charAt(0)}</div>
                      <div><p className="font-bold text-slate-800">{p.firstName} {p.lastName}</p><p className="text-[10px] text-slate-400">{p.history || '—'}</p></div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 tracking-wider">{p.accessCode}</span>
                      <button onClick={() => copyToClipboard(p.accessCode, p.id)} className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer">
                        {copiedField === p.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lookup */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-2">
              <Key size={16} className="text-amber-300" />
              <span className="font-bold text-sm">Accéder à un dossier</span>
            </div>
            <form onSubmit={handleLookup} className="p-4 space-y-3">
              <input type="text" required value={lookupCode} onChange={e => setLookupCode(e.target.value.toUpperCase())} maxLength={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg font-mono tracking-[0.3em] text-center uppercase outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-[#1a56db] bg-slate-50" placeholder="XXXXXX" />
              <button type="submit" className="w-full py-2.5 bg-[#1a56db] hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1.5">
                <FolderSearch size={14} /> Ouvrir le dossier
              </button>
              {lookupError && <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-[11px] border border-red-200"><AlertTriangle size={12} />{lookupError}</div>}
            </form>
          </div>
        </div>

        <div className="lg:col-span-8">
          {refreshed ? renderRecord(refreshed) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
              <FolderSearch className="text-slate-300 mx-auto mb-4" size={48} />
              <h3 className="font-bold text-slate-500">Aucun dossier ouvert</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {isDoctor ? 'Copiez le code d\'un patient depuis la liste, puis saisissez-le pour ouvrir son dossier.' : 'Saisissez un code d\'accès pour consulter un dossier.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
