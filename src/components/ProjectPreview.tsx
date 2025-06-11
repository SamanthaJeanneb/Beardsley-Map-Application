import React from 'react';
import { MapPin, Building2, DollarSign } from 'lucide-react';
import { Project } from '../types/project';
import { MARKET_SECTORS } from '../data/marketSectors';

interface ProjectPreviewProps {
  project: Project;
}

const ProjectPreview: React.FC<ProjectPreviewProps> = ({ project }) => {
  const getSectorInfo = (marketSector: string) => {
    return MARKET_SECTORS.find(s => s.id === marketSector) || MARKET_SECTORS[0];
  };

  const sectorInfo = getSectorInfo(project.marketSector);

  return (
    <div className="w-72 p-4">
      {/* Project Image */}
      {project.imageUrls.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={project.imageUrls[0]}
            alt={project.title}
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* Project Header */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: sectorInfo.color }}
          />
          <span className="text-sm font-medium text-gray-600">
            {sectorInfo.name}
          </span>
        
        </div>
        
        <h3 className="font-semibold text-gray-900 leading-tight mb-1">
          {project.title}
        </h3>
        
        {/* Building Type - displayed below title if present */}
        {project.buildingType && (
          <p className="text-sm text-gray-600 mb-2 italic">
            {project.buildingType}
          </p>
        )}
        
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{project.city}</span>
        </div>
      </div>

      {/* Project Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Building2 className="h-4 w-4 mr-2" />
          <span className="truncate">{project.client}</span>
        </div>
        
        {project.compensation > 0 && (
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>${project.compensation.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Project Description */}
      {project.description && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 line-clamp-3">
            {project.description}
          </p>
        </div>
      )}

      {/* Tags */}
      <div className="flex items-center space-x-2 mt-3">
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
    </div>
  );
};

export default ProjectPreview;