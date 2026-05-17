import { useState } from 'react';
import {
  CalendarClock, Plus, Clock, CheckCircle2, XCircle, Calendar,
  Stethoscope, FlaskConical, ScanLine, ClipboardList, Zap,
  Send, MessageSquare, Mail, AlertTriangle, Edit3, ArrowRight
} from 'lucide-react';
import { Patient, Appointment } from '../types';
import { treatmentProtocols } from '../data/treatments';

interface AppointmentsPanelProps {
  patient: Patient;
  patients: Patient[];
  addAppointment: (patientId: string, apt: Omit<Appointment, 'id'>) => void;
  updateAppointment: (patientId: string, aptId: string, updates: Partial<Appointment>) => void;
  sendMessage: (from: Patient, toId: string, text: string, aptId?: string) => void;
  isDoctorAvailable: (doctorId: string, date: string, time: string) => boolean;
  changeDoctor: (patientId: string, newDoctorId: string) => void;
}

export function AppointmentsPanel({ patient, patients, addAppointment, updateAppointment, sendMessage, isDoctorAvailable, changeDoctor }: AppointmentsPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', time: '09:00', type: 'suivi' as Appointment['type'], notes: '', targetPatientId: '', doctorId: '' });
  const [availabilityError, setAvailabilityError] = useState('');

  // Change RDV request (patient)
  const [changeAptId, setChangeAptId] = useState<string | null>(null);
  const [changeDate, setChangeDate] = useState('');
  const [changeTime, setChangeTime] = useState('');
  const [changeReason, setChangeReason] = useState('');

  // Free text message
  const [freeMsg, setFreeMsg] = useState('');
  const [freeMsgTo, setFreeMsgTo] = useState('');

  // Change doctor
  const [showChangeDoctor, setShowChangeDoctor] = useState(false);
  const [newDoctorId, setNewDoctorId] = useState('');

  const isDoctor = patient.role === 'medecin';
  const patientsList = patients.filter(p => p.role === 'patient');
  const doctorsList = patients.filter(p => p.role === 'medecin');
  const now = new Date();
  const protocol = patient.confirmedDiagnosis ? treatmentProtocols.find(p => p.type === patient.confirmedDiagnosis) : null;

  const minDate = new Date().toISOString().split('T')[0];
  const maxDateObj = new Date();
  maxDateObj.setFullYear(maxDateObj.getFullYear() + 1);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  const isDateWithinAllowedRange = (date: string) => {
    if (!date) return false;
    return date >= minDate && date <= maxDate;
  };

  const isDateTimeWithinAllowedRange = (date: string, time: string) => {
    if (!date || !time) return false;
    if (!isDateWithinAllowedRange(date)) return false;
    const selected = new Date(`${date}T${time}`);
    const current = new Date();
    const max = new Date();
    max.setFullYear(max.getFullYear() + 1);
    return selected >= current && selected <= max;
  };

  const canMarkAsCompleted = (apt: Appointment & { _pid?: string }) => {
    const dt = new Date(`${apt.date}T${apt.time}`);
    return apt.status === 'planifié' && apt.doctorAccepted && apt.patientAccepted && dt <= new Date();
  };

  // ─── HANDLERS ───

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAvailabilityError('');
    const targetId = isDoctor ? form.targetPatientId : patient.id;
    if (!targetId) return;
    const docId = isDoctor ? patient.id : form.doctorId || patient.assignedDoctorId;
    if (!docId) { setAvailabilityError('Veuillez choisir un médecin.'); return; }
    if (!isDateWithinAllowedRange(form.date)) {
      setAvailabilityError(`La date doit être comprise entre ${new Date(minDate).toLocaleDateString('fr-FR')} et ${new Date(maxDate).toLocaleDateString('fr-FR')}.`);
      return;
    }
    if (!isDateTimeWithinAllowedRange(form.date, form.time)) {
      setAvailabilityError('L\'heure choisie doit être postérieure à l\'heure actuelle pour la date sélectionnée.');
      return;
    }
    if (!isDoctorAvailable(docId, form.date, form.time)) {
      const doc = patients.find(p => p.id === docId);
      setAvailabilityError(`Dr. ${doc?.firstName || ''} ${doc?.lastName || ''} n'est pas disponible à ce créneau.`);
      return;
    }
    const targetP = patients.find(p => p.id === targetId);
    const doc = patients.find(p => p.id === docId);
    addAppointment(targetId, {
      date: form.date, time: form.time, type: form.type, notes: form.notes,
      status: 'en_attente', createdAt: new Date().toISOString(),
      doctorId: docId, doctorName: doc ? `Dr. ${doc.firstName} ${doc.lastName}` : undefined,
      patientId: targetId, patientName: targetP ? `${targetP.firstName} ${targetP.lastName}` : undefined,
      doctorAccepted: isDoctor,
      patientAccepted: !isDoctor,
      requestedBy: isDoctor ? 'medecin' : 'patient',
    });
    // Auto message for request
    if (!isDoctor && docId) {
      sendMessage(patient, docId, `📅 Nouvelle demande de rendez-vous\nSouhaité : ${new Date(form.date).toLocaleDateString('fr-FR')} à ${form.time}\nType : ${form.type}${form.notes ? `\nNotes : ${form.notes}` : ''}`);
    }
    setShowForm(false);
    setForm({ date: '', time: '09:00', type: 'suivi', notes: '', targetPatientId: '', doctorId: '' });
  };

  // Patient requests a change → sends date/time + message to doctor, sets RDV to en_attente
  const handleRequestChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeAptId || !changeDate || !changeTime) return;
    if (!isDateWithinAllowedRange(changeDate)) {
      setAvailabilityError(`La nouvelle date doit être comprise entre ${new Date(minDate).toLocaleDateString('fr-FR')} et ${new Date(maxDate).toLocaleDateString('fr-FR')}.`);
      return;
    }
    if (!isDateTimeWithinAllowedRange(changeDate, changeTime)) {
      setAvailabilityError('La nouvelle heure doit être postérieure à maintenant pour la date sélectionnée.');
      return;
    }
    const apt = patient.appointments.find(a => a.id === changeAptId);
    if (!apt || !apt.doctorId) return;

    const oldDate = new Date(apt.date).toLocaleDateString('fr-FR');
    const autoMsg = `📅 Demande de changement de RDV\n` +
      `Ancien : ${oldDate} à ${apt.time}\n` +
      `Nouveau souhaité : ${new Date(changeDate).toLocaleDateString('fr-FR')} à ${changeTime}\n` +
      `${changeReason ? `Motif : ${changeReason}` : ''}`;

    sendMessage(patient, apt.doctorId, autoMsg, changeAptId);
    updateAppointment(patient.id, changeAptId, {
      status: 'en_attente',
      patientAccepted: true,
      doctorAccepted: false,
      requestedBy: 'patient',
      requestedDate: changeDate,
      requestedTime: changeTime,
      requestReason: changeReason,
      notes: `${apt.notes ? apt.notes + ' | ' : ''}Changement demandé → ${changeDate} ${changeTime}`,
    });

    setChangeAptId(null); setChangeDate(''); setChangeTime(''); setChangeReason(''); setAvailabilityError('');
  };

  // handleFreeMsg is handled inline in the form JSX

  const handleChangeDoctor = () => {
    if (!newDoctorId) return;
    changeDoctor(patient.id, newDoctorId);
    setShowChangeDoctor(false); setNewDoctorId('');
  };

  const generateFollowUps = () => {
    if (!protocol) return;
    const start = new Date();
    protocol.followUpWeeks.forEach(w => {
      const d = new Date(start); d.setDate(d.getDate() + w * 7);
      addAppointment(patient.id, {
        date: d.toISOString().split('T')[0], time: '10:00',
        type: w <= 4 ? 'suivi' : 'analyse', status: 'planifié',
        notes: `Suivi semaine ${w}`, createdAt: new Date().toISOString(),
      });
    });
  };

  // ─── DATA ───

  const myAppointments = isDoctor
    ? patients.flatMap(p => p.appointments.filter(a => a.doctorId === patient.id).map(a => ({ ...a, _pid: p.id, _pname: `${p.firstName} ${p.lastName}` })))
    : patient.appointments.map(a => ({ ...a, _pid: patient.id, _pname: `${patient.firstName} ${patient.lastName}` }));

  const sorted = [...myAppointments].sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());
  const upcoming = sorted.filter(a => a.status === 'planifié' && new Date(a.date) >= now);
  const pending = sorted.filter(a => a.status === 'en_attente');
  const past = sorted.filter(a => (a.status === 'effectué' || a.status === 'annulé') || (a.status === 'planifié' && new Date(a.date) < now));

  const myMessages = patient.messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const typeIcons: Record<string, React.ReactNode> = { consultation: <Stethoscope size={14} />, analyse: <FlaskConical size={14} />, imagerie: <ScanLine size={14} />, suivi: <ClipboardList size={14} /> };
  const typeLabels: Record<string, string> = { consultation: 'Consultation', analyse: 'Analyse', imagerie: 'Imagerie', suivi: 'Suivi' };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2"><CalendarClock size={20} className="text-orange-600" /> {isDoctor ? 'Rendez-vous Patients' : 'Mes Rendez-vous'}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{isDoctor ? 'Gérez les RDV, acceptez ou refusez les demandes de changement.' : 'Consultez, demandez un changement de date/heure ou envoyez un message à votre médecin.'}</p>
        </div>
        <div className="flex gap-2">
          {!isDoctor && protocol && patient.appointments.length === 0 && (
            <button onClick={generateFollowUps} className="flex items-center gap-2 px-3 py-2 bg-[#1a56db] text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer"><Zap size={14} /> Générer calendrier</button>
          )}
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer"><Plus size={14} /> {isDoctor ? 'Nouveau RDV' : 'Demander un RDV'}</button>
        </div>
      </div>

      {/* Patient: mon médecin + changer */}
      {!isDoctor && patient.assignedDoctorId && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">👨‍⚕️</div>
            <div>
              <p className="text-xs font-bold text-slate-800">Mon médecin : <span className="text-emerald-700">{patient.assignedDoctorName || '—'}</span></p>
              <p className="text-[10px] text-slate-400">Seul ce médecin peut accéder à votre dossier</p>
            </div>
          </div>
          {!showChangeDoctor
            ? <button onClick={() => setShowChangeDoctor(true)} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer">Changer de médecin</button>
            : <div className="flex items-center gap-2">
                <select value={newDoctorId} onChange={e => setNewDoctorId(e.target.value)} className="p-1.5 border border-slate-300 rounded-lg text-xs min-w-[180px]">
                  <option value="">— Nouveau médecin —</option>
                  {doctorsList.filter(d => d.id !== patient.assignedDoctorId).map(d => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                </select>
                <button onClick={handleChangeDoctor} disabled={!newDoctorId} className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50">OK</button>
                <button onClick={() => { setShowChangeDoctor(false); setNewDoctorId(''); }} className="px-2.5 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer">×</button>
              </div>
          }
        </div>
      )}

      {/* Form nouveau RDV */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5 animate-fadeIn">
          <h3 className="font-bold text-slate-800 text-sm mb-4">{isDoctor ? 'Planifier un RDV' : 'Demander un rendez-vous'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isDoctor && (
              <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Patient *</label>
                <select required value={form.targetPatientId} onChange={e => setForm(f => ({ ...f, targetPatientId: e.target.value }))} className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"><option value="">— Patient —</option>{patientsList.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</select>
              </div>
            )}
            {!isDoctor && (
              <div><label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1"><Stethoscope size={11} className="text-emerald-600" /> Médecin *</label>
                <select required value={form.doctorId || patient.assignedDoctorId || ''} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"><option value="">— Médecin —</option>{doctorsList.map(d => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}{d.id === patient.assignedDoctorId ? ' (mon médecin)' : ''}</option>)}</select>
              </div>
            )}
            <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-600 border border-slate-200">
              📌 Date autorisée : à partir d'aujourd'hui (<strong>{new Date(minDate).toLocaleDateString('fr-FR')}</strong>) et jusqu'au <strong>{new Date(maxDate).toLocaleDateString('fr-FR')}</strong> maximum.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Date *</label><input type="date" required min={minDate} max={maxDate} value={form.date} onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setAvailabilityError(''); }} className="w-full p-2.5 border border-slate-300 rounded-lg text-xs" /></div>
              <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Heure *</label><input type="time" required value={form.time} onChange={e => { setForm(f => ({ ...f, time: e.target.value })); setAvailabilityError(''); }} className="w-full p-2.5 border border-slate-300 rounded-lg text-xs" /></div>
              <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Appointment['type'] }))} className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"><option value="suivi">Suivi</option><option value="consultation">Consultation</option><option value="analyse">Analyse</option><option value="imagerie">Imagerie</option></select></div>
            </div>
            {!isDoctor && form.date && form.time && (form.doctorId || patient.assignedDoctorId) && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] border ${isDoctorAvailable(form.doctorId || patient.assignedDoctorId || '', form.date, form.time) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {isDoctorAvailable(form.doctorId || patient.assignedDoctorId || '', form.date, form.time) ? <><CheckCircle2 size={12} /> Disponible</> : <><XCircle size={12} /> Non disponible</>}
              </div>
            )}
            {availabilityError && <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-[11px] border border-red-200"><AlertTriangle size={12} />{availabilityError}</div>}
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-lg text-xs cursor-pointer">Planifier</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* ═══ EN ATTENTE DE VALIDATION (patient et médecin voient) ═══ */}
      {pending.length > 0 && (
        <div className="bg-amber-50 rounded-xl border-2 border-amber-300 overflow-hidden">
          <div className="px-5 py-3 bg-amber-100 border-b border-amber-300"><h3 className="font-bold text-amber-900 text-sm flex items-center gap-2"><Clock size={14} className="text-amber-600" /> En attente de validation ({pending.length})</h3></div>
          <div className="p-4 space-y-3">
            {pending.map(apt => (
              <div key={apt.id} className="bg-white rounded-lg p-4 border-l-4 border-amber-400">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">{typeIcons[apt.type]}</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{typeLabels[apt.type]} <span className="text-[9px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-bold ml-1">EN ATTENTE</span></p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={10} /> {new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })} à <strong>{apt.time}</strong></p>
                      {isDoctor && <p className="text-[10px] text-[#1a56db] font-semibold mt-0.5">Patient: {apt._pname}</p>}
                      {!isDoctor && apt.doctorName && <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Médecin: {apt.doctorName}</p>}
                      {apt.notes && <p className="text-[10px] text-amber-700 mt-0.5 italic">{apt.notes}</p>}
                      {apt.requestedDate && apt.requestedTime && (
                        <p className="text-[10px] text-[#1a56db] font-semibold mt-0.5">Demande : {new Date(apt.requestedDate).toLocaleDateString('fr-FR')} à {apt.requestedTime}</p>
                      )}
                    </div>
                  </div>
                  {/* Médecin : accepter ou refuser */}
                  {isDoctor && (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => updateAppointment(apt._pid, apt.id, apt.requestedDate && apt.requestedTime
                          ? { status: 'planifié', doctorAccepted: true, patientAccepted: true, date: apt.requestedDate, time: apt.requestedTime, requestedDate: undefined, requestedTime: undefined, requestReason: undefined }
                          : { status: 'planifié', doctorAccepted: true, patientAccepted: true }
                        )}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} /> {apt.requestedDate ? 'Valider le changement' : 'Valider'}
                      </button>
                      <button
                        onClick={() => updateAppointment(apt._pid, apt.id, apt.requestedDate
                          ? { status: 'planifié', requestedDate: undefined, requestedTime: undefined, requestReason: undefined, notes: apt.notes?.replace(/\|?\s*Changement demandé.*$/, '').trim() || '' }
                          : { status: 'annulé' }
                        )}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1"
                      >
                        <XCircle size={12} /> {apt.requestedDate ? 'Refuser le changement' : 'Refuser'}
                      </button>
                    </div>
                  )}
                  {!isDoctor && (
                    apt.requestedBy === 'medecin'
                      ? <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => updateAppointment(apt._pid, apt.id, { status: 'planifié', patientAccepted: true, doctorAccepted: true })} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1"><CheckCircle2 size={12} /> Accepter</button>
                          <button onClick={() => updateAppointment(apt._pid, apt.id, { status: 'annulé' })} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1"><XCircle size={12} /> Refuser</button>
                        </div>
                      : <span className="text-[10px] text-amber-600 font-bold bg-amber-100 px-2 py-1 rounded-lg">⏳ En attente de votre médecin</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ PROCHAINS RDV VALIDÉS ═══ */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-200"><h3 className="font-bold text-emerald-800 text-sm flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> Rendez-vous validés ({upcoming.length})</h3></div>
          <div className="p-4 space-y-3">
            {upcoming.map(apt => (
              <div key={apt.id} className="bg-slate-50 rounded-lg p-4 border-l-4 border-emerald-400">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1a56db] flex items-center justify-center">{typeIcons[apt.type]}</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{typeLabels[apt.type]} <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold ml-1">✓ VALIDÉ</span></p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={10} /> {new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à <strong>{apt.time}</strong></p>
                      {isDoctor && <p className="text-[10px] text-[#1a56db] font-semibold mt-0.5">Patient: {apt._pname}</p>}
                      {!isDoctor && apt.doctorName && <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Médecin: {apt.doctorName}</p>}
                      {apt.notes && <p className="text-[10px] text-slate-400 mt-0.5 italic">{apt.notes}</p>}
                      <p className="text-[9px] text-slate-400 mt-0.5">Créé le {new Date(apt.createdAt).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {isDoctor && (
                      <>
                        <button
                          onClick={() => updateAppointment(apt._pid, apt.id, { status: 'effectué' })}
                          disabled={!canMarkAsCompleted(apt)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title={!canMarkAsCompleted(apt) ? 'Impossible : le RDV doit être validé par les deux parties et l\'heure doit être passée' : 'Marquer comme effectué'}
                        >
                          ✓ Effectué
                        </button>
                        <button onClick={() => updateAppointment(apt._pid, apt.id, { status: 'annulé' })} className="px-2.5 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold cursor-pointer">✕ Annuler</button>
                      </>
                    )}
                    {!isDoctor && apt.doctorId && (
                      <button onClick={() => { setChangeAptId(apt.id); setChangeDate(''); setChangeTime(''); setChangeReason(''); setAvailabilityError(''); }}
                        className="px-2.5 py-1 bg-blue-50 text-[#1a56db] rounded text-[10px] font-bold cursor-pointer flex items-center gap-1"><Edit3 size={10} /> Demander changement</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ FORMULAIRE DEMANDE DE CHANGEMENT (patient) ═══ */}
      {changeAptId && !isDoctor && (
        <div className="bg-blue-50 rounded-xl border-2 border-blue-300 p-5 animate-fadeIn">
          <h3 className="font-bold text-sm text-[#1a56db] mb-1 flex items-center gap-2"><Edit3 size={16} /> Demander un changement de RDV</h3>
          <p className="text-[11px] text-slate-500 mb-4">Choisissez la nouvelle date et heure souhaitée. Un message sera envoyé <strong>automatiquement</strong> à votre médecin.</p>
          <form onSubmit={handleRequestChange} className="space-y-3">
            <div className="bg-blue-100 rounded-lg p-3 text-[11px] text-blue-800 border border-blue-200">
              📌 Nouvelle date autorisée : à partir d'aujourd'hui (<strong>{new Date(minDate).toLocaleDateString('fr-FR')}</strong>) et jusqu'au <strong>{new Date(maxDate).toLocaleDateString('fr-FR')}</strong> maximum.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Nouvelle date *</label><input type="date" required min={minDate} max={maxDate} value={changeDate} onChange={e => { setChangeDate(e.target.value); setAvailabilityError(''); }} className="w-full p-2.5 border border-blue-300 rounded-lg text-xs" /></div>
              <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Nouvelle heure *</label><input type="time" required value={changeTime} onChange={e => { setChangeTime(e.target.value); setAvailabilityError(''); }} className="w-full p-2.5 border border-blue-300 rounded-lg text-xs" /></div>
              <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Motif (optionnel)</label><input type="text" value={changeReason} onChange={e => setChangeReason(e.target.value)} placeholder="Raison du changement..." className="w-full p-2.5 border border-blue-300 rounded-lg text-xs" /></div>
            </div>
            <div className="bg-blue-100 rounded-lg p-3 text-[11px] text-blue-800 flex items-start gap-2">
              <Send size={14} className="text-[#1a56db] shrink-0 mt-0.5" />
              <p>Un message automatique sera envoyé à votre médecin avec les détails. Le RDV passera en statut <strong>« En attente »</strong> jusqu'à validation par votre médecin.</p>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2.5 bg-[#1a56db] text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1"><Send size={12} /> Envoyer la demande</button>
              <button type="button" onClick={() => setChangeAptId(null)} className="px-5 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* ═══ ENVOYER UN MESSAGE LIBRE (patient → médecin) ═══ */}
      {!isDoctor && patient.assignedDoctorId && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="font-bold text-xs text-slate-700 mb-2 flex items-center gap-2"><MessageSquare size={14} className="text-[#1a56db]" /> Envoyer un message à mon médecin</h3>
          <form onSubmit={(e) => { e.preventDefault(); if (freeMsg.trim()) { sendMessage(patient, patient.assignedDoctorId!, freeMsg.trim()); setFreeMsg(''); } }} className="flex gap-2">
            <input type="text" value={freeMsg} onChange={e => setFreeMsg(e.target.value)} placeholder="Demande de changement de traitement, question, etc."
              className="flex-1 p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#1a56db]" />
            <button type="submit" disabled={!freeMsg.trim()} className="px-4 py-2.5 bg-[#1a56db] text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1 disabled:opacity-50"><Send size={12} /> Envoyer</button>
          </form>
        </div>
      )}

      {/* ═══ MESSAGES ═══ */}
      {myMessages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200"><h3 className="font-bold text-amber-800 text-sm flex items-center gap-2"><Mail size={14} /> Messages ({myMessages.length})</h3></div>
          <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
            {myMessages.slice(0, 15).map(m => (
              <div key={m.id} className={`p-3 rounded-lg border text-xs ${m.read ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-300'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">{m.fromName} <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${m.fromRole === 'medecin' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-[#1a56db]'}`}>{m.fromRole === 'medecin' ? '👨‍⚕️' : '🧑‍⚕️'}</span></span>
                  <span className="text-[10px] text-slate-400">{new Date(m.date).toLocaleString('fr-FR')}</span>
                </div>
                <p className="text-slate-700 whitespace-pre-line">{m.text}</p>
                {!m.read && <span className="text-[9px] text-amber-600 font-bold">● Nouveau</span>}
                {/* Doctor can reply inline */}
                {isDoctor && (
                  <button onClick={() => { setFreeMsgTo(m.fromId); setFreeMsg(''); }} className="mt-1 text-[10px] text-[#1a56db] font-bold hover:underline cursor-pointer">↩ Répondre</button>
                )}
              </div>
            ))}
          </div>
          {/* Doctor reply form */}
          {isDoctor && freeMsgTo && (
            <form onSubmit={(e) => { e.preventDefault(); if (freeMsg.trim()) { sendMessage(patient, freeMsgTo, freeMsg.trim()); setFreeMsg(''); setFreeMsgTo(''); } }} className="p-3 border-t border-slate-200 bg-blue-50 flex gap-2">
              <input type="text" required value={freeMsg} onChange={e => setFreeMsg(e.target.value)} placeholder="Votre réponse..." className="flex-1 p-2 border border-blue-300 rounded-lg text-xs outline-none" />
              <button type="submit" className="p-2 bg-[#1a56db] text-white rounded-lg cursor-pointer"><Send size={12} /></button>
              <button type="button" onClick={() => setFreeMsgTo('')} className="p-2 bg-slate-200 text-slate-600 rounded-lg cursor-pointer"><ArrowRight size={12} /></button>
            </form>
          )}
        </div>
      )}

      {/* ═══ HISTORIQUE ═══ */}
      {past.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200"><h3 className="font-bold text-slate-400 text-sm">Historique ({past.length})</h3></div>
          <div className="p-4 space-y-2">
            {past.slice(-8).reverse().map(apt => (
              <div key={apt.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-2.5 opacity-70 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-500">{typeIcons[apt.type]}</div>
                  <span className="text-slate-600">{typeLabels[apt.type]} — {new Date(apt.date).toLocaleDateString('fr-FR')} {apt.time}</span>
                  {isDoctor && <span className="text-[10px] text-[#1a56db]">({apt._pname})</span>}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${apt.status === 'effectué' ? 'bg-emerald-50 text-emerald-600' : apt.status === 'annulé' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#1a56db]'}`}>{apt.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {myAppointments.length === 0 && !showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <CalendarClock className="text-slate-300 mx-auto mb-4" size={48} />
          <p className="text-slate-400 mb-4">Aucun rendez-vous</p>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold cursor-pointer">{isDoctor ? 'Planifier un RDV' : 'Demander un RDV'}</button>
        </div>
      )}
    </div>
  );
}
