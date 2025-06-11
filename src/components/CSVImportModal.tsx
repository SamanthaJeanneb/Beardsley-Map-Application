import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface CSVImportModalProps {
  onClose: () => void;
  onImport: (file: File) => void;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({ onClose, onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setImportStatus('importing');
    try {
      await onImport(selectedFile);
      setImportStatus('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setImportStatus('error');
    }
  };

  const requiredFields = [
    'Name (or Long Name) - Project title',
    'City - Project location',
    'Project Type Description - Will be mapped to market sector',
    'Primary Client Name - Client information',
    'Address (optional) - Street address',
    'Compensation (optional) - Project value',
    'Project Manager Name (optional)',
    'Status Description (optional) - Active/Inactive/Dormant'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl z-50">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Import Projects from CSV</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
                dragActive
                  ? 'border-[#6d0020] bg-red-50'
                  : selectedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                {selectedFile ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-base sm:text-lg font-medium text-gray-900">
                        Drop your CSV file here, or tap to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Only CSV files are supported
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Import Status */}
            {importStatus === 'importing' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-800">Importing projects...</span>
              </div>
            )}

            {importStatus === 'success' && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800">Projects imported successfully!</span>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">Error importing file. Please check the format and try again.</span>
              </div>
            )}

            {/* Required Fields Information */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2 mb-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <h3 className="font-medium text-gray-900">Expected CSV Format</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Your CSV should include these fields (column headers can vary):
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {requiredFields.map((field, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-gray-300 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span className="break-words">{field}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile || importStatus === 'importing'}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2 bg-[#6d0020] hover:bg-[#5a001a] disabled:bg-gray-400 text-white rounded-lg transition-colors min-h-[44px]"
              >
                <Upload className="h-4 w-4" />
                <span>Import Projects</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;