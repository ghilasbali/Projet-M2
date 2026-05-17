import { useAppStore } from './store/useStore';
import { ParathyroidType, AnalysisResults } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ClinicalInputForm } from './components/ClinicalInputForm';
import { CriticalAlertBanner } from './components/CriticalAlertBanner';
import { ResultsOutput } from './components/ResultsOutput';
import { PatientsCRUD } from './components/PatientsCRUD';
import { AbaquesEditor } from './components/AbaquesEditor';
import { ConfigMonitoring } from './components/ConfigMonitoring';
import { TreatmentProtocols } from './components/TreatmentProtocols';
import { AppointmentsPanel } from './components/AppointmentsPanel';
import { AboutPanel } from './components/AboutPanel';
import { EntryPage } from './components/EntryPage';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AdminUsers } from './components/AdminUsers';
import { JsonModal } from './components/JsonModal';

export default function App() {
  const store = useAppStore();

  const runAnalysis = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const hasManualValues = !!store.calcium && !!store.pth && !!store.phosphorus;
    const patientFiles = store.currentPatientForAI.patientFiles || [];
    const hasFiles = !!store.uploadedFile || patientFiles.length > 0;
    const hasSymptoms = !!store.symptomsText.trim();

    // Autoriser l'analyse si :
    // 1) symptômes + paramètres manuels
    // 2) symptômes + fichiers
    // 3) fichiers seuls
    if ((!hasManualValues && !hasFiles) || (!hasSymptoms && !hasFiles)) {
      alert("Veuillez renseigner des symptômes avec une méthode d'analyse (saisie manuelle ou fichiers), ou déposer des fichiers à analyser.");
      return;
    }

    store.setAnalysisState('loading');
    store.setLoadingProgress(5);
    store.setLoadingStepText("Allocation des tenseurs en mémoire...");
    store.addLog("Lancement de l'inférence IA...");

    setTimeout(() => {
      store.setLoadingProgress(45);
      store.setLoadingStepText("Extraction NLP des entités cliniques...");
      store.addLog("Analyse sémantique des symptômes en cours.");
    }, Math.floor(store.aiConfig.latencyMs * 0.3));

    setTimeout(() => {
      store.setLoadingProgress(85);
      store.setLoadingStepText("Classification des pathologies parathyroïdiennes...");
      store.addLog("Confrontation aux abaques de référence.");
    }, Math.floor(store.aiConfig.latencyMs * 0.7));

    setTimeout(() => {
      // Analyse des fichiers déposés : heuristiques sur noms/catégories/extensions
      const files = store.currentPatientForAI.patientFiles || [];
      const pendingUploadedText = store.uploadedFile ? `${store.uploadedFile.name}`.toLowerCase() : '';
      const fileText = `${pendingUploadedText} ` + files
        .map(f => `${f.name} ${f.category} ${f.type}`.toLowerCase())
        .join(' ');

      const inferFromFiles = () => {
        let inferredCa = parseFloat(store.calcium) || 0;
        let inferredPth = parseFloat(store.pth) || 0;
        let inferredPhos = parseFloat(store.phosphorus) || 0;

        // Heuristiques de documents/imageries
        if (!inferredCa && /(hypercalc|calc[eé]mie|calcium.*elev|elev.*calcium|ca\b.*high)/.test(fileText)) inferredCa = 11.4;
        if (!inferredPth && /(pth|parathorm|hyperpara|adenom|mibi|sestamibi)/.test(fileText)) inferredPth = 92;
        if (!inferredPhos && /(phosph|hypophosph|po4.*low)/.test(fileText)) inferredPhos = 2.2;
        if (!inferredCa && /(hypocalc|tetanie|thyroidectomie|post-thyroid)/.test(fileText)) inferredCa = 7.4;
        if (!inferredPth && /(hypopara|thyroidectomie|post-thyroid)/.test(fileText)) inferredPth = 9;
        if (!inferredPhos && /(hyperphosph|po4.*high)/.test(fileText)) inferredPhos = 5.6;

        return { inferredCa, inferredPth, inferredPhos };
      };

      const inferred = inferFromFiles();
      const caVal = parseFloat(store.calcium) || inferred.inferredCa || 0;
      const pthVal = parseFloat(store.pth) || inferred.inferredPth || 0;
      const phosVal = parseFloat(store.phosphorus) || inferred.inferredPhos || 0;

      const combinedText = `${store.symptomsText} ${fileText}`.toLowerCase();
      const keywordsDict = [
        "asthénie", "fatigue", "douleur", "os", "osseuse", "colique", "calcul", "rein", "néphrétique",
        "nausée", "vomissement", "confusion", "ostéopénie", "ostéoporose", "fracture",
        "paresthésie", "crampe", "spasme", "tétanie", "convulsion", "fourmillement",
        "adenome", "mibi", "sestamibi", "thyroidectomie", "hypercalc", "hypocalc", "parathormone", "calcémie"
      ];
      const foundKw = keywordsDict.filter(kw => combinedText.includes(kw));

      let nlpScore = Math.min(95, Math.max(25, foundKw.length * 10 + (files.length > 0 ? 40 : 30)));
      if (caVal > store.customNorms.caMax && foundKw.length > 0) nlpScore += 10;
      if (files.length > 0) nlpScore += Math.min(files.length * 3, 12);
      nlpScore = Math.floor(nlpScore * (store.aiConfig.nlpWeight / 100));
      nlpScore = Math.min(98, Math.max(5, nlpScore));

      let diagnosisType: ParathyroidType = 'normal';
      let prob = 10;
      let title = "", desc = "", code = "", diff = "";
      let investigations: string[] = [];

      if (caVal >= 12.0) {
        diagnosisType = 'hyperparathyroïdie_primaire';
        prob = 95;
        title = "Crise Hypercalcémique Sévère";
        desc = "Calcium > 12 mg/dL: risque vital immédiat. Trouble du rythme cardiaque ou coma possible. Réhydratation IV urgente, ECG, hospitalisation.";
        code = "E83.5";
        diff = "HPT primaire sévère, Myélome, Métastases osseuses, Intoxication Vit D";
        investigations = ["Hospitalisation urgence", "ECG immédiat", "Sérum physiologique IV", "Bilan tumoral"];
      } else if (caVal > store.customNorms.caMax && pthVal > store.customNorms.pthMax) {
        diagnosisType = 'hyperparathyroïdie_primaire';
        prob = 85;
        if (phosVal < store.customNorms.phosMin) prob += 10;
        title = "Hyperparathyroïdie Primaire (HPT1)";
        desc = `Hypercalcémie (Ca > ${store.customNorms.caMax}) + PTH élevée: profil typique d'adénome parathyroïdien.`;
        code = "E21.0";
        diff = "Hypercalcémie hypocalciurique familiale, Traitement par Lithium";
        investigations = ["Échographie cervicale", "Scintigraphie MIBI", "Calciurie 24h", "Densitométrie osseuse"];
      } else if (caVal > store.customNorms.caMax && pthVal <= store.customNorms.pthMax) {
        diagnosisType = 'normal';
        prob = 40;
        title = "Hypercalcémie Non Parathyroïdienne";
        desc = "PTH correctement freinée face à l'hypercalcémie: exclut HPT primaire.";
        code = "E83.52";
        diff = "Sarcoïdose, PTHrP tumorale, Hyperthyroïdie, Maladie de Paget";
        investigations = ["Bilan tumoral", "Scanner TAP", "EPP", "Vitamine D"];
      } else if (caVal < store.customNorms.caMin && pthVal < store.customNorms.pthMin) {
        diagnosisType = 'hypoparathyroïdie';
        prob = 85;
        title = "Hypoparathyroïdie";
        desc = "Hypocalcémie + PTH basse: déficit de sécrétion parathyroïdienne.";
        code = "E20.9";
        diff = "Hypoparathyroïdie auto-immune, Post-chirurgicale";
        investigations = ["Magnésémie", "Vitamine D", "Scanner cérébral"];
      } else if (caVal < store.customNorms.caMin && pthVal > store.customNorms.pthMax) {
        diagnosisType = 'pseudohypoparathyroïdie';
        prob = 75;
        title = "Pseudohypoparathyroïdie";
        desc = "Hypocalcémie + PTH élevée paradoxalement: résistance périphérique à la PTH.";
        code = "E20.1";
        diff = "Pseudo-hypo type 1a, 1b, 2";
        investigations = ["AMPc urinaire après PTH", "Radio mains/pieds", "Test génétique GNAS1"];
      } else if (pthVal > store.customNorms.pthMax && caVal <= store.customNorms.caMax) {
        diagnosisType = 'hyperparathyroïdie_secondaire';
        prob = 60;
        title = "Hyperparathyroïdie Secondaire Possible";
        desc = "PTH élevée avec calcium normal/bas: réponse compensatoire.";
        code = "E21.1";
        diff = "IRC, Carence sévère en vitamine D, Malabsorption";
        investigations = ["Créatinine + DFG", "Vitamine D", "Phosphorémie"];
      } else if (caVal >= store.customNorms.caMin && caVal <= store.customNorms.caMax && pthVal >= store.customNorms.pthMin && pthVal <= store.customNorms.pthMax) {
        diagnosisType = 'normal';
        prob = Math.floor(Math.random() * 5) + 2;
        title = "Bilan Phosphocalcique Normal";
        desc = "Tous les paramètres sont dans les intervalles normatifs.";
        code = "Z00.0";
        diff = "Aucun diagnostic différentiel requis";
        investigations = ["Surveillance clinique de routine"];
      } else {
        prob = 20;
        title = "Profil à interpréter";
        desc = "Le profil biologique ne correspond pas à un pattern typique.";
        code = "R79.8";
        diff = "À déterminer selon contexte clinique";
        investigations = ["Bilan complet phosphocalcique", "Consultation endocrinologie"];
      }

      const results: AnalysisResults = { caVal, pthVal, phosVal, foundKw, nlpScore, prob, title, desc, code, diff, diagnosisType, investigations };
      store.setResults(results);
      store.setAnalysisState('completed');
      store.addLog(`Analyse terminée. Diagnostic: ${title} (${prob}%)`);
      if (prob > 70 && diagnosisType !== 'normal') {
        store.setConfirmedDiagnosis(store.currentPatientForAI.id, diagnosisType);
        store.updatePatient(store.currentPatientForAI.id, { calcium: caVal, pth: pthVal, phosphorus: phosVal, symptomsText: store.symptomsText });
      }
    }, store.aiConfig.latencyMs);
  };

  const jsonPayloadData = {
    patient_id: store.currentPatientForAI.id,
    timestamp: new Date().toISOString(),
    clinical_data: { symptoms_raw: store.symptomsText, extracted_entities_count: store.results ? store.results.foundKw.length : 0 },
    biomarkers: { calcium_mg_dl: parseFloat(store.calcium) || 0, pth_pg_ml: parseFloat(store.pth) || 0, phosphorus_mg_dl: parseFloat(store.phosphorus) || 0 },
    model_parameters: { nlp_engine: 'ParaThyroDetect_NLP_v4', classifier: 'SupervisedMultiClass_PTH', sensitivity_weight: store.aiConfig.nlpWeight }
  };

  if (!store.isAuthenticated && !store.isGuest) {
    return (
      <EntryPage
        loginError={store.loginError}
        registerError={store.registerError}
        login={store.login}
        register={store.register}
        enterAsGuest={store.enterAsGuest}
        patients={store.patients.filter(p => p.role === 'medecin')}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50 text-slate-800 font-sans">
      <Header
        onLoadPreset={store.loadPreset}
        onResetForm={store.resetForm}
        onExportState={store.exportFullState}
        isAuthenticated={store.isAuthenticated}
        isGuest={store.isGuest}
        patientName={store.isAuthenticated ? `${store.currentPatientForAI.firstName} ${store.currentPatientForAI.lastName}` : undefined}
        userRole={store.isAuthenticated ? store.currentPatientForAI.role : undefined}
        onLogout={store.logout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={store.currentPage}
          setActiveTab={store.setCurrentPage}
          currentPatient={store.currentPatientForAI}
          analysisState={store.analysisState}
          isAuthenticated={store.isAuthenticated}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50">
          {store.currentPage === 'dashboard' && store.isAuthenticated && store.currentPatientForAI.role === 'admin' && (
            <ConfigMonitoring
              aiConfig={store.aiConfig}
              setAiConfig={store.setAiConfig}
              consoleLogs={store.consoleLogs}
              onClearLogs={store.clearLogs}
              onExportFullState={store.exportFullState}
              currentUser={store.currentPatientForAI}
              adminUpdateUser={store.adminUpdateUser}
            />
          )}
          {store.currentPage === 'dashboard' && store.isAuthenticated && store.currentPatientForAI.role === 'medecin' && (
            <DoctorDashboard
              doctor={store.currentPatientForAI}
              patients={store.patients}
              updateAppointment={store.updateAppointment}
              sendMessage={store.sendMessage}
              addLog={store.addLog}
            />
          )}
          {store.currentPage === 'dashboard' && (!store.isAuthenticated || store.currentPatientForAI.role === 'patient') && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
              <ClinicalInputForm
                symptoms={store.symptomsText}
                setSymptoms={store.setSymptomsText}
                calcium={store.calcium}
                setCalcium={store.setCalcium}
                pth={store.pth}
                setPth={store.setPth}
                phosphorus={store.phosphorus}
                setPhosphorus={store.setPhosphorus}
                uploadedFile={store.uploadedFile}
                setUploadedFile={store.setUploadedFile}
                customNorms={store.customNorms}
                onRunAnalysis={runAnalysis}
                analysisState={store.analysisState}
                onAppendSymptomTag={store.appendSymptomTag}
                patientFiles={store.currentPatientForAI.patientFiles || []}
                onAddPatientFile={(f) => store.addPatientFile(store.currentPatientForAI.id, f)}
                isAuthenticated={store.isAuthenticated}
              />
              <section className="lg:col-span-6 xl:col-span-7 space-y-6 flex flex-col">
                <CriticalAlertBanner calcium={store.calcium} pth={store.pth} />
                <ResultsOutput
                  analysisState={store.analysisState}
                  results={store.results}
                  customNorms={store.customNorms}
                  loadingProgress={store.loadingProgress}
                  loadingStepText={store.loadingStepText}
                  onOpenJsonModal={() => store.setShowJsonModal(true)}
                />
              </section>
            </div>
          )}

          {store.currentPage === 'patients' && (
            <PatientsCRUD
              patients={store.patients}
              currentUser={store.currentPatientForAI}
              isAuthenticated={store.isAuthenticated}
              isFirstSession={store.isFirstSession}
              createMedicalRecord={store.createMedicalRecord}
              lookupByAccessCode={store.lookupByAccessCode}
              addLog={store.addLog}
              setCurrentPage={store.setCurrentPage}
            />
          )}

          {store.currentPage === 'abaques' && (
            <AbaquesEditor
              customNorms={store.customNorms}
              setCustomNorms={store.setCustomNorms}
              onRestoreStandards={store.restoreStandardNorms}
              onNavigateDashboard={() => store.setCurrentPage('dashboard')}
            />
          )}

          {store.currentPage === 'config' && (
            <ConfigMonitoring
              aiConfig={store.aiConfig}
              setAiConfig={store.setAiConfig}
              consoleLogs={store.consoleLogs}
              onClearLogs={store.clearLogs}
              onExportFullState={store.exportFullState}
              currentUser={store.currentPatientForAI}
              adminUpdateUser={store.adminUpdateUser}
            />
          )}

          {store.currentPage === 'treatment' && (
            <TreatmentProtocols
              patient={store.currentPatientForAI}
              patients={store.patients}
              currentUser={store.currentPatientForAI}
              addMedication={store.addMedication}
              removeMedication={store.removeMedication}
              updateMedication={store.updateMedication}
            />
          )}

          {store.currentPage === 'appointments' && (
            <AppointmentsPanel
              patient={store.currentPatientForAI}
              patients={store.patients}
              addAppointment={store.addAppointment}
              updateAppointment={store.updateAppointment}
              sendMessage={store.sendMessage}
              isDoctorAvailable={store.isDoctorAvailable}
              changeDoctor={store.changeDoctor}
            />
          )}

          {store.currentPage === 'admin-users' && store.isAuthenticated && store.currentPatientForAI.role === 'admin' && (
            <AdminUsers
              patients={store.patients}
              doctorCodes={store.doctorCodes}
              adminDeleteUser={store.adminDeleteUser}
              adminUpdateUser={store.adminUpdateUser}
              adminAddDoctorCode={store.adminAddDoctorCode}
              adminDeleteDoctorCode={store.adminDeleteDoctorCode}
              addLog={store.addLog}
            />
          )}

          {store.currentPage === 'about' && <AboutPanel />}
        </main>
      </div>

      {store.showJsonModal && <JsonModal onClose={() => store.setShowJsonModal(false)} payload={jsonPayloadData} />}
    </div>
  );
}
