import { X, Network } from 'lucide-react';

interface JsonModalProps {
  onClose: () => void;
  payload: object;
}

export function JsonModal({ onClose, payload }: JsonModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Network size={16} className="text-[#1a56db]" /> Payload API (Flask / FastAPI)
          </h4>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-slate-500 my-3">
          Payload JSON prêt à être envoyé via <code className="bg-slate-100 px-1 py-0.5 rounded">POST /predict</code>
        </p>
        <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-64">
          {JSON.stringify(payload, null, 2)}
        </pre>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-[#1a56db] text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
