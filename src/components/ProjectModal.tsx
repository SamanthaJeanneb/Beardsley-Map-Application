import React, { useState } from 'react';
import { X, MapPin, Building2, User, DollarSign, Calendar, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Project } from '../types/project';
import { MARKET_SECTORS } from '../data/marketSectors';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getSectorInfo = (marketSector: string) => {
    return MARKET_SECTORS.find(s => s.id === marketSector) || MARKET_SECTORS[0];
  };

  const sectorInfo = getSectorInfo(project.marketSector);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === project.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? project.imageUrls.length - 1 : prev - 1
    );
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${project.coordinates[0]},${project.coordinates[1]}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="relative">
            {/* Image Carousel */}
            <div className="relative h-80 bg-gray-200">
              {project.imageUrls.length > 0 && (
                <>
                  <img
                    src={project.imageUrls[currentImageIndex]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {project.imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      
                      {/* Image indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {project.imageUrls.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? 'bg-white'
                                : 'bg-white bg-opacity-50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Status badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'Active' 
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'Inactive'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: sectorInfo.color }}
                  />
                  <span className="text-sm font-medium text-gray-600">
                    {sectorInfo.name}
                  </span>
                  {project.featured && (
                    <span className="px-2 py-1 text-xs font-medium bg-[#f7941d] text-white rounded-full">
                      Featured
                    </span>
                  )}
                  {project.recent && (
                    <span className="px-2 py-1 text-xs font-medium bg-[#91982c] text-white rounded-full">
                      Recent
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h1>
                <button
                  onClick={openInMaps}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#6d0020] transition-colors group"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{project.address}, {project.city}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Client</span>
                </div>
                <p className="text-sm text-gray-900">{project.client}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Project Manager</span>
                </div>
                <p className="text-sm text-gray-900">{project.projectManager}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Compensation</span>
                </div>
                <p className="text-sm text-gray-900">${project.compensation.toLocaleString()}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Year</span>
                </div>
                <p className="text-sm text-gray-900">{project.year || 'TBD'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={openInMaps}
                className="flex items-center space-x-2 px-4 py-2 bg-[#91982c] hover:bg-[#7d8428] text-white rounded-lg transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span>View on Map</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${project.title} - ${project.city}\n${project.description}`);
                  alert('Project details copied to clipboard!');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-[#f7941d] hover:bg-[#e8851a] text-white rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;