import { Activity, Stethoscope, RotateCcw, Archive, AlertTriangle, ArrowUp, Check, Thermometer, LogOut, Globe } from 'lucide-react';

interface HeaderProps {
  onLoadPreset: (type: 'urgence' | 'hyperparathyroidie' | 'hypoparathyroidie' | 'normal') => void;
  onResetForm: () => void;
  onExportState: () => void;
  isAuthenticated?: boolean;
  isGuest?: boolean;
  patientName?: string;
  userRole?: 'patient' | 'medecin' | 'admin';
  onLogout?: () => void;
}

export function Header({ onLoadPreset, onResetForm, onExportState, isAuthenticated, isGuest, patientName, userRole, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 shrink-0 px-6 py-3 flex items-center justify-between z-10 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="bg-[#1a56db] text-white p-2.5 rounded-lg shadow-inner flex items-center justify-center gap-1">
          <Activity size={20} />
          <Stethoscope size={18} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-slate-900 tracking-tight flex items-center gap-2">
            ParaThyroDetect
            <span className="bg-blue-100 text-[#1a56db] text-xs font-semibold px-2 py-0.5 rounded-md">IA React v4.0</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">Détection Intelligente des Pathologies Parathyroïdiennes</p>
        </div>
      </div>

      <div className="hidden lg:flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <span className="text-xs font-semibold text-slate-500 px-2 uppercase tracking-wider flex items-center gap-1">
          <Stethoscope size={12} className="text-[#1a56db]" /> Cas cliniques :
        </span>
        <button onClick={() => onLoadPreset('urgence')} className="px-3 py-1 text-xs font-medium bg-white hover:bg-red-50 hover:text-red-600 text-slate-700 rounded shadow-sm border border-slate-200 flex items-center gap-1.5 cursor-pointer"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span><AlertTriangle size={12} /> Urgence</button>
        <button onClick={() => onLoadPreset('hyperparathyroidie')} className="px-3 py-1 text-xs font-medium bg-white hover:bg-amber-50 hover:text-amber-600 text-slate-700 rounded shadow-sm border border-slate-200 flex items-center gap-1 cursor-pointer"><ArrowUp size={12} className="text-amber-500" /> Hyper-PTH</button>
        <button onClick={() => onLoadPreset('hypoparathyroidie')} className="px-3 py-1 text-xs font-medium bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded shadow-sm border border-slate-200 flex items-center gap-1 cursor-pointer"><Thermometer size={12} className="text-blue-500" /> Hypo-PTH</button>
        <button onClick={() => onLoadPreset('normal')} className="px-3 py-1 text-xs font-medium bg-white hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 rounded shadow-sm border border-slate-200 flex items-center gap-1 cursor-pointer"><Check size={12} className="text-emerald-500" /> Normal</button>
        <button onClick={onResetForm} title="Réinitialiser le formulaire" className="px-2 py-1 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-600 rounded cursor-pointer"><RotateCcw size={14} /></button>
      </div>

      <div className="flex items-center space-x-4">
        <button onClick={onExportState} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer" title="Exporter l'état complet de l'application"><Archive size={14} /> Export JSON</button>
        {isAuthenticated && patientName && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{patientName}</p>
            <p className="text-xs font-medium flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span className={userRole === 'medecin' ? 'text-emerald-600' : userRole === 'admin' ? 'text-purple-600' : 'text-[#1a56db]'}>
                {userRole === 'medecin' ? '👨‍⚕️ Médecin' : userRole === 'admin' ? '🛡️ Administrateur' : '🧑‍⚕️ Patient'}
              </span>
            </p>
          </div>
        )}
        {isGuest && !isAuthenticated && <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-xs text-slate-600 font-medium border border-slate-200"><Globe size={14} /> Visiteur</div>}
        {(isAuthenticated || isGuest) && onLogout && <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-lg border border-red-200 cursor-pointer"><LogOut size={14} /> {isAuthenticated ? 'Déconnexion' : 'Quitter'}</button>}
      </div>
    </header>
  );
}
