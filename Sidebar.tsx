import { useState } from 'react';
import { BarChart3, Users, Sliders, Pill, CalendarClock, Info, CircleCheck, Loader, Stethoscope, FolderHeart, Key, Copy, Check, Settings, Shield } from 'lucide-react';
import { AppPage, Patient } from '../types';

interface SidebarProps {
  activeTab: AppPage;
  setActiveTab: (tab: AppPage) => void;
  currentPatient: Patient;
  analysisState: 'idle' | 'loading' | 'completed';
  isAuthenticated?: boolean;
}

function SidebarPatientCard({ patient, isAuthenticated }: { patient: Patient; isAuthenticated?: boolean }) {
  const [copied, setCopied] = useState(false);
  const isPatientWithRecord = isAuthenticated && patient.role === 'patient' && patient.hasMedicalRecord;

  const handleCopy = () => {
    navigator.clipboard.writeText(patient.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
      <div className="flex justify-between text-slate-500">
        <span>Dossier ID:</span>
        <span className="font-mono font-bold text-[#1a56db]">#{patient.id}</span>
      </div>
      <div className="flex justify-between text-slate-500">
        <span>Nom:</span>
        <span className="font-semibold text-slate-800 truncate max-w-[120px]">{patient.firstName} {patient.lastName}</span>
      </div>
      <div className="flex justify-between text-slate-500">
        <span>Âge / Sexe:</span>
        <span>{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} ans / {patient.gender}</span>
      </div>
      <div className="flex justify-between text-slate-500">
        <span>Antécédents:</span>
        <span className="text-amber-600 font-medium truncate max-w-[100px]">{patient.history || '—'}</span>
      </div>
      {isPatientWithRecord && (
        <div className="mt-2 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider mb-1"><Key size={9} /> Code d'accès dossier</div>
          <div className="flex items-center justify-between bg-slate-900 rounded-lg px-2.5 py-1.5">
            <span className="font-mono font-black text-sm tracking-[0.2em] text-amber-300">{patient.accessCode}</span>
            <button onClick={handleCopy} className="p-1 rounded bg-white/10 hover:bg-white/20 cursor-pointer transition-colors shrink-0">
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} className="text-slate-400" />}
            </button>
          </div>
          <p className="text-[9px] text-slate-400 mt-1 leading-tight">Utilisez ce code dans « Mon Dossier Médical » pour y accéder.</p>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ activeTab, setActiveTab, currentPatient, analysisState, isAuthenticated }: SidebarProps) {
  const role = isAuthenticated ? currentPatient.role : 'patient';

  const navItems: { id: AppPage; label: string; icon: React.ReactNode; badge?: string; badgeClass?: string }[] =
    role === 'admin'
      ? [
          { id: 'admin-users', label: 'Gestion Utilisateurs', icon: <Shield size={18} />, badge: activeTab === 'admin-users' ? 'Actif' : undefined, badgeClass: 'bg-purple-500 text-white' },
          { id: 'config', label: 'Configuration IA', icon: <Settings size={18} /> },
          { id: 'about', label: 'À propos', icon: <Info size={18} /> },
        ]
      : role === 'medecin'
        ? [
            { id: 'dashboard', label: 'Tableau de Bord', icon: <Stethoscope size={18} />, badge: activeTab === 'dashboard' ? 'Actif' : undefined, badgeClass: 'bg-emerald-500 text-white' },
            { id: 'patients', label: 'Dossiers Patients', icon: <Users size={18} /> },
            { id: 'treatment', label: 'Prescriptions', icon: <Pill size={18} />, badge: 'Rx', badgeClass: 'bg-purple-100 text-purple-800' },
            { id: 'appointments', label: 'Rendez-vous', icon: <CalendarClock size={18} /> },
            { id: 'abaques', label: 'Abaques & Normes', icon: <Sliders size={18} /> },
            { id: 'about', label: 'À propos', icon: <Info size={18} /> },
          ]
        : [
            { id: 'dashboard', label: 'Dashboard IA', icon: <BarChart3 size={18} />, badge: activeTab === 'dashboard' ? 'Actif' : undefined, badgeClass: 'bg-[#1a56db] text-white' },
            { id: 'patients', label: 'Mon Dossier Médical', icon: <FolderHeart size={18} /> },
            { id: 'treatment', label: 'Mon Traitement', icon: <Pill size={18} /> },
            { id: 'appointments', label: 'Mes Rendez-vous', icon: <CalendarClock size={18} /> },
            { id: 'about', label: 'À propos', icon: <Info size={18} /> },
          ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex z-5">
      <div className="py-6 px-4 space-y-6">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Navigation Médicale</p>
          <nav className="space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full text-left flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === item.id ? 'bg-blue-50 text-[#1a56db] font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <span className={`w-6 ${activeTab === item.id ? 'text-[#1a56db]' : 'text-slate-400'}`}>{item.icon}</span>
                <span className="ml-2">{item.label}</span>
                {item.badge && <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeClass}`}>{item.badge}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Patient en cours d'inférence</p>
          <SidebarPatientCard patient={currentPatient} isAuthenticated={isAuthenticated} />
        </div>

        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs">
          <p className="font-semibold text-[#1a56db] flex items-center gap-1 mb-1"><Info size={12} /> Moteur d'Analyse</p>
          <p className="text-slate-600 leading-relaxed text-[11px]">Classification supervisée multi-classes pour hyperparathyroïdie, hypoparathyroïdie et formes associées.</p>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">État du Moteur IA</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${analysisState === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {analysisState === 'completed' ? <CircleCheck size={12} className="text-emerald-600 mr-1" /> : <Loader size={12} className="animate-spin mr-1" />}
            {analysisState === 'completed' ? 'Inférence OK' : analysisState === 'loading' ? 'Calcul...' : 'En attente'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">Pipeline compatible <span className="font-semibold text-slate-700">Flask / FastAPI</span> via <code className="bg-slate-200 px-1 py-0.5 rounded text-[#1a56db] ml-1">POST /predict</code></p>
      </div>
    </aside>
  );
}
