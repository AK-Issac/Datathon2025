// src/pages/Workspace.tsx

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import DocumentViewer from '../components/DocumentViewer';
import AIPanel from '../components/AIPanel'; // We'll keep the component for layout
import { uploadAndStartAnalysis } from '../services/apiService';
import { Loader2, FileCheck2 } from 'lucide-react';

// --- Helper Component for the "In Progress" View ---
function AnalysisInProgress({ docId }: { docId: string }) {
  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center p-8">
        <Loader2 className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4 animate-spin" />
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Analysis in Progress
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
          Your file has been securely uploaded. The AI analysis pipeline has been triggered.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-600 font-mono">
          Document ID: {docId}
        </p>
      </div>
    </main>
  );
}

// --- Helper Component for the "Complete" View (Placeholder) ---
function ResultsDashboard({ results }: { results: any }) {
    return (
        <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <FileCheck2 className="w-8 h-8 text-green-500" />
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Analysis Complete
                    </h2>
                </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Mock Results:</h3>
                    <pre className="text-left bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm">
                        {JSON.stringify(results, null, 2)}
                    </pre>
                </div>
            </div>
        </main>
    );
}

// --- Main Workspace Component ---
function Workspace() {
  type AnalysisStatus = 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'COMPLETE' | 'ERROR';
  
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('IDLE');
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [refreshSidebarKey, setRefreshSidebarKey] = useState(false);

  const handleFileUpload = async (file: File) => {
    setAnalysisStatus('UPLOADING');
    try {
      // 1. Call the new API service to send the file to the Flask backend
      const result = await uploadAndStartAnalysis(file);
      
      // 2. The backend returns a document_id. Store it.
      setCurrentDocId(result.document_id);
      
      // 3. Update UI to show the "processing" state.
      setAnalysisStatus('PROCESSING');
      
      // --- MOCKING THE ASYNC LAMBDA WORKFLOW ---
      // In the future, you'll poll a /status endpoint here.
      // For now, we simulate a 5-second wait before showing "Complete".
      setTimeout(() => {
        const mockResults = {
          "message": "This is a mock result. The analysis pipeline would produce the real data.",
          "document_id": result.document_id,
          "original_filename": file.name,
        };
        setAnalysisResult(mockResults);
        setAnalysisStatus('COMPLETE');
        setRefreshSidebarKey(prev => !prev); // Trigger sidebar to refresh
      }, 5000);

    } catch (error) {
      console.error("Error during upload:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
      setAnalysisStatus('ERROR');
    }
  };

  // Resets the view to allow for a new upload
  const handleNewAnalysis = () => {
    setAnalysisStatus('IDLE');
    setCurrentDocId(null);
    setAnalysisResult(null);
  };

  // This will eventually be used to load past results from the sidebar
  const handleSelectAnalysis = (docId: string) => {
    console.log(`Loading history for document: ${docId}`);
    // Future logic: fetch completed results from a /results/<docId> endpoint
  };

  const renderMainContent = () => {
    switch (analysisStatus) {
      case 'UPLOADING':
      case 'PROCESSING':
        return <AnalysisInProgress docId={currentDocId!} />;
      case 'COMPLETE':
        return <ResultsDashboard results={analysisResult} />;
      case 'ERROR':
        return (
          <main className="flex-1 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="text-center p-8">
              <h3 className="text-xl font-semibold text-red-500">Upload Failed</h3>
              <button onClick={handleNewAnalysis} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded">Try Again</button>
            </div>
          </main>
        );
      case 'IDLE':
      default:
        return <DocumentViewer onFileUpload={handleFileUpload} isUploading={analysisStatus === 'UPLOADING'} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          selectedDocument={currentDocId}
          onSelectDocument={handleSelectAnalysis}
          onNewChat={handleNewAnalysis} // The "New Chat" button now starts a new analysis
          refreshKey={refreshSidebarKey}
          onDeleteDocument={() => {}} // Placeholder for now
        />
        
        {renderMainContent()}

        {/* The AI panel is kept for layout but is not functional in this phase */}
        <AIPanel
          documentId={analysisStatus === 'COMPLETE' ? currentDocId : null}
          messages={[]}
          onSendMessage={() => {}}
          onRequestSummary={() => {}}
          isLoading={false}
          mode="chat"
          onModeChange={() => {}}
          highlightedText=""
        />
      </div>
    </div>
  );
}

export default Workspace;