import { useState } from 'react';
import {
  Stethoscope, Users, AlertTriangle, Pill, CalendarClock, Activity,
  MessageSquare, Send, X, TrendingUp, TrendingDown, Clock,
  Bell, Heart, BarChart3, ShieldAlert, CheckCircle2, FileText
} from 'lucide-react';
import { Patient } from '../types';

interface DoctorDashboardProps {
  doctor: Patient;
  patients: Patient[];
  updateAppointment: (patientId: string, aptId: string, updates: Record<string, unknown>) => void;
  sendMessage: (from: Patient, toId: string, text: string, aptId?: string) => void;
  addLog: (text: string) => void;
}

export function DoctorDashboard({ doctor, patients, updateAppointment, sendMessage, addLog }: DoctorDashboardProps) {
  const [replyText, setReplyText] = useState('');
  const [replyToId, setReplyToId] = useState('');

  const myPatients = patients.filter(p => p.role === 'patient' && p.assignedDoctorId === doctor.id && p.hasMedicalRecord);
  const allMessages = doctor.messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const unreadCount = allMessages.filter(m => !m.read).length;

  const allRdv = patients.flatMap(p =>
    p.appointments.filter(a => a.doctorId === doctor.id).map(a => ({ ...a, _pid: p.id, _pname: `${p.firstName} ${p.lastName}` }))
  ).sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRdv = allRdv.filter(r => r.date === todayStr && r.status === 'planifié');
  const upcomingRdv = allRdv.filter(r => r.status === 'planifié' && r.date >= todayStr);
  const pendingRdv = allRdv.filter(r => r.status === 'en_attente');
  const completedRdv = allRdv.filter(r => r.status === 'effectué');

  // Patients à risque
  const patientsAtRisk = myPatients.filter(p => p.calcium > 10.2 || p.pth > 65);
  const criticalPatients = myPatients.filter(p => p.calcium >= 12.0);

  const totalActiveMeds = myPatients.reduce((sum, p) => sum + p.medications.filter(m => m.active !== false).length, 0);

  const canMarkAsCompleted = (apt: { date: string; time: string; status: string; doctorAccepted?: boolean; patientAccepted?: boolean }) => {
    const dt = new Date(`${apt.date}T${apt.time}`);
    return apt.status === 'planifié' && apt.doctorAccepted && apt.patientAccepted && dt <= new Date();
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !replyToId) return;
    sendMessage(doctor, replyToId, replyText.trim());
    setReplyText(''); setReplyToId('');
    addLog(`Réponse envoyée`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">

      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl p-5 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center"><Stethoscope size={28} /></div>
            <div>
              <h2 className="font-bold text-xl">Bonjour, Dr. {doctor.firstName} {doctor.lastName}</h2>
              <p className="text-emerald-100 text-sm">{doctor.specialty || 'Endocrinologie'} — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {criticalPatients.length > 0 && (
              <div className="bg-red-500/30 border border-red-400/50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <ShieldAlert size={14} /> {criticalPatients.length} patient(s) critique(s)
              </div>
            )}
            {unreadCount > 0 && (
              <div className="bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <Bell size={14} /> {unreadCount} message(s) non lu(s)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ CARTES STATISTIQUES ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Mes patients', value: myPatients.length, icon: <Users size={18} />, color: 'text-[#1a56db] bg-blue-50 border-blue-200' },
          { label: 'RDV aujourd\'hui', value: todayRdv.length, icon: <CalendarClock size={18} />, color: 'text-orange-600 bg-orange-50 border-orange-200' },
          { label: 'RDV à venir', value: upcomingRdv.length, icon: <Clock size={18} />, color: 'text-purple-600 bg-purple-50 border-purple-200' },
          { label: 'Consultations faites', value: completedRdv.length, icon: <CheckCircle2 size={18} />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { label: 'En attente', value: pendingRdv.length, icon: <Clock size={18} />, color: pendingRdv.length > 0 ? 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse' : 'text-slate-500 bg-slate-50 border-slate-200' },
          { label: 'Traitements actifs', value: totalActiveMeds, icon: <Pill size={18} />, color: 'text-green-600 bg-green-50 border-green-200' },
          { label: 'Patients à risque', value: patientsAtRisk.length, icon: <AlertTriangle size={18} />, color: patientsAtRisk.length > 0 ? 'text-red-600 bg-red-50 border-red-200' : 'text-slate-500 bg-slate-50 border-slate-200' },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl p-3 border ${s.color} flex flex-col items-center justify-center text-center`}>
            <div className="mb-1">{s.icon}</div>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[9px] font-semibold uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ═══ COLONNE GAUCHE ═══ */}
        <div className="lg:col-span-5 space-y-5">

          {/* Alertes critiques */}
          {criticalPatients.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 animate-fadeIn">
              <h3 className="font-bold text-sm text-red-900 flex items-center gap-2 mb-3"><ShieldAlert size={16} className="text-red-600" /> Alertes Critiques</h3>
              <div className="space-y-2">
                {criticalPatients.map(p => (
                  <div key={p.id} className="bg-white rounded-lg p-3 border border-red-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">{p.firstName.charAt(0)}{p.lastName.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{p.firstName} {p.lastName}</p>
                        <p className="text-[10px] text-red-600 font-semibold">Ca: {p.calcium} mg/dL — HYPERCALCÉMIE SÉVÈRE</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-bold animate-pulse">URGENT</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patients à risque */}
          {patientsAtRisk.length > 0 && criticalPatients.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2 mb-3"><AlertTriangle size={16} className="text-amber-600" /> Patients à Surveiller</h3>
              <div className="space-y-2">
                {patientsAtRisk.map(p => (
                  <div key={p.id} className="bg-white rounded-lg p-3 border border-amber-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[9px]">{p.firstName.charAt(0)}{p.lastName.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-slate-800">{p.firstName} {p.lastName}</p>
                        <div className="flex gap-2 text-[10px]">
                          {p.calcium > 10.2 && <span className="text-red-600 font-semibold flex items-center gap-0.5"><TrendingUp size={9} />Ca: {p.calcium}</span>}
                          {p.pth > 65 && <span className="text-red-600 font-semibold flex items-center gap-0.5"><TrendingUp size={9} />PTH: {p.pth}</span>}
                          {p.phosphorus < 2.5 && <span className="text-amber-600 font-semibold flex items-center gap-0.5"><TrendingDown size={9} />P: {p.phosphorus}</span>}
                        </div>
                      </div>
                    </div>
                    {p.confirmedDiagnosis && p.confirmedDiagnosis !== 'normal' && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">{p.confirmedDiagnosis.replace(/_/g, ' ').substring(0, 20)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agenda du jour */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-orange-50 border-b border-orange-200 flex items-center justify-between">
              <span className="font-bold text-xs text-orange-800 flex items-center gap-1.5"><CalendarClock size={14} /> Agenda du jour</span>
              <span className="text-[10px] bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full font-bold">{todayRdv.length}</span>
            </div>
            {todayRdv.length === 0 ? (
              <p className="p-5 text-center text-xs text-slate-400">Aucun rendez-vous aujourd'hui.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {todayRdv.map(r => (
                  <div key={r.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">{r.time}</div>
                      <div>
                        <p className="font-bold text-slate-800">{r._pname}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{r.type}{r.notes ? ` — ${r.notes}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateAppointment(r._pid, r.id, { status: 'effectué' })}
                        disabled={!canMarkAsCompleted(r)}
                        className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold cursor-pointer hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={!canMarkAsCompleted(r) ? 'Le RDV doit être validé par le médecin et le patient, et l\'heure doit être passée.' : 'Marquer comme effectué'}
                      >
                        ✓ Fait
                      </button>
                      <button onClick={() => updateAppointment(r._pid, r.id, { status: 'annulé' })} className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold cursor-pointer hover:bg-red-100">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prochains RDV (hors aujourd'hui) */}
          {upcomingRdv.filter(r => r.date !== todayStr).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5"><Clock size={14} className="text-purple-500" /> Prochains RDV</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-40 overflow-y-auto">
                {upcomingRdv.filter(r => r.date !== todayStr).slice(0, 6).map(r => (
                  <div key={r.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono w-20 shrink-0">{new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} {r.time}</span>
                      <span className="font-semibold text-slate-700">{r._pname}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded capitalize">{r.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ COLONNE DROITE ═══ */}
        <div className="lg:col-span-7 space-y-5">

          {/* Vue d'ensemble des patients */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
              <span className="font-bold text-xs text-[#1a56db] flex items-center gap-1.5"><BarChart3 size={14} /> Vue d'ensemble — Mes Patients</span>
              <span className="text-[10px] bg-blue-200 text-[#1a56db] px-1.5 py-0.5 rounded-full font-bold">{myPatients.length}</span>
            </div>
            {myPatients.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">Aucun patient ne vous a encore choisi comme médecin.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                      <th className="px-3 py-2 text-left font-bold">Patient</th>
                      <th className="px-2 py-2 text-center font-bold">Ca²⁺</th>
                      <th className="px-2 py-2 text-center font-bold">PTH</th>
                      <th className="px-2 py-2 text-center font-bold">PO₄</th>
                      <th className="px-2 py-2 text-center font-bold">Diagnostic</th>
                      <th className="px-2 py-2 text-center font-bold"><Pill size={10} className="inline" /></th>
                      <th className="px-2 py-2 text-center font-bold"><CalendarClock size={10} className="inline" /></th>
                      <th className="px-2 py-2 text-center font-bold"><FileText size={10} className="inline" /></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {myPatients.map(p => {
                      const isHighCa = p.calcium > 10.2;
                      const isHighPTH = p.pth > 65;
                      const isLowP = p.phosphorus < 2.5;
                      return (
                        <tr key={p.id} className={`hover:bg-slate-50 ${p.calcium >= 12 ? 'bg-red-50' : ''}`}>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-[9px] ${p.calcium >= 12 ? 'bg-red-600' : 'bg-[#1a56db]'}`}>{p.firstName.charAt(0)}{p.lastName.charAt(0)}</div>
                              <div>
                                <p className="font-bold text-slate-800">{p.firstName} {p.lastName}</p>
                                <p className="text-[10px] text-slate-400">{p.history || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className={`px-2 py-2.5 text-center font-mono font-bold ${isHighCa ? 'text-red-600' : 'text-emerald-600'}`}>{p.calcium}</td>
                          <td className={`px-2 py-2.5 text-center font-mono font-bold ${isHighPTH ? 'text-red-600' : 'text-emerald-600'}`}>{p.pth}</td>
                          <td className={`px-2 py-2.5 text-center font-mono font-bold ${isLowP ? 'text-amber-600' : 'text-emerald-600'}`}>{p.phosphorus}</td>
                          <td className="px-2 py-2.5 text-center">
                            {p.confirmedDiagnosis && p.confirmedDiagnosis !== 'normal' 
                              ? <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">{p.confirmedDiagnosis.replace(/_/g, ' ').substring(0, 15)}</span>
                              : <span className="text-[9px] text-slate-400">—</span>}
                          </td>
                          <td className="px-2 py-2.5 text-center font-bold">{p.medications.filter(m => m.active !== false).length}</td>
                          <td className="px-2 py-2.5 text-center font-bold">{p.appointments.filter(a => a.status === 'planifié').length}</td>
                          <td className="px-2 py-2.5 text-center font-bold">{(p.patientFiles || []).length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Messages des patients */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <span className="font-bold text-xs text-amber-800 flex items-center gap-1.5"><MessageSquare size={14} /> Messages des patients</span>
              {unreadCount > 0 && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">{unreadCount} nouveau(x)</span>}
            </div>
            {allMessages.length === 0 ? (
              <p className="p-5 text-center text-xs text-slate-400">Aucun message reçu.</p>
            ) : (
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {allMessages.slice(0, 10).map(m => (
                  <div key={m.id} className={`p-3 text-xs ${m.read ? '' : 'bg-amber-50/50'}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        {!m.read && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>}
                        {m.fromName}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{new Date(m.date).toLocaleString('fr-FR')}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{m.text}</p>
                    <button onClick={() => { setReplyToId(m.fromId); setReplyText(''); }}
                      className="mt-1 text-[10px] text-[#1a56db] font-bold hover:underline cursor-pointer">↩ Répondre</button>
                  </div>
                ))}
              </div>
            )}
            {replyToId && (
              <form onSubmit={handleReply} className="p-3 border-t border-slate-200 bg-blue-50 flex gap-2">
                <input type="text" required value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Votre réponse..."
                  className="flex-1 p-2 border border-blue-300 rounded-lg text-xs outline-none focus:border-[#1a56db]" />
                <button type="submit" className="p-2 bg-[#1a56db] text-white rounded-lg cursor-pointer"><Send size={12} /></button>
                <button type="button" onClick={() => setReplyToId('')} className="p-2 bg-slate-200 text-slate-600 rounded-lg cursor-pointer"><X size={12} /></button>
              </form>
            )}
          </div>

          {/* Résumé diagnostics */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Activity size={14} className="text-[#1a56db]" /> Répartition des diagnostics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(() => {
                const diagCounts: Record<string, number> = {};
                myPatients.forEach(p => {
                  const d = p.confirmedDiagnosis || 'non_diagnostiqué';
                  diagCounts[d] = (diagCounts[d] || 0) + 1;
                });
                const colors: Record<string, string> = {
                  'hyperparathyroïdie_primaire': 'bg-red-50 border-red-200 text-red-700',
                  'hyperparathyroïdie_secondaire': 'bg-orange-50 border-orange-200 text-orange-700',
                  'hyperparathyroïdie_tertiaire': 'bg-purple-50 border-purple-200 text-purple-700',
                  'hypoparathyroïdie': 'bg-blue-50 border-blue-200 text-blue-700',
                  'pseudohypoparathyroïdie': 'bg-green-50 border-green-200 text-green-700',
                  'normal': 'bg-emerald-50 border-emerald-200 text-emerald-700',
                  'non_diagnostiqué': 'bg-slate-50 border-slate-200 text-slate-500',
                };
                return Object.entries(diagCounts).map(([diag, count]) => (
                  <div key={diag} className={`rounded-lg p-2.5 border text-center ${colors[diag] || 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <p className="text-xl font-black">{count}</p>
                    <p className="text-[9px] font-semibold capitalize">{diag.replace(/_/g, ' ').replace('non diagnostiqué', 'En attente')}</p>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5"><Heart size={14} className="text-red-400" /> Activité récente</span>
            </div>
            <div className="p-4 space-y-2 max-h-40 overflow-y-auto">
              {(() => {
                const activities: { date: string; text: string; icon: string }[] = [];
                myPatients.forEach(p => {
                  p.appointments.filter(a => a.status === 'effectué').forEach(a => activities.push({ date: a.createdAt || a.date, text: `Consultation ${a.type} — ${p.firstName} ${p.lastName}`, icon: '✅' }));
                  p.medications.forEach(m => activities.push({ date: m.prescribedDate || m.startDate, text: `${m.name} prescrit à ${p.firstName} ${p.lastName}`, icon: '💊' }));
                });
                return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8).map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="shrink-0">{a.icon}</span>
                    <span className="flex-1 truncate">{a.text}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{new Date(a.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                ));
              })()}
              {myPatients.length === 0 && <p className="text-xs text-slate-400 text-center">Aucune activité.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
