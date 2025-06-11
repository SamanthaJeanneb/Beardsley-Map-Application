import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Plus, Upload, Download, LogOut, Trash2, CheckSquare, Square } from 'lucide-react';
import { ChevronDown } from 'lucide-react'; // Make sure this import is included


interface AdminDropdownProps {
  onAddProject: () => void;
  onImportCSV: () => void;
  onExportCSV: () => void;
  onLogout: () => void;
  selectedCount: number;
  onBulkDelete: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const AdminDropdown: React.FC<AdminDropdownProps> = ({
  onAddProject,
  onImportCSV,
  onExportCSV,
  onLogout,
  selectedCount,
  onBulkDelete,
  onSelectAll,
  onClearSelection
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
<button
  onClick={() => setIsOpen(!isOpen)}
  className="flex items-center space-x-2 px-4 py-2 bg-[#6d0020] hover:bg-[#5a001a] text-white rounded-lg transition-colors min-h-[44px]"
  title="Admin Actions"
>
  <span>Admin</span>
  {selectedCount > 0 && (
    <span className="bg-white text-[#6d0020] text-xs px-2 py-1 rounded-full font-medium">
      {selectedCount}
    </span>
  )}
  <ChevronDown
    className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
  />
</button>


      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Project Management
            </p>
          </div>
          
          <button
            onClick={() => handleAction(onAddProject)}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
          >
            <Plus className="h-4 w-4 text-[#6d0020]" />
            <span>Add Project</span>
          </button>
          
          <button
            onClick={() => handleAction(onImportCSV)}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
          >
            <Upload className="h-4 w-4 text-[#f7941d]" />
            <span>Import CSV</span>
          </button>
          
          <button
            onClick={() => handleAction(onExportCSV)}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
          >
            <Download className="h-4 w-4 text-[#91982c]" />
            <span>Export CSV</span>
          </button>

          <div className="border-t border-gray-100 mt-1">
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Bulk Actions
              </p>
            </div>
            
            <button
              onClick={() => handleAction(onSelectAll)}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
            >
              <CheckSquare className="h-4 w-4 text-blue-600" />
              <span>Select All</span>
            </button>

            {selectedCount > 0 && (
              <>
                <button
                  onClick={() => handleAction(onClearSelection)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                >
                  <Square className="h-4 w-4 text-gray-600" />
                  <span>Clear Selection</span>
                </button>
                
                <button
                  onClick={() => handleAction(onBulkDelete)}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Selected ({selectedCount})</span>
                </button>
              </>
            )}
          </div>

          <div className="border-t border-gray-100 mt-1">
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Session
              </p>
            </div>
            
            <button
              onClick={() => handleAction(onLogout)}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDropdown;