import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Loader } from 'lucide-react';
import { Project } from '../types/project';
import { MARKET_SECTORS } from '../data/marketSectors';

interface BulkDeleteModalProps {
  projectIds: string[];
  projects: Project[];
  onClose: () => void;
  onConfirm: (projectIds: string[]) => Promise<void>;
}

const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  projectIds,
  projects,
  onClose,
  onConfirm
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedProjects = projects.filter(p => projectIds.includes(p.id));

  const getSectorInfo = (marketSector: string) => {
    return MARKET_SECTORS.find(s => s.id === marketSector) || MARKET_SECTORS[0];
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(projectIds);
    } catch (error) {
      console.error('Error deleting projects:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl z-50">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Delete {selectedProjects.length} Project{selectedProjects.length !== 1 ? 's' : ''}
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the following {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}? 
                This action cannot be undone.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Warning</h4>
                    <p className="text-sm text-red-700">
                      All project data, including images and details, will be permanently removed from the database.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project List */}
            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
              {selectedProjects.map((project, index) => {
                const sectorInfo = getSectorInfo(project.marketSector);
                return (
                  <div
                    key={project.id}
                    className={`p-4 flex items-start space-x-3 ${
                      index !== selectedProjects.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-2"
                      style={{ backgroundColor: sectorInfo.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">
                        {project.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {project.client} • {project.city}
                      </p>
                      {project.buildingType && (
                        <p className="text-sm text-gray-500 italic">
                          {project.buildingType}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900">
                        ${project.compensation.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sectorInfo.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="w-full sm:w-auto px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors min-h-[44px]"
              >
                {isDeleting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete {selectedProjects.length} Project{selectedProjects.length !== 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkDeleteModal;