import React, { useEffect, useState } from 'react';
import { Eye, Share2, MapPin, Building2, X } from 'lucide-react';
import { Project } from '../types/project';
import { MARKET_SECTORS } from '../data/marketSectors';

interface RadialMenuProps {
  position: { x: number; y: number };
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onClose: () => void;
}

const RadialMenu: React.FC<RadialMenuProps> = ({
  position,
  projects,
  onSelectProject,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.radial-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getMarkerColor = (marketSector: string) => {
    const sector = MARKET_SECTORS.find(s => s.id === marketSector);
    return sector?.color || '#6d0020';
  };

  const getSectorName = (marketSector: string) => {
    const sector = MARKET_SECTORS.find(s => s.id === marketSector);
    return sector?.name || 'Unknown';
  };

  // Calculate responsive positioning
  const menuWidth = 320;
  const menuHeight = Math.min(400, projects.length * 80 + 120);
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let left = Math.min(position.x, viewportWidth - menuWidth - 20);
  let top = Math.min(position.y, viewportHeight - menuHeight - 20);
  
  // Ensure menu doesn't go off-screen on mobile
  if (viewportWidth < 640) {
    left = 20;
    top = Math.max(20, Math.min(position.y, viewportHeight - menuHeight - 20));
  }

  return (
    <div
      className="fixed z-50 radial-menu"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: viewportWidth < 640 ? 'calc(100vw - 40px)' : `${menuWidth}px`,
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl border border-gray-200 p-4 transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Building2 className="h-4 w-4 mr-2 text-[#6d0020]" />
            {projects.length} Projects Here
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px]"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 group min-h-[80px]"
            >
              <div className="flex items-start space-x-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 mt-2"
                  style={{ backgroundColor: getMarkerColor(project.marketSector) }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 group-hover:text-[#6d0020] transition-colors line-clamp-2 mb-1">
                    {project.title}
                  </h4>
                  {/* Building Type - displayed below title if present */}
                  {project.buildingType && (
                    <p className="text-sm text-gray-500 italic mb-1">{project.buildingType}</p>
                  )}
                  <p className="text-sm text-gray-500 mb-1 truncate">{project.client}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="truncate">{getSectorName(project.marketSector)}</span>
                    <span className="ml-2 flex-shrink-0">${project.compensation.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RadialMenu;