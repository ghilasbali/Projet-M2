import { Sliders, RotateCcw, CircleCheck, ArrowRight } from 'lucide-react';
import { CustomNorms } from '../types';

interface AbaquesEditorProps {
  customNorms: CustomNorms;
  setCustomNorms: (norms: CustomNorms) => void;
  onRestoreStandards: () => void;
  onNavigateDashboard: () => void;
}

export function AbaquesEditor({ customNorms, setCustomNorms, onRestoreStandards, onNavigateDashboard }: AbaquesEditorProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
          <div>
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Sliders size={20} className="text-amber-600" /> Éditeur des Abaques & Référentiels Normatifs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personnalisez les bornes de référence. Les nouveaux seuils s'appliquent instantanément aux validations du Dashboard IA.
            </p>
          </div>
          <button
            onClick={onRestoreStandards}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs cursor-pointer flex items-center gap-1"
          >
            <RotateCcw size={12} /> Rétablir standards
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Calcium */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-slate-800">Calcium (Ca²⁺)</span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">mg/dL</span>
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1 font-medium">Borne minimale (Hypocalcémie)</label>
              <input
                type="number" step="0.1"
                value={customNorms.caMin}
                onChange={(e) => setCustomNorms({ ...customNorms, caMin: parseFloat(e.target.value) || 8.5 })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs font-bold text-[#1a56db]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1 font-medium">Borne maximale (Hypercalcémie)</label>
              <input
                type="number" step="0.1"
                value={customNorms.caMax}
                onChange={(e) => setCustomNorms({ ...customNorms, caMax: parseFloat(e.target.value) || 10.2 })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs font-bold text-[#1a56db]"
              />
            </div>
            <div className="text-[10px] text-slate-400 italic">
              Seuil critique hypercalcémie fixe à &gt; 12.0 mg/dL
            </div>
          </div>

          {/* PTH */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-slate-800">Parathormone (PTH)</span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">pg/mL</span>
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1 font-medium">Borne minimale</label>
              <input
                type="number" step="1"
                value={customNorms.pthMin}
                onChange={(e) => setCustomNorms({ ...customNorms, pthMin: parseFloat(e.target.value) || 15 })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs font-bold text-[#1a56db]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1 font-medium">Borne maximale</label>
              <input
                type="number" step="1"
                value={customNorms.pthMax}
                onChange={(e) => setCustomNorms({ ...customNorms, pthMax: parseFloat(e.target.value) || 65 })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs font-bold text-[#1a56db]"
              />
            </div>
            <div className="text-[10px] text-slate-400 italic">
              Étalonnage par immunochimioluminescence
            </div>
          </div>

          {/* Phosphore */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-slate-800">Phosphore (PO₄)</span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">mg/dL</span>
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1 font-medium">Borne minimale</label>
              <input
                type="number" step="0.1"
                value={customNorms.phosMin}
                onChange={(e) => setCustomNorms({ ...customNorms, phosMin: parseFloat(e.target.value) || 2.5 })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs font-bold text-[#1a56db]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1 font-medium">Borne maximale</label>
              <input
                type="number" step="0.1"
                value={customNorms.phosMax}
                onChange={(e) => setCustomNorms({ ...customNorms, phosMax: parseFloat(e.target.value) || 4.5 })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs font-bold text-[#1a56db]"
              />
            </div>
            <div className="text-[10px] text-slate-400 italic">
              Variation circadienne possible
            </div>
          </div>
        </div>

        {/* Vitamine D */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-slate-800">Vitamine D (25-OH)</span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200 text-slate-500">ng/mL</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-medium">Minimum</label>
                <input
                  type="number" step="1"
                  value={customNorms.vitDMin}
                  onChange={(e) => setCustomNorms({ ...customNorms, vitDMin: parseFloat(e.target.value) || 30 })}
                  className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs font-bold text-[#1a56db]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-medium">Maximum</label>
                <input
                  type="number" step="1"
                  value={customNorms.vitDMax}
                  onChange={(e) => setCustomNorms({ ...customNorms, vitDMax: parseFloat(e.target.value) || 100 })}
                  className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs font-bold text-[#1a56db]"
                />
              </div>
            </div>
            <div className="text-[10px] text-slate-500">
              Important pour le diagnostic différentiel de l'hyperparathyroïdie secondaire
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-xs text-[#1a56db] mb-2">Pathologies et profils biologiques</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="font-semibold">HPT Primaire:</span>
                <span className="text-slate-600">Ca↑ PTH↑ P↓</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="font-semibold">HPT Secondaire:</span>
                <span className="text-slate-600">Ca↓/N PTH↑ P↑ VitD↓</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="font-semibold">Hypoparathyroïdie:</span>
                <span className="text-slate-600">Ca↓ PTH↓ P↑</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="font-semibold">Pseudo-hypo:</span>
                <span className="text-slate-600">Ca↓ PTH↑ P↑</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium">
            <CircleCheck size={14} className="text-emerald-600" /> 
            Synchronisation active : Les bornes modifiées évaluent instantanément les marqueurs du Dashboard IA.
          </span>
          <button 
            onClick={onNavigateDashboard} 
            className="flex items-center gap-1 underline font-bold text-emerald-900 cursor-pointer text-xs"
          >
            Tester dans l'IA <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
