import { useState } from 'react';
import { Edit3, Upload, CloudUpload, Trash2, FlaskConical, Sparkles, Loader, FileImage, CheckCircle2 } from 'lucide-react';
import { CustomNorms, UploadedFile, PatientFile } from '../types';

interface ClinicalInputFormProps {
  symptoms: string;
  setSymptoms: (v: string) => void;
  calcium: string;
  setCalcium: (v: string) => void;
  pth: string;
  setPth: (v: string) => void;
  phosphorus: string;
  setPhosphorus: (v: string) => void;
  uploadedFile: UploadedFile | null;
  setUploadedFile: (v: UploadedFile | null) => void;
  customNorms: CustomNorms;
  onRunAnalysis: (e: React.FormEvent) => void;
  analysisState: 'idle' | 'loading' | 'completed';
  onAppendSymptomTag: (tag: string) => void;
  patientFiles: PatientFile[];
  onAddPatientFile: (file: Omit<PatientFile, 'id'>) => void;
  isAuthenticated: boolean;
}

function getBadgeStatus(valStr: string, minNorm: number, maxNorm: number) {
  const val = parseFloat(valStr);
  if (isNaN(val)) return { text: `Norme : ${minNorm} - ${maxNorm}`, className: "bg-slate-100 text-slate-500 font-normal" };
  if (val < minNorm) return { text: "FAIBLE", className: "bg-amber-100 text-amber-700 font-bold" };
  if (val > maxNorm) return { text: "ÉLEVÉ", className: "bg-red-100 text-red-700 font-bold animate-pulse" };
  return { text: "NORMAL", className: "bg-emerald-100 text-emerald-700 font-bold" };
}

export function ClinicalInputForm({
  symptoms, setSymptoms,
  calcium, setCalcium,
  pth, setPth,
  phosphorus, setPhosphorus,
  uploadedFile, setUploadedFile,
  customNorms,
  onRunAnalysis, analysisState,
  onAppendSymptomTag,
  patientFiles, onAddPatientFile, isAuthenticated
}: ClinicalInputFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileCategory, setFileCategory] = useState<PatientFile['type']>('analyse');
  const [analysisMode, setAnalysisMode] = useState<'manual' | 'files' | null>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({ name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB' });
      if (isAuthenticated) {
        onAddPatientFile({ name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB', type: fileCategory, category: fileCategory, date: new Date().toISOString() });
      }
    }
  };

  const badgeCa = getBadgeStatus(calcium, customNorms.caMin, customNorms.caMax);
  const badgePth = getBadgeStatus(pth, customNorms.pthMin, customNorms.pthMax);
  const badgePhos = getBadgeStatus(phosphorus, customNorms.phosMin, customNorms.phosMax);

  const hasFiles = uploadedFile !== null || patientFiles.length > 0;
  const hasManualValues = calcium !== '' && pth !== '' && phosphorus !== '';

  const symptomTags = [
    { label: 'Asthénie', value: 'Asthénie chronique' },
    { label: 'Douleurs os', value: 'Douleurs osseuses' },
    { label: 'Coliques', value: 'Coliques néphrétiques' },
    { label: 'Paresthésies', value: 'Paresthésies des extrémités' },
    { label: 'Crampes', value: 'Crampes musculaires' },
    { label: 'Confusion', value: 'Confusion mentale', danger: true },
    { label: 'Nausées', value: 'Nausées et vomissements' },
    { label: 'Constipation', value: 'Constipation' },
    { label: 'Fractures', value: 'Fractures pathologiques' },
    { label: 'Calculs rénaux', value: 'Calculs rénaux (lithiase)' },
    { label: 'Polyurie', value: 'Polyurie' },
    { label: 'Fatigue', value: 'Fatigue chronique' },
  ];

  return (
    <section className="lg:col-span-6 xl:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Edit3 size={18} className="text-[#1a56db]" />
          <h2 className="font-bold text-base tracking-wide">Saisie des Données Cliniques</h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">Patient</span>
      </div>

      <div className="p-5 space-y-5 flex-1 overflow-y-auto">
        
        {/* ═══ ZONE 1 : SYMPTOMATOLOGIE ═══ */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="symptoms" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-[#1a56db]">💬</span> Symptomatologie (Analyse NLP)
            </label>
            <span className="text-xs text-slate-400 font-mono">{symptoms.length} / 500</span>
          </div>
          <p className="text-xs text-slate-500 mb-2">Décrivez vos symptômes manuellement ou utilisez les boutons d'ajout rapide ci-dessous.</p>
          
          <textarea 
            id="symptoms" rows={3} maxLength={500} value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#1a56db] focus:border-[#1a56db] outline-none transition-all resize-none"
            placeholder="Ex: Asthénie sévère depuis 3 mois, douleurs osseuses, nausées, antécédents de coliques néphrétiques..."
          />
          
          {/* Tags rapides — recommandés */}
          <div className="mt-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Symptômes recommandés (cliquez pour ajouter) :</p>
            <div className="flex flex-wrap gap-1.5">
              {symptomTags.map(tag => {
                const isSelected = symptoms.toLowerCase().includes(tag.value.toLowerCase());
                return (
                  <button key={tag.label} type="button" onClick={() => onAppendSymptomTag(tag.value)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border cursor-pointer transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#1a56db] text-white border-[#1a56db] shadow-sm'
                        : tag.danger 
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-[#1a56db] hover:border-blue-300'
                    }`}>
                    {isSelected ? <CheckCircle2 size={10} /> : '+'} {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* ═══ CHOIX DU MODE D'ANALYSE ═══ */}
        <div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#1a56db]" /> Choisissez votre méthode d'analyse
          </p>
          <p className="text-[11px] text-slate-500 mb-3">Sélectionnez <strong>une des deux options</strong> ci-dessous, puis cliquez sur « Lancer l'Analyse IA ».</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button type="button" onClick={() => setAnalysisMode('files')}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                analysisMode === 'files' ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <Upload size={16} className={analysisMode === 'files' ? 'text-purple-600' : 'text-slate-400'} />
                <span className={`font-bold text-sm ${analysisMode === 'files' ? 'text-purple-700' : 'text-slate-700'}`}>📁 Déposer des fichiers</span>
              </div>
              <p className="text-[10px] text-slate-500">Analyses, radios, ordonnances depuis votre appareil</p>
              {hasFiles && <p className="text-[9px] text-emerald-600 font-bold mt-1">✓ {patientFiles.length} fichier(s) déposé(s)</p>}
            </button>

            <button type="button" onClick={() => setAnalysisMode('manual')}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                analysisMode === 'manual' ? 'border-[#1a56db] bg-blue-50 shadow-md' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical size={16} className={analysisMode === 'manual' ? 'text-[#1a56db]' : 'text-slate-400'} />
                <span className={`font-bold text-sm ${analysisMode === 'manual' ? 'text-[#1a56db]' : 'text-slate-700'}`}>🧪 Saisie manuelle</span>
              </div>
              <p className="text-[10px] text-slate-500">Calcium, PTH, Phosphore — valeurs numériques</p>
              {hasManualValues && <p className="text-[9px] text-emerald-600 font-bold mt-1">✓ Valeurs renseignées</p>}
            </button>
          </div>
        </div>

        {/* ═══ OPTION A : DÉPOSER DES FICHIERS ═══ */}
        {analysisMode === 'files' && (
          <div className="animate-fadeIn space-y-4 bg-purple-50/30 rounded-xl p-4 border border-purple-200">
            <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <Upload size={14} /> Déposer vos fichiers (analyses, radios, ordonnances)
            </h3>

            {isAuthenticated && (
              <div className="flex gap-2">
                {([
                  { v: 'analyse' as const, l: '🧪 Analyse', c: 'border-blue-300 bg-blue-50 text-blue-700' },
                  { v: 'radio' as const, l: '📷 Radio', c: 'border-purple-300 bg-purple-50 text-purple-700' },
                  { v: 'ordonnance' as const, l: '📋 Ordonnance', c: 'border-green-300 bg-green-50 text-green-700' },
                  { v: 'autre' as const, l: '📎 Autre', c: 'border-slate-300 bg-slate-50 text-slate-700' },
                ]).map(t => (
                  <button key={t.v} type="button" onClick={() => setFileCategory(t.v)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${fileCategory === t.v ? t.c + ' shadow-sm' : 'border-slate-200 bg-white text-slate-400'}`}>
                    {t.l}
                  </button>
                ))}
              </div>
            )}

            <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all relative ${isDragging ? 'border-purple-500 bg-purple-100/30' : 'border-purple-300 bg-white hover:bg-purple-50/30'}`}>
              <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,application/pdf,text/plain,.txt,.pdf,.jpg,.jpeg,.jfif,.png"
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach(file => {
                      setUploadedFile({ name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB' });
                      if (isAuthenticated) {
                        onAddPatientFile({ name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB', type: fileCategory, category: fileCategory, date: new Date().toISOString() });
                      }
                    });
                  }
                }} />
              {!uploadedFile ? (
                <div className="space-y-2 py-1">
                  <CloudUpload size={24} className="text-purple-400 mx-auto" />
                  <div className="text-xs text-slate-600"><span className="font-semibold text-purple-600">Cliquez</span> ou glissez vos fichiers ici</div>
                  <p className="text-[10px] text-slate-400">PNG, JPG, PDF — Plusieurs fichiers</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-purple-200 shadow-sm text-left z-10 relative">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FileImage size={20} className="text-purple-600 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-slate-800 truncate">{uploadedFile.name}</p>
                      <p className="text-[10px] text-slate-500">{uploadedFile.size}</p>
                    </div>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"><Trash2 size={14} /></button>
                </div>
              )}
            </div>

            {isAuthenticated && patientFiles.length > 0 && (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {patientFiles.slice(-4).reverse().map(f => (
                  <div key={f.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 text-[10px] border border-slate-100">
                    <span>{f.type === 'analyse' ? '🧪' : f.type === 'radio' ? '📷' : f.type === 'ordonnance' ? '📋' : '📎'}</span>
                    <span className="font-semibold text-slate-700 truncate flex-1">{f.name}</span>
                    <span className="text-slate-400 shrink-0">{new Date(f.date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Bouton Lancer IA pour fichiers */}
            <button type="button" onClick={(e) => onRunAnalysis(e)} disabled={analysisState === 'loading' || (!hasFiles && !symptoms.trim())}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-md btn-medical-shine transition-all cursor-pointer flex items-center justify-center space-x-2 text-sm uppercase tracking-wide disabled:opacity-50">
              {analysisState === 'loading' ? <Loader size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>{analysisState === 'loading' ? "Analyse en cours..." : "🔬 Lancer l'Analyse IA (Fichiers)"}</span>
            </button>
          </div>
        )}

        {/* ═══ OPTION B : SAISIE MANUELLE ═══ */}
        {analysisMode === 'manual' && (
          <div className="animate-fadeIn space-y-4 bg-blue-50/30 rounded-xl p-4 border border-blue-200">
            <h3 className="text-xs font-bold text-[#1a56db] uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical size={14} /> Paramètres Biologiques (Saisie Manuelle)
            </h3>

            <div className="space-y-3">
              {/* Calcium */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="calcium" className="font-medium text-slate-700">Calcium sérique <span className="text-slate-400 font-normal">(mg/dL)</span></label>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${badgeCa.className}`}>{badgeCa.text}</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">Ca²⁺</div>
                  <input type="number" step="0.1" id="calcium" value={calcium} onChange={(e) => setCalcium(e.target.value)}
                    className="block w-full pl-12 pr-16 py-2 bg-white border border-slate-300 rounded-lg focus:ring-[#1a56db] focus:border-[#1a56db] text-sm font-semibold text-slate-900 outline-none transition-all" placeholder="Ex: 10.5" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">mg/dL</div>
                </div>
              </div>

              {/* PTH */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="pth" className="font-medium text-slate-700">Parathormone intacte (PTH) <span className="text-slate-400 font-normal">(pg/mL)</span></label>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${badgePth.className}`}>{badgePth.text}</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">PTH</div>
                  <input type="number" step="1" id="pth" value={pth} onChange={(e) => setPth(e.target.value)}
                    className="block w-full pl-12 pr-16 py-2 bg-white border border-slate-300 rounded-lg focus:ring-[#1a56db] focus:border-[#1a56db] text-sm font-semibold text-slate-900 outline-none transition-all" placeholder="Ex: 85" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">pg/mL</div>
                </div>
              </div>

              {/* Phosphore */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="phosphore" className="font-medium text-slate-700">Phosphore sérique <span className="text-slate-400 font-normal">(mg/dL)</span></label>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${badgePhos.className}`}>{badgePhos.text}</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">PO₄</div>
                  <input type="number" step="0.1" id="phosphore" value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)}
                    className="block w-full pl-12 pr-16 py-2 bg-white border border-slate-300 rounded-lg focus:ring-[#1a56db] focus:border-[#1a56db] text-sm font-semibold text-slate-900 outline-none transition-all" placeholder="Ex: 2.1" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">mg/dL</div>
                </div>
              </div>
            </div>

            {/* Bouton Lancer IA pour saisie manuelle */}
            <button type="button" onClick={(e) => onRunAnalysis(e)} disabled={analysisState === 'loading' || !hasManualValues}
              className="w-full bg-[#1a56db] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md btn-medical-shine transition-all cursor-pointer flex items-center justify-center space-x-2 text-sm uppercase tracking-wide disabled:opacity-50">
              {analysisState === 'loading' ? <Loader size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>{analysisState === 'loading' ? "Analyse en cours..." : "🧪 Lancer l'Analyse IA (Saisie Manuelle)"}</span>
            </button>
          </div>
        )}

        {/* Message si aucun mode sélectionné */}
        {analysisMode === null && (
          <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200">
            <Sparkles size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Saisissez vos symptômes ci-dessus, puis choisissez une méthode d'analyse pour continuer.</p>
          </div>
        )}
      </div>
    </section>
  );
}
