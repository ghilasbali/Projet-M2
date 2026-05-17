import { Microscope, Brain, Sliders, Gauge, FileSignature, CheckCheck, Tag, GitCompareArrows, Code, Printer } from 'lucide-react';
import { AnalysisResults, CustomNorms } from '../types';

interface ResultsOutputProps {
  analysisState: 'idle' | 'loading' | 'completed';
  results: AnalysisResults | null;
  customNorms: CustomNorms;
  loadingProgress: number;
  loadingStepText: string;
  onOpenJsonModal: () => void;
}

function renderDeviationBar(label: string, val: number, min: number, max: number, unit: string) {
  let statusText = "Normal", barColor = "bg-emerald-500", textColor = "text-emerald-600", percent = 50;
  
  if (val < min) { 
    statusText = "Diminué"; 
    barColor = "bg-amber-500"; 
    textColor = "text-amber-600"; 
    percent = Math.max(5, (val / min) * 40); 
  } else if (val > max) { 
    statusText = "Élevé"; 
    barColor = "bg-red-500"; 
    textColor = "text-red-600"; 
    percent = Math.min(95, 50 + ((val - max) / max) * 100); 
  } else { 
    statusText = "Idéal"; 
    barColor = "bg-emerald-500"; 
    textColor = "text-emerald-600"; 
    percent = 30 + ((val - min) / (max - min)) * 40; 
  }
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-slate-500 font-medium">{label} <span className="text-[9px] text-slate-400">({val} {unit})</span></span>
        <span className={`font-bold ${textColor}`}>{statusText}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

export function ResultsOutput({ 
  analysisState, results, customNorms, loadingProgress, loadingStepText, onOpenJsonModal 
}: ResultsOutputProps) {
  
  // ÉTAT 1 : EN ATTENTE INITIALE
  if (analysisState === 'idle') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[500px] animate-fadeIn">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-[#1a56db] mb-4 shadow-inner">
          <Microscope size={32} className="opacity-80" />
        </div>
        <h3 className="font-bold text-slate-800 text-base">Aucune analyse active</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
          Remplissez les paramètres cliniques et biologiques dans la colonne de gauche, puis lancez le calcul pour obtenir le diagnostic IA.
        </p>
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 max-w-md w-full text-left">
          <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <span className="text-amber-500">⚡</span> Données traitées par l'algorithme :
          </p>
          <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Extraction des entités cliniques via NLP sémantique</li>
            <li>Analyse comparative aux abaques de référence</li>
            <li>Classification multi-classes des pathologies parathyroïdiennes</li>
            <li>Projection probabiliste bayésienne</li>
          </ul>
        </div>
      </div>
    );
  }

  // ÉTAT 2 : EN CHARGEMENT
  if (analysisState === 'loading') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[500px] animate-fadeIn">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-blue-100 border-t-[#1a56db] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[#1a56db] text-xl">
            <Brain className="animate-pulse" size={28} />
          </div>
        </div>
        <h3 className="font-bold text-slate-900 text-base">Traitement par IA en cours...</h3>
        <p className="text-xs text-[#1a56db] font-semibold mt-1">{loadingStepText}</p>
        
        {/* Barre d'avancement */}
        <div className="w-64 bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
          <div className="bg-[#1a56db] h-1.5 rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
        </div>
        
        <div className="mt-8 text-[11px] text-slate-400 font-mono space-y-1 text-left bg-slate-50 p-3 rounded-md w-full max-w-md border border-slate-200">
          <p className={`font-semibold ${loadingProgress >= 5 ? 'text-slate-600' : 'opacity-40'}`}>
            {loadingProgress >= 45 ? '✓' : '▶'} Initialisation du pipeline d'inférence
          </p>
          <p className={`font-semibold ${loadingProgress >= 45 ? 'text-slate-600' : 'opacity-40'}`}>
            {loadingProgress >= 85 ? '✓' : (loadingProgress >= 45 ? '▶' : '▷')} Vectorisation sémantique des symptômes
          </p>
          <p className={`font-semibold ${loadingProgress >= 85 ? 'text-slate-600' : 'opacity-40'}`}>
            {loadingProgress >= 85 ? '▶' : '▷'} Classification des pathologies parathyroïdiennes
          </p>
        </div>
      </div>
    );
  }

  // ÉTAT 3 : RÉSULTATS
  if (!results) return null;

  const probGaugeVal = results.prob;
  const gaugeOffset = 283 - (283 * (probGaugeVal / 100));
  let gaugeColor = "#10b981";
  if (probGaugeVal > 75) gaugeColor = "#ef4444";
  else if (probGaugeVal > 30) gaugeColor = "#f59e0b";

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* TROIS CARTES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Carte 1 : Score NLP */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-50 text-[#1a56db] px-2 py-1 rounded-bl-lg text-[9px] font-bold uppercase tracking-wider">
            NLP
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <span className="text-[#1a56db]">💬</span> Similarité Symptômes
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{results.nlpScore}%</span>
              <span className="text-xs text-slate-400 font-medium">concordance</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-[#1a56db] h-2 rounded-full transition-all duration-1000" style={{ width: `${results.nlpScore}%` }}></div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
            <p className="font-medium text-slate-700 mb-1">Entités extraites :</p>
            <div className="flex flex-wrap gap-1">
              {results.foundKw.length === 0 ? (
                <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">Aucune spécifique</span>
              ) : (
                results.foundKw.map((kw, i) => (
                  <span key={i} className="bg-blue-50 text-[#1a56db] border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                    {kw}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Carte 2 : Évaluation biologique */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-bl-lg text-[9px] font-bold uppercase tracking-wider">
            Écarts
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sliders size={12} className="text-indigo-600" /> Évaluation Biologique
            </p>
            <div className="mt-3 space-y-2">
              {renderDeviationBar("Ca²⁺", results.caVal, customNorms.caMin, customNorms.caMax, "mg/dL")}
              {renderDeviationBar("PTH", results.pthVal, customNorms.pthMin, customNorms.pthMax, "pg/mL")}
              {renderDeviationBar("PO₄", results.phosVal, customNorms.phosMin, customNorms.phosMax, "mg/dL")}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 text-center">
            Ajusté aux abaques configurés
          </div>
        </div>

        {/* Carte 3 : Probabilité IA */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-bl-lg text-[9px] font-bold uppercase tracking-wider">
            IA Prédictive
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-full text-left flex items-center gap-1">
            <Gauge size={12} className="text-emerald-600" /> Probabilité Pathologie
          </p>

          {/* Jauge SVG */}
          <div className="relative my-2 w-28 h-16 flex items-end justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 50">
              <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
              <path 
                d="M 10 45 A 40 40 0 0 1 90 45" 
                fill="none" 
                stroke={gaugeColor} 
                strokeWidth="10" 
                strokeLinecap="round" 
                style={{
                  strokeDasharray: 283,
                  strokeDashoffset: gaugeOffset,
                  transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease'
                }} 
              />
            </svg>
            <div className="absolute bottom-0 text-center">
              <span className="text-2xl font-extrabold" style={{ color: gaugeColor }}>{results.prob}%</span>
            </div>
          </div>

          <div className="w-full mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 text-left">
            <span className="font-medium text-slate-500">Type détecté :</span>
            <p className="font-bold truncate" style={{ color: gaugeColor }}>
              {results.diagnosisType.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
            </p>
          </div>
        </div>
      </div>

      {/* CONCLUSION MÉDICALE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileSignature size={16} className="text-[#1a56db]" />
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Conclusion Médicale & Recommandations</h4>
          </div>
          <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">FORMEL</span>
        </div>

        <div className="p-5 space-y-4">
          
          {/* Diagnostic */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Diagnostic Primaire Proposé</p>
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start gap-3">
              <CheckCheck size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-bold text-slate-900 text-sm">{results.title}</h5>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{results.desc}</p>
              </div>
            </div>
          </div>

          {/* Codes & Diff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-1">
                <Tag size={12} className="inline text-slate-400 mr-1" /> Codification CIM-10 :
              </span>
              <p className="font-mono bg-white px-2 py-1 rounded border border-slate-200 inline-block font-semibold text-[#1a56db]">
                {results.code}
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">
                <GitCompareArrows size={12} className="inline text-slate-400 mr-1" /> Diagnostic Différentiel :
              </span>
              <p className="text-slate-600">{results.diff}</p>
            </div>
          </div>

          {/* Plan d'investigation */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Plan d'investigation recommandé</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {results.investigations.map((inv, i) => (
                <div key={i} className="bg-white p-2.5 rounded border border-slate-200 shadow-xs flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 text-[#1a56db] rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-slate-700 font-medium">{inv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Payload API :</span> Format compatible REST JSON
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button 
                type="button" 
                onClick={onOpenJsonModal} 
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Code size={12} /> Voir le JSON
              </button>
              <button 
                type="button" 
                onClick={() => window.print()} 
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={12} /> Exporter PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
