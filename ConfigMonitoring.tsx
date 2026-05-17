import { useState } from 'react';
import { Cpu, Save, Trash2, Shield, Check } from 'lucide-react';
import { AIConfig, LogEntry, Patient } from '../types';

interface ConfigMonitoringProps {
  aiConfig: AIConfig;
  setAiConfig: (config: AIConfig) => void;
  consoleLogs: LogEntry[];
  onClearLogs: () => void;
  onExportFullState: () => void;
  currentUser?: Patient;
  adminUpdateUser?: (userId: string, updates: Partial<Patient>) => void;
}

export function ConfigMonitoring({ 
  aiConfig, setAiConfig, consoleLogs, onClearLogs, onExportFullState, currentUser, adminUpdateUser
}: ConfigMonitoringProps) {
  const isAdmin = currentUser?.role === 'admin';
  const needsProfile = isAdmin && (!!currentUser && (currentUser.firstName === 'Admin' || currentUser.lastName === 'SYSTEM' || !currentUser.phone || !currentUser.adminNumber));
  const [showProfile, setShowProfile] = useState(!!needsProfile);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    firstName: currentUser?.firstName === 'Admin' ? '' : currentUser?.firstName || '',
    lastName: currentUser?.lastName === 'SYSTEM' ? '' : currentUser?.lastName || '',
    dateOfBirth: currentUser?.dateOfBirth === '1990-01-01' ? '' : currentUser?.dateOfBirth || '',
    gender: currentUser?.gender || 'M',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    adminNumber: currentUser?.adminNumber || '',
  });

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !adminUpdateUser) return;
    adminUpdateUser(currentUser.id, {
      firstName: profile.firstName || 'Admin',
      lastName: profile.lastName || 'SYSTEM',
      dateOfBirth: profile.dateOfBirth || '1990-01-01',
      gender: profile.gender as 'M' | 'F',
      phone: profile.phone,
      address: profile.address,
      adminNumber: profile.adminNumber,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowProfile(false); }, 2000);
  };
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
          <button onClick={() => setShowProfile(!showProfile)} className="w-full px-5 py-3.5 flex items-center justify-between bg-purple-50 hover:bg-purple-100 cursor-pointer border-b border-purple-200">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-purple-600" />
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Profil Administrateur</span>
              {needsProfile && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold animate-pulse">À compléter</span>}
              {!needsProfile && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">✓ Renseigné</span>}
            </div>
            <span className={`text-slate-400 text-xs transition-transform ${showProfile ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {showProfile && (
            <form onSubmit={saveProfile} className="p-5 space-y-4 animate-fadeIn">
              <p className="text-[11px] text-slate-500">Lors de votre première connexion, vous pouvez renseigner votre profil administrateur. Vous pourrez le modifier plus tard à tout moment.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Nom *</label><input type="text" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-purple-500" placeholder="Votre nom" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Prénom *</label><input type="text" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-purple-500" placeholder="Votre prénom" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Date de naissance</label><input type="date" value={profile.dateOfBirth} onChange={e => setProfile(p => ({ ...p, dateOfBirth: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-purple-500" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Sexe</label><select value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value as 'M' | 'F' }))} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-purple-500"><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
                <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Téléphone</label><input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-purple-500" placeholder="06 XX XX XX XX" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-700 mb-1">Numéro d'admin</label><input type="text" value={profile.adminNumber} onChange={e => setProfile(p => ({ ...p, adminNumber: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-purple-500" placeholder="ADM-001" /></div>
                <div className="md:col-span-2"><label className="block text-[11px] font-semibold text-slate-700 mb-1">Adresse</label><input type="text" value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-purple-500" placeholder="Votre adresse" /></div>
              </div>
              {saved && <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] border border-emerald-200"><Check size={12} /> Profil administrateur enregistré avec succès.</div>}
              <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1"><Check size={14} /> Enregistrer mon profil</button>
            </form>
          )}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="border-b border-slate-200 pb-3 mb-4">
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Cpu size={20} className="text-[#1a56db]" /> Configuration du Modèle IA & Logs Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Paramétrez les poids d'inférence du réseau et surveillez les événements système.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Configuration IA */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Pondération Algorithmique
            </h3>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Sensibilité NLP (Poids sémantique)</span>
                <span className="font-bold text-[#1a56db]">{aiConfig.nlpWeight}%</span>
              </div>
              <input
                type="range" min="50" max="150"
                value={aiConfig.nlpWeight}
                onChange={(e) => setAiConfig({ ...aiConfig, nlpWeight: parseInt(e.target.value) })}
                className="w-full accent-[#1a56db] cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Impacte le score de similarité calculé à partir des entités cliniques extraites.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Temps d'inférence simulée (Latence)</span>
                <span className="font-bold text-[#1a56db]">{aiConfig.latencyMs} ms</span>
              </div>
              <input
                type="range" min="500" max="5000" step="500"
                value={aiConfig.latencyMs}
                onChange={(e) => setAiConfig({ ...aiConfig, latencyMs: parseInt(e.target.value) })}
                className="w-full accent-[#1a56db] cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Détermine la durée de l'animation de calcul matriciel (spinner).
              </p>
            </div>

            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#1a56db] block">Export des Données Locales</span>
                <p className="text-[10px] text-slate-500">
                  Téléchargez une copie complète des patients et de la configuration.
                </p>
              </div>
              <button
                onClick={onExportFullState}
                className="px-3 py-1.5 bg-[#1a56db] text-white rounded font-bold hover:bg-blue-700 cursor-pointer text-xs flex items-center gap-1"
              >
                <Save size={12} /> Sauvegarder JSON
              </button>
            </div>

            {/* Infos techniques */}
            <div className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs space-y-2">
              <p className="font-bold text-white">🔧 Informations Techniques</p>
              <div className="space-y-1 text-[11px]">
                <p><span className="text-slate-500">Framework:</span> React 19 + Vite + TypeScript</p>
                <p><span className="text-slate-500">Stockage:</span> localStorage (persistance locale)</p>
                <p><span className="text-slate-500">Moteur IA:</span> Classification supervisée multi-classes</p>
                <p><span className="text-slate-500">Pathologies:</span> HPT 1°/2°/3°, Hypo-PTH, Pseudo-hypo</p>
                <p><span className="text-slate-500">API Ready:</span> Flask / FastAPI via POST /predict</p>
              </div>
            </div>
          </div>

          {/* Console de logs */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Console de Monitoring Live
              </h3>
              <button
                onClick={onClearLogs}
                className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={10} /> Effacer
              </button>
            </div>
            <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-4 rounded-xl h-80 overflow-y-auto space-y-1 shadow-inner border border-slate-800">
              {consoleLogs.map((log, index) => (
                <p key={index} className="text-emerald-300">
                  <span className="text-slate-500 font-mono">[{log.time}]</span> {log.text}
                </p>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Les logs sont conservés pendant la session et permettent de tracer toutes les actions utilisateur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
