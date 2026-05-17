import { useState } from 'react';
import { Pill, Heart, Salad, Activity, Info, Plus, Trash2, Edit3, Check, Clock, Stethoscope } from 'lucide-react';
import { Patient, Medication } from '../types';
import { treatmentProtocols, diseaseDescriptions } from '../data/treatments';

interface TreatmentProtocolsProps {
  patient: Patient;
  patients: Patient[];
  currentUser: Patient;
  addMedication: (patientId: string, med: Omit<Medication, 'id'>) => void;
  removeMedication: (patientId: string, medId: string) => void;
  updateMedication: (patientId: string, medId: string, updates: Partial<Medication>) => void;
}

export function TreatmentProtocols({ patient, patients, currentUser, addMedication, updateMedication }: TreatmentProtocolsProps) {
  const isDoctor = currentUser.role === 'medecin';
  const [showForm, setShowForm] = useState(false);
  const [targetPatientId, setTargetPatientId] = useState(isDoctor ? '' : patient.id);
  const [form, setForm] = useState({ name: '', dosage: '', frequency: '', notes: '' });

  const patientsList = patients.filter(p => p.role === 'patient');

  // Determine which patient's treatment to show
  const viewPatient = isDoctor ? (patients.find(p => p.id === targetPatientId) || null) : patient;

  const protocol = viewPatient?.confirmedDiagnosis ? treatmentProtocols.find(p => p.type === viewPatient.confirmedDiagnosis) : null;
  const diagInfo = viewPatient?.confirmedDiagnosis && viewPatient.confirmedDiagnosis !== 'normal' ? diseaseDescriptions[viewPatient.confirmedDiagnosis] : null;

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewPatient) return;
    addMedication(viewPatient.id, {
      ...form,
      startDate: new Date().toISOString().split('T')[0],
      prescribedBy: currentUser.id,
      prescribedByName: `${currentUser.firstName} ${currentUser.lastName}`,
      prescribedDate: new Date().toISOString(),
      active: true,
    });
    setForm({ name: '', dosage: '', frequency: '', notes: '' });
    setShowForm(false);
  };

  const applyProtocolMed = (med: { name: string; dosage: string; frequency: string; notes: string }) => {
    if (!viewPatient) return;
    addMedication(viewPatient.id, {
      name: med.name, dosage: med.dosage, frequency: med.frequency, notes: med.notes,
      startDate: new Date().toISOString().split('T')[0],
      prescribedBy: currentUser.id,
      prescribedByName: `${currentUser.firstName} ${currentUser.lastName}`,
      prescribedDate: new Date().toISOString(),
      active: true,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Pill size={20} className="text-green-600" /> Protocoles de Traitement</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDoctor ? 'Prescrivez et modifiez les traitements pour vos patients.' : 'Consultez votre traitement en cours prescrit par votre médecin.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDoctor && (
            <select value={targetPatientId} onChange={e => setTargetPatientId(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#1a56db] min-w-[200px]">
              <option value="">— Sélectionner un patient —</option>
              {patientsList.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>)}
            </select>
          )}
          {isDoctor && viewPatient && (
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg font-bold text-xs cursor-pointer"><Plus size={14} /> Prescrire</button>
          )}
        </div>
      </div>

      {!viewPatient && isDoctor && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Stethoscope className="text-slate-300 mx-auto mb-3" size={40} />
          <p className="text-slate-400 text-sm">Sélectionnez un patient pour gérer son traitement.</p>
        </div>
      )}

      {viewPatient && (
        <>
          {/* Diagnosis info */}
          {diagInfo && protocol && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-l-4" style={{ borderLeftColor: diagInfo.color }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0" style={{ background: diagInfo.color }}><Heart size={20} /></div>
                <div>
                  <h3 className="font-bold text-slate-900">{protocol.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{protocol.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Patient: <strong>{viewPatient.firstName} {viewPatient.lastName}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* Doctor: prescription form */}
          {isDoctor && showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-5 animate-fadeIn">
              <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2"><Edit3 size={14} className="text-green-600" /> Prescrire un médicament à {viewPatient.firstName} {viewPatient.lastName}</h3>
              <form onSubmit={handleAddMed} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Médicament *</label><input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Cinacalcet" className="w-full p-2.5 border border-slate-300 rounded-lg text-xs" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Dosage *</label><input type="text" required value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} placeholder="30 mg" className="w-full p-2.5 border border-slate-300 rounded-lg text-xs" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Fréquence *</label><input type="text" required value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} placeholder="2x/jour" className="w-full p-2.5 border border-slate-300 rounded-lg text-xs" /></div>
                <div className="flex items-end gap-2">
                  <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-lg text-xs cursor-pointer">Prescrire</button>
                  <button type="button" onClick={() => setShowForm(false)} className="py-2.5 px-3 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer">Annuler</button>
                </div>
              </form>
            </div>
          )}

          {/* Protocol recommended meds (doctor only) */}
          {isDoctor && protocol && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2"><Pill size={14} className="text-green-600" /> Médicaments recommandés par le protocole</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {protocol.medications.map((m, i) => (
                  <div key={i} className="bg-green-50 rounded-lg p-3 border border-green-100 flex items-start justify-between">
                    <div className="text-xs"><p className="font-bold text-slate-800">{m.name}</p><p className="text-slate-500">💊 {m.dosage} • {m.frequency}</p><p className="text-[10px] text-slate-400 italic mt-0.5">{m.notes}</p></div>
                    <button onClick={() => applyProtocolMed(m)} className="shrink-0 px-2 py-1 bg-green-600 text-white rounded text-[10px] font-bold cursor-pointer">+ Prescrire</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle + monitoring (always visible) */}
          {protocol && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2"><Salad size={14} className="text-orange-600" /> Règles hygiéno-diététiques</h3>
                <ul className="space-y-1.5 text-xs text-slate-600">{protocol.lifestyle.map((l, i) => <li key={i} className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">•</span>{l}</li>)}</ul>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2"><Activity size={14} className="text-[#1a56db]" /> Surveillance</h3>
                <ul className="space-y-1.5 text-xs text-slate-600">{protocol.monitoring.map((m, i) => <li key={i} className="flex items-start gap-2"><span className="text-[#1a56db] mt-0.5">•</span>{m}</li>)}</ul>
              </div>
            </div>
          )}

          {!protocol && !diagInfo && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <Info size={28} className="text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Diagnostic non encore confirmé pour ce patient. Lancez une analyse IA pour obtenir le protocole de traitement.</p>
            </div>
          )}

          {/* Current medications list */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-green-50 border-b border-green-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-green-800 flex items-center gap-2"><Pill size={14} /> Traitement en cours ({viewPatient.medications.length})</h3>
            </div>
            {viewPatient.medications.length > 0 ? (
              <div className="p-4 space-y-3">
                {viewPatient.medications.map(med => (
                  <div key={med.id} className={`rounded-xl p-4 border ${med.active !== false ? 'bg-green-50/50 border-green-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-sm flex items-center gap-2">{med.name} {med.active !== false ? <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">ACTIF</span> : <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">ARRÊTÉ</span>}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                          <span>💊 {med.dosage}</span>
                          <span><Clock size={10} className="inline" /> {med.frequency}</span>
                          <span>Depuis le {new Date(med.startDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {med.prescribedByName && <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1"><Stethoscope size={10} /> Prescrit par {med.prescribedByName} le {new Date(med.prescribedDate).toLocaleDateString('fr-FR')}</p>}
                        {med.notes && <p className="text-[10px] text-slate-400 italic mt-1">{med.notes}</p>}
                      </div>
                      {isDoctor && (
                        <div className="flex gap-1 shrink-0">
                          {med.active !== false ? (
                            <button onClick={() => updateMedication(viewPatient.id, med.id, { active: false, endDate: new Date().toISOString().split('T')[0] })} className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100 cursor-pointer" title="Arrêter"><Trash2 size={12} /></button>
                          ) : (
                            <button onClick={() => updateMedication(viewPatient.id, med.id, { active: true, endDate: undefined })} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 cursor-pointer" title="Réactiver"><Check size={12} /></button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                <Pill size={28} className="text-slate-300 mx-auto mb-2" />
                {isDoctor ? 'Aucun traitement prescrit pour ce patient.' : 'Aucun traitement en cours. Votre médecin vous prescrira un traitement après diagnostic.'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
