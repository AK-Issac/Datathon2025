import { useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';

interface DocumentViewerProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

function DocumentViewer({ onFileUpload, isUploading }: DocumentViewerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // The component's only job is to pass the file up to the parent.
    onFileUpload(file);

  }, [onFileUpload]);

  const handleUploadClick = () => fileInputRef.current?.click();
  
  // The component is now just the initial placeholder/upload view.
  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center p-8">
          <Upload className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Analyze a New Regulation</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
            Upload a regulatory text, report, or any file (.pdf, .html, .txt) to begin the impact analysis.
          </p>
          <button 
            onClick={handleUploadClick} 
            disabled={isUploading} 
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors mx-auto"
          >
              {isUploading ? "Uploading..." : <><Upload className="w-4 h-4" /><span>Upload Document</span></>}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden"
            disabled={isUploading}
          />
      </div>
    </main>
  );
}

export default DocumentViewer;