import { useState } from 'react';
import { Users, Trash2, Edit3, Check, X, Shield, Stethoscope, User, Search, AlertTriangle, Key, Plus, Copy } from 'lucide-react';
import { Patient, DoctorCode } from '../types';

interface AdminUsersProps {
  patients: Patient[];
  doctorCodes: DoctorCode[];
  adminDeleteUser: (userId: string) => void;
  adminUpdateUser: (userId: string, updates: Partial<Patient>) => void;
  adminAddDoctorCode: () => string;
  adminDeleteDoctorCode: (code: string) => void;
  addLog: (text: string) => void;
}

export function AdminUsers({ patients, doctorCodes, adminDeleteUser, adminUpdateUser, adminAddDoctorCode, adminDeleteDoctorCode, addLog }: AdminUsersProps) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'patient' | 'medecin' | 'admin'>('all');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filtered = patients.filter(p => {
    const matchSearch = `${p.firstName} ${p.lastName} ${p.email} ${p.id}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || p.role === filterRole;
    return matchSearch && matchRole;
  });

  const startEdit = (p: Patient) => {
    setEditId(p.id);
    setEditForm({ firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone });
  };

  const saveEdit = () => {
    if (!editId) return;
    adminUpdateUser(editId, editForm);
    setEditId(null);
  };

  const handleDelete = (p: Patient) => {
    if (p.role === 'admin') return;
    if (confirm(`Supprimer ${p.firstName} ${p.lastName} (${p.role}) ?`)) adminDeleteUser(p.id);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const stats = {
    total: patients.length,
    patients: patients.filter(p => p.role === 'patient').length,
    medecins: patients.filter(p => p.role === 'medecin').length,
    admins: patients.filter(p => p.role === 'admin').length,
  };

  const roleLabel = (r: string) => r === 'medecin' ? '👨‍⚕️ Médecin' : r === 'admin' ? '🛡️ Admin' : '🧑‍⚕️ Patient';
  const roleColor = (r: string) => r === 'medecin' ? 'bg-emerald-100 text-emerald-700' : r === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-[#1a56db]';

  const availableCodes = doctorCodes.filter(c => !c.used && (!c.expiresAt || new Date(c.expiresAt).getTime() > Date.now()));
  const usedCodes = doctorCodes.filter(c => c.used || (c.expiresAt && new Date(c.expiresAt).getTime() <= Date.now()));

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl p-5 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center"><Shield size={28} /></div>
          <div>
            <h2 className="font-bold text-xl">Administration — Gestion des Utilisateurs</h2>
            <p className="text-purple-200 text-sm">La liste complète des utilisateurs est chargée automatiquement ici.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: 'Total', v: stats.total, c: 'text-slate-700 bg-slate-50 border-slate-200', ic: <Users size={16} /> },
          { l: 'Patients', v: stats.patients, c: 'text-[#1a56db] bg-blue-50 border-blue-200', ic: <User size={16} /> },
          { l: 'Médecins', v: stats.medecins, c: 'text-emerald-700 bg-emerald-50 border-emerald-200', ic: <Stethoscope size={16} /> },
          { l: 'Admins', v: stats.admins, c: 'text-purple-700 bg-purple-50 border-purple-200', ic: <Shield size={16} /> },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl p-3 border text-center ${s.c}`}>
            <div className="mb-1 flex justify-center">{s.ic}</div>
            <p className="text-2xl font-black">{s.v}</p>
            <p className="text-[9px] font-semibold uppercase tracking-wider">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden">
        <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
          <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5"><Key size={14} /> Codes d'inscription médecin</span>
          <button onClick={() => { const c = adminAddDoctorCode(); addLog(`Code généré: ${c}`); }} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"><Plus size={12} /> Générer</button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-[11px] text-blue-700">
            <p className="font-bold text-blue-800 mb-1">Comment un médecin obtient son code ?</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>L'administrateur génère un code ici.</li>
              <li>Il le copie et le transmet au médecin par un moyen sécurisé.</li>
              <li>Le médecin doit utiliser ce code dans un délai maximum de 1 minute 30 secondes.</li>
              <li>Le code devient ensuite inutilisable pour tous les autres médecins.</li>
            </ol>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Codes disponibles ({availableCodes.length})</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableCodes.map(c => (
                <div key={c.id} className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-mono font-black text-sm text-emerald-800 tracking-wider">{c.code}</p>
                    <p className="text-[9px] text-emerald-600">Expire dans {Math.max(0, Math.floor(((new Date(c.expiresAt || '').getTime()) - Date.now()) / 1000))} sec</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => copyCode(c.code)} className="p-1.5 rounded bg-white border border-emerald-200 hover:bg-emerald-100 cursor-pointer">{copiedCode === c.code ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} className="text-emerald-600" />}</button>
                    <button onClick={() => adminDeleteDoctorCode(c.code)} className="p-1.5 rounded bg-white border border-red-200 hover:bg-red-50 cursor-pointer text-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {usedCodes.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Codes utilisés ({usedCodes.length})</p>
              <div className="space-y-1.5">
                {usedCodes.map(c => (
                  <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between text-xs opacity-60">
                    <span className="font-mono font-bold text-slate-500 line-through">{c.code}</span>
                    <span className="text-slate-400">{c.used ? <>utilisé par <strong>{c.usedBy}</strong></> : 'expiré automatiquement'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, email ou ID..." className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-[#1a56db]" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'patient', 'medecin', 'admin'] as const).map(r => (
            <button key={r} onClick={() => setFilterRole(r)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${filterRole === r ? 'bg-[#1a56db] text-white border-[#1a56db]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
              {r === 'all' ? 'Tous' : r === 'patient' ? '🧑‍⚕️ Patients' : r === 'medecin' ? '👨‍⚕️ Médecins' : '🛡️ Admins'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3 text-left font-bold">Utilisateur</th>
                <th className="px-3 py-3 text-center font-bold">Rôle</th>
                <th className="px-3 py-3 text-center font-bold">Email</th>
                <th className="px-3 py-3 text-center font-bold">Tél.</th>
                <th className="px-3 py-3 text-center font-bold">Créé le</th>
                <th className="px-3 py-3 text-center font-bold">Code dossier</th>
                <th className="px-3 py-3 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-slate-400">Aucun utilisateur trouvé.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className={`hover:bg-slate-50 ${p.role === 'admin' ? 'bg-purple-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    {editId === p.id ? (
                      <div className="flex gap-1">
                        <input type="text" value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} className="w-20 p-1 border border-slate-300 rounded text-xs" />
                        <input type="text" value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} className="w-24 p-1 border border-slate-300 rounded text-xs" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-[9px] ${p.role === 'medecin' ? 'bg-emerald-600' : p.role === 'admin' ? 'bg-purple-600' : 'bg-[#1a56db]'}`}>{p.firstName.charAt(0)}{p.lastName.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-slate-800">{p.firstName} {p.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.id}</p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center"><span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${roleColor(p.role)}`}>{roleLabel(p.role)}</span></td>
                  <td className="px-3 py-3 text-center">{editId === p.id ? <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-32 p-1 border border-slate-300 rounded text-xs text-center" /> : <span className="font-mono text-slate-600 text-[10px]">{p.email}</span>}</td>
                  <td className="px-3 py-3 text-center">{editId === p.id ? <input type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="w-24 p-1 border border-slate-300 rounded text-xs text-center" /> : <span className="text-slate-500">{p.phone || '—'}</span>}</td>
                  <td className="px-3 py-3 text-center text-slate-400">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-3 py-3 text-center">{p.role === 'patient' && p.hasMedicalRecord ? <span className="font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 tracking-wider text-[11px]">{p.accessCode}</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-3 py-3 text-center">
                    {editId === p.id ? (
                      <div className="flex gap-1 justify-center">
                        <button onClick={saveEdit} className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 cursor-pointer"><Check size={12} /></button>
                        <button onClick={() => setEditId(null)} className="p-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 cursor-pointer"><X size={12} /></button>
                      </div>
                    ) : (
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => startEdit(p)} className="p-1 bg-blue-50 text-[#1a56db] rounded hover:bg-blue-100 cursor-pointer"><Edit3 size={12} /></button>
                        {p.role !== 'admin' && <button onClick={() => handleDelete(p)} className="p-1 bg-red-50 text-red-500 rounded hover:bg-red-100 cursor-pointer"><Trash2 size={12} /></button>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3 text-xs">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-amber-700">
          <p className="font-bold text-amber-800 mb-1">Règles de sécurité</p>
          <ul className="space-y-0.5">
            <li>• Seul un <strong>code médecin généré par l'admin</strong> permet de créer un compte médecin.</li>
            <li>• Chaque code est à <strong>usage unique</strong> et expire après <strong>1 min 30 s</strong>.</li>
            <li>• L'accès admin se fait via le chemin spécial <code className="bg-amber-100 px-1 py-0.5 rounded">/admin</code>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
