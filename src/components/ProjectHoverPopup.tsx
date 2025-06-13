import React from 'react';
import { Project } from '../types/project';
import { MARKET_SECTORS } from '../data/marketSectors';

interface ProjectHoverPopupProps {
  project: Project;
  position: { x: number; y: number };
  isAdminMode?: boolean;
}

const ProjectHoverPopup: React.FC<ProjectHoverPopupProps> = ({ 
  project, 
  position, 
  isAdminMode = false 
}) => {
  const getSectorInfo = (marketSector: string) => {
    return MARKET_SECTORS.find(s => s.id === marketSector) || MARKET_SECTORS[0];
  };

  const sectorInfo = getSectorInfo(project.marketSector);

  // Much larger offsets to ensure popup never overlaps with clickable area
  const popupWidth = 280;
  const popupHeight = project.imageUrls.length > 0 ? 120 : 120;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Position popup with VERY large offset to ensure it never overlaps the pin
  let left = position.x + 20; // Much larger offset to the right
  let top = position.y - popupHeight - 20; // Much larger offset above
  
  // Adjust if popup would go off right edge - move to left side with large offset
  if (left + popupWidth > viewportWidth - 20) {
    left = position.x - popupWidth - 20; // Show well to the left with large gap
  }
  
  // Adjust if popup would go off top edge - move below with large offset
  if (top < 20) {
    top = position.y + 20; // Show well below the pin with large gap
  }
  
  // Ensure popup doesn't go off left edge
  if (left < 20) {
    left = 20;
  }

  return (
    <div
      className="fixed z-20 pointer-events-none select-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${popupWidth}px`,
        pointerEvents: 'none', // Explicitly disable all pointer events
        userSelect: 'none', // Disable text selection
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
        style={{ pointerEvents: 'none' }} // Double ensure no pointer events
      >
        {/* Cover Image */}
        {project.imageUrls.length > 0 && (
          <div className="h-20 bg-gray-200 overflow-hidden">
            <img
              src={project.imageUrls[0]}
              alt={project.title}
              className="w-full h-full object-cover"
              style={{ pointerEvents: 'none' }}
              draggable={false}
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-3" style={{ pointerEvents: 'none' }}>
          {/* Market Sector and Building Type */}
          <div className="flex items-center space-x-2 mb-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: sectorInfo.color, pointerEvents: 'none' }}
            />
            <span className="text-sm font-medium text-gray-700 truncate">
              {sectorInfo.name}
            </span>
            {project.buildingType && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600 truncate">
                  {project.buildingType}
                </span>
              </>
            )}
          </div>
          
          {/* Project Title */}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
            {project.title}
          </h3>
          
          {/* Mini Description - Show if available */}
          {project.miniDescription && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-1">
              {project.miniDescription}
            </p>
          )}

          {/* Project Value - Only show to admins */}
          {isAdminMode && project.compensation > 0 && (
            <p className="text-xs text-green-600 font-medium">
              ${project.compensation.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectHoverPopup;