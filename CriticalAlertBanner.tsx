import { AlertTriangle } from 'lucide-react';

interface CriticalAlertBannerProps {
  calcium: string;
  pth: string;
}

export function CriticalAlertBanner({ calcium, pth }: CriticalAlertBannerProps) {
  const caVal = parseFloat(calcium) || 0;
  const pthVal = parseFloat(pth) || 0;
  
  // Hypercalcémie sévère
  if (caVal >= 12.0) {
    return (
      <div className="border-2 rounded-xl p-4 animate-critical-pulse transition-all shadow-md animate-fadeIn">
        <div className="flex items-start space-x-3">
          <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <AlertTriangle size={16} className="animate-bounce" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-red-900 text-sm uppercase tracking-wide">
                ⚠️ Alerte Critique — Hypercalcémie Sévère
              </h3>
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                PROTOCOLE URGENT
              </span>
            </div>
            <p className="text-xs text-red-800 mt-1 leading-relaxed font-medium">
              Calcium &gt; 12.0 mg/dL détecté. Risque de trouble du rythme cardiaque, coma calcique ou arrêt cardiaque.
              <strong> Recommandation :</strong> perfusion IV de sérum physiologique, furosémide, ECG en urgence et hospitalisation immédiate en réanimation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Hypocalcémie sévère (tétanie possible)
  if (caVal > 0 && caVal < 7.0) {
    return (
      <div className="border-2 border-blue-500 rounded-xl p-4 bg-blue-50 shadow-md animate-fadeIn">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <AlertTriangle size={16} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-blue-900 text-sm uppercase tracking-wide">
                ⚠️ Alerte — Hypocalcémie Sévère
              </h3>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                TÉTANIE POSSIBLE
              </span>
            </div>
            <p className="text-xs text-blue-800 mt-1 leading-relaxed font-medium">
              Calcium &lt; 7.0 mg/dL. Risque de tétanie, convulsions, arythmie cardiaque.
              <strong> Recommandation :</strong> gluconate de calcium IV, surveillance ECG, recherche cause (hypoparathyroïdie post-chirurgicale ?).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // PTH très élevée (adénome probable)
  if (pthVal > 150) {
    return (
      <div className="border-2 border-amber-500 rounded-xl p-4 bg-amber-50 shadow-md animate-fadeIn">
        <div className="flex items-start space-x-3">
          <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <AlertTriangle size={16} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">
                ⚠️ Alerte — PTH Très Élevée
              </h3>
              <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                ADÉNOME PROBABLE
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed font-medium">
              PTH &gt; 150 pg/mL avec calcium élevé suggère fortement un adénome parathyroïdien.
              <strong> Recommandation :</strong> échographie cervicale et scintigraphie MIBI en priorité pour localisation pré-opératoire.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
