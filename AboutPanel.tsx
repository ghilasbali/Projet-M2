import { Brain, Shield, Activity, Heart, GraduationCap, AlertTriangle } from 'lucide-react';

export function AboutPanel() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a56db] to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Activity className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">ParaThyroDetect</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm">
          Système intelligent de détection et de gestion des pathologies parathyroïdiennes par apprentissage supervisé
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-[#1a56db] rounded-full text-xs font-bold">React 19</span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">TypeScript</span>
          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">Tailwind v4</span>
        </div>
      </div>

      {/* Parathyroïdie */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <GraduationCap size={20} className="text-[#1a56db]" /> Qu'est-ce que la Parathyroïdie ?
        </h2>
        <div className="text-sm text-slate-600 space-y-3">
          <p>
            Les <strong>glandes parathyroïdes</strong> (4 petites glandes derrière la thyroïde) produisent la <strong>parathormone (PTH)</strong>, 
            essentielle à la régulation du calcium et du phosphore.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <h4 className="font-bold text-red-700 text-sm mb-1">HPT Primaire ★</h4>
              <p className="text-xs text-slate-600">Adénome parathyroïdien (85%). PTH↑ Ca↑ P↓</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <h4 className="font-bold text-orange-700 text-sm mb-1">HPT Secondaire</h4>
              <p className="text-xs text-slate-600">IRC, carence Vit D. PTH↑ Ca↓/N P↑</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <h4 className="font-bold text-purple-700 text-sm mb-1">HPT Tertiaire</h4>
              <p className="text-xs text-slate-600">Post-greffe rénale. PTH↑ Ca↑</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <h4 className="font-bold text-blue-700 text-sm mb-1">Hypoparathyroïdie</h4>
              <p className="text-xs text-slate-600">Post-thyroïdectomie. PTH↓ Ca↓ P↑</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <h4 className="font-bold text-green-700 text-sm mb-1">Pseudo-hypo</h4>
              <p className="text-xs text-slate-600">Résistance à PTH. PTH↑ Ca↓ P↑</p>
            </div>
          </div>
        </div>
      </div>

      {/* Système IA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Brain size={20} className="text-[#1a56db]" /> Notre Système d'IA
        </h2>
        <div className="text-sm text-slate-600 space-y-3">
          <p>
            ParaThyroDetect utilise un système de <strong>classification multi-classes par apprentissage supervisé</strong> pour analyser
            les symptômes et résultats biologiques.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="font-bold text-[#1a56db] mb-2">Analyse NLP des symptômes</h4>
              <p className="text-xs text-slate-600">
                Extraction des entités cliniques (asthénie, douleurs osseuses, coliques néphrétiques...)
                avec scoring pondéré pour chaque pathologie.
              </p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <h4 className="font-bold text-emerald-700 mb-2">Classification biologique</h4>
              <p className="text-xs text-slate-600">
                Profils biochimiques (PTH, Ca, P, Vit D) comparés aux abaques personnalisables
                avec patterns discriminants appris.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-emerald-600" /> Confidentialité & Sécurité
        </h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span><strong>Stockage local:</strong> Données conservées uniquement sur votre appareil (localStorage)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span><strong>Export JSON:</strong> Sauvegarde complète des données à tout moment</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span><strong>API Ready:</strong> Architecture prête pour intégration Flask/FastAPI backend</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Avertissement Médical</h3>
            <p className="text-xs text-slate-600">
              ParaThyroDetect est un <strong>outil d'aide au diagnostic</strong> et ne remplace en aucun cas
              l'avis d'un professionnel de santé qualifié. Les résultats fournis sont indicatifs et doivent
              être confirmés par un médecin endocrinologue.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-4">
        <p className="flex items-center justify-center gap-1">
          Fait avec <Heart size={12} className="text-red-400" /> pour la santé parathyroïdienne
        </p>
        <p className="mt-1">© 2025 ParaThyroDetect – IA Supervisée v4.0</p>
      </div>
    </div>
  );
}


export const VISITOR_GUIDE = `Parcours patient : 1) saisir les symptômes 2) choisir une méthode d'analyse manuelle ou par fichiers médicaux 3) lancer l'analyse IA 4) créer un dossier médical sécurisé 5) consulter les traitements et rendez-vous 6) communiquer directement avec le médecin 7) demander un changement de rendez-vous ou de médecin. Parcours médecin : accès sécurisé par code admin, consultation des dossiers autorisés, gestion des traitements, rendez-vous et messagerie.`;
