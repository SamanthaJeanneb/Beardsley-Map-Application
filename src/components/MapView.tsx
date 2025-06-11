import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { divIcon, LatLngBounds } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Project } from '../types/project';
import { MARKET_SECTORS } from '../data/marketSectors';
import RadialMenu from './RadialMenu';
import ProjectHoverPopup from './ProjectHoverPopup';
import 'leaflet/dist/leaflet.css';

declare global {
  interface Window {
    L: any;
  }
}

interface MapViewProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  isFullscreen?: boolean;
  isAdminMode?: boolean;
  selectedProjectIds?: Set<string>;
  onToggleProjectSelection?: (projectId: string) => void;
}

const createPinIcon = (
  color: string,
  isSelected: boolean = false,
  isAdminMode: boolean = false
) => {
  const selectionRing = isSelected
    ? `<circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="3"/>`
    : '';
  const adminCheckbox = isAdminMode
    ? `
      <g transform="translate(18, 2)">
        <rect x="0" y="0" width="12" height="12" rx="2" fill="white" stroke="#374151" stroke-width="1" data-checkbox="true"/>
        ${
          isSelected
            ? '<path d="M2 6l3 3 5-5" stroke="#059669" stroke-width="2" fill="none" data-checkbox="true"/>'
            : ''
        }
      </g>
    `
    : '';

  return divIcon({
    html: `
      <div class="relative transform transition-transform">
        <svg width="${isAdminMode ? '32' : '24'}" height="32" viewBox="0 0 ${
      isAdminMode ? '32' : '24'
    } 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.373 0 0 5.373 0 12C0 18.627 12 32 12 32C12 32 24 18.627 24 12C24 5.373 18.627 0 12 0Z" fill="${color}"/>
          <path d="M12 0C5.373 0 0 5.373 0 12C0 18.627 12 32 12 32C12 32 24 18.627 24 12C24 5.373 18.627 0 12 0Z" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="12" r="6" fill="white"/>
          ${selectionRing}
          ${adminCheckbox}
        </svg>
      </div>
    `,
    className: 'custom-pin-marker',
    iconSize: [isAdminMode ? 32 : 24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  });
};

const MapUpdater: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const map = useMap();

  useEffect(() => {
    if (projects.length > 0 && typeof window !== 'undefined' && window.L) {
      const bounds = new LatLngBounds(projects.map((project) => project.coordinates));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [projects, map]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({
  projects,
  onProjectSelect,
  isFullscreen = false,
  isAdminMode = false,
  selectedProjectIds = new Set(),
  onToggleProjectSelection,
}) => {
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [radialMenuPosition, setRadialMenuPosition] = useState({ x: 0, y: 0 });
  const [clusteredProjects, setClusteredProjects] = useState<Project[]>([]);
  const [hoveredProject, setHoveredProject] = useState<{
    project: Project;
    position: { x: number; y: number };
  } | null>(null);
  const mapRef = useRef<any>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const getMarkerColor = (marketSector: string) => {
    const sector = MARKET_SECTORS.find((s) => s.id === marketSector);
    return sector?.color || '#6d0020';
  };

  const groupProjectsByLocation = (projects: Project[]) => {
    const groups: Project[][] = [];
    const processed = new Set<string>();

    projects.forEach((project) => {
      if (processed.has(project.id)) return;

      const group = [project];
      processed.add(project.id);

      projects.forEach((otherProject) => {
        if (processed.has(otherProject.id)) return;

        const distance = getDistance(
          project.coordinates[0],
          project.coordinates[1],
          otherProject.coordinates[0],
          otherProject.coordinates[1]
        );

        if (distance < 0.001) {
          group.push(otherProject);
          processed.add(otherProject.id);
        }
      });

      groups.push(group);
    });

    return groups;
  };

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleMarkerClick = (projectGroup: Project[], event: any) => {
    setHoveredProject(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    const targetEl = event.originalEvent?.target;
    const clickedCheckbox = targetEl?.getAttribute('data-checkbox') === 'true';

    if (isAdminMode && onToggleProjectSelection && clickedCheckbox && projectGroup.length === 1) {
      onToggleProjectSelection(projectGroup[0].id);
      return;
    }

    if (projectGroup.length === 1) {
      onProjectSelect(projectGroup[0]);
    } else {
      const rect = mapRef.current.getContainer().getBoundingClientRect();
      const x = event.originalEvent.clientX - rect.left;
      const y = event.originalEvent.clientY - rect.top;

      setRadialMenuPosition({ x, y });
      setClusteredProjects(projectGroup);
      setShowRadialMenu(true);
    }
  };

  const handleMarkerMouseEnter = (projectGroup: Project[], event: any) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (projectGroup.length === 1) {
      hoverTimeoutRef.current = setTimeout(() => {
        const rect = mapRef.current.getContainer().getBoundingClientRect();
        const x = event.originalEvent.clientX - rect.left;
        const y = event.originalEvent.clientY - rect.top;

        setHoveredProject({
          project: projectGroup[0],
          position: { x, y },
        });
      }, 300);
    }
  };

  const handleMarkerMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredProject(null);
    }, 100);
  };

  const closeRadialMenu = () => {
    setShowRadialMenu(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const projectGroups = groupProjectsByLocation(projects);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[43.0, -75.0]}
        zoom={7}
        className="w-full h-full z-0"
        ref={mapRef}
        zoomControl={!isFullscreen}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapUpdater projects={projects} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            return divIcon({
              html: `
                <div class="cluster-marker">
                  <div class="cluster-inner">
                    <span>${count}</span>
                  </div>
                </div>
              `,
              className: 'custom-cluster-marker',
              iconSize: [40, 40],
            });
          }}
        >
          {projectGroups.map((group, groupIndex) => {
            const representativeProject = group[0];
            const isSelected = group.some((p) => selectedProjectIds.has(p.id));

            return (
              <Marker
                key={`group-${groupIndex}`}
                position={representativeProject.coordinates}
                icon={createPinIcon(
                  getMarkerColor(representativeProject.marketSector),
                  isSelected,
                  isAdminMode
                )}
                eventHandlers={{
                  click: (e) => handleMarkerClick(group, e),
                  mouseover: (e) => handleMarkerMouseEnter(group, e),
                  mouseout: handleMarkerMouseLeave,
                }}
              />
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {hoveredProject && (
        <ProjectHoverPopup
          project={hoveredProject.project}
          position={hoveredProject.position}
        />
      )}

      {showRadialMenu && (
        <div className="absolute inset-0 z-30">
          <RadialMenu
            position={radialMenuPosition}
            projects={clusteredProjects}
            onSelectProject={onProjectSelect}
            onClose={closeRadialMenu}
          />
        </div>
      )}

      <style jsx>{`
        .cluster-marker {
          background: #6d0020;
          border: 3px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .cluster-inner {
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default MapView;