import React, { useState } from 'react';
import { ArrowLeft, MapPin, Building2, User, DollarSign, Calendar, ChevronLeft, ChevronRight, ExternalLink, Share2, Edit, MoreVertical, Trash2, Maximize } from 'lucide-react';
import { Project } from '../types/project';
import { MARKET_SECTORS } from '../data/marketSectors';
import FullscreenImageCarousel from './FullscreenImageCarousel';
import EditProjectModal from './EditProjectModal';

interface ProjectPageProps {
  project: Project;
  onBack: () => void;
  allProjects: Project[];
  onUpdateProject?: (updatedProject: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ 
  project, 
  onBack, 
  allProjects,
  onUpdateProject,
  onDeleteProject
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreenCarousel, setShowFullscreenCarousel] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if admin features are available
  const isAdminMode = onUpdateProject && onDeleteProject;

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

  const shareProject = async () => {
    const projectUrl = `${window.location.origin}${window.location.pathname}#project-${project.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: `Check out this project: ${project.title} in ${project.city}`,
          url: projectUrl,
        });
      } catch (error) {
        // Fallback to clipboard if share fails
        await navigator.clipboard.writeText(projectUrl);
        alert('Project link copied to clipboard!');
      }
    } else {
      try {
        await navigator.clipboard.writeText(projectUrl);
        alert('Project link copied to clipboard!');
      } catch (error) {
        // Final fallback - show the URL
        prompt('Copy this project link:', projectUrl);
      }
    }
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowFullscreenCarousel(true);
  };

  const handleEditProject = async (updatedProject: Project) => {
    if (!onUpdateProject) return;
    
    setIsUpdating(true);
    try {
      await onUpdateProject(updatedProject);
      setShowEditModal(false);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error updating project:', error);
      // Error is already handled in the parent component
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!onDeleteProject) return;
    
    const confirmMessage = `Are you sure you want to delete "${project.title}"?\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      setIsDeleting(true);
      setShowDropdown(false);
      
      try {
        await onDeleteProject(project.id);
        // The parent component will handle navigation back to map
      } catch (error) {
        console.error('Error deleting project:', error);
        // Error is already handled in the parent component
        setIsDeleting(false);
      }
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    setShowDropdown(false);
  };

  // Find related projects in the same city or market sector
  const relatedProjects = allProjects
    .filter(p => 
      p.id !== project.id && 
      (p.city === project.city || p.marketSector === project.marketSector)
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-[#6d0020] transition-colors min-h-[44px]"
              disabled={isDeleting}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Map</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={shareProject}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-[#f7941d] hover:bg-[#e8851a] text-white rounded-lg transition-colors min-h-[44px]"
                disabled={isDeleting}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Loading overlay for delete operation */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3 mx-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6d0020]"></div>
            <span className="text-gray-900">Deleting project...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Hero Image Section */}
            <div className="relative">
              <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-2xl overflow-hidden">
                {project.imageUrls.length > 0 && (
                  <>
                    <button
                      onClick={() => handleImageClick(currentImageIndex)}
                      className="w-full h-full group cursor-pointer"
                    >
                      <img
                        src={project.imageUrls[currentImageIndex]}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <Maximize className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                    
                    {project.imageUrls.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all min-h-[44px] min-w-[44px]"
                        >
                          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all min-h-[44px] min-w-[44px]"
                        >
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        
                        {/* Image indicators */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {project.imageUrls.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-1 h-1 sm:w-3 sm:h-1 rounded-full transition-all min-h-[11px] min-w-[11px] ${
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
            </div>

            {/* Project Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: sectorInfo.color }}
                />
                <span className="text-sm font-medium text-gray-600">
                  {sectorInfo.name}
                </span>
                
                {project.featured && (
                  <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-[#f7941d] text-white rounded-full">
                    Featured
                  </span>
                )}
                {project.recent && (
                  <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-[#91982c] text-white rounded-full">
                    Recent
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
              
              <button
                onClick={openInMaps}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#6d0020] transition-colors group mb-6 min-h-[44px]"
              >
                <MapPin className="h-5 w-5" />
                <span className="text-base sm:text-lg">{project.city}</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Project Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Project Overview</h2>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                {project.description}
              </p>
            </div>

            {/* Image Gallery */}
            {project.imageUrls.length > 1 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Project Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {project.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageClick(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden transition-all group min-h-[120px] ${
                        index === currentImageIndex 
                          ? 'ring-4 ring-[#6d0020] ring-opacity-50' 
                          : 'hover:scale-105'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${project.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <Maximize className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm relative">
              {/* Three-dot menu in top right corner - only show if admin mode */}
              {isAdminMode && (
                <div className="absolute top-4 right-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
                      disabled={isDeleting || isUpdating}
                    >
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                          onClick={handleEditClick}
                          disabled={isDeleting || isUpdating}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
                        >
                          <Edit className="h-4 w-4" />
                          <span>{isUpdating ? 'Updating...' : 'Edit Project'}</span>
                        </button>
                        <button
                          onClick={handleDeleteProject}
                          disabled={isDeleting || isUpdating}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <h3 className={`text-lg sm:text-xl font-bold text-gray-900 mb-6 ${isAdminMode ? 'pr-12' : ''}`}>Project Details</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Client</span>
                  </div>
                  <p className="text-gray-900 font-medium">{project.client}</p>
                </div>
                
                {project.projectManager && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Project Manager</span>
                    </div>
                    <p className="text-gray-900 font-medium">{project.projectManager}</p>
                  </div>
                )}
                
                {project.buildingType && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">Project Type</span>
                    </div>
                    <p className="text-gray-900 font-medium text-lg sm:text-xl">{project.buildingType}</p>
                  </div>
                )}

                {/* Project Value - Only show to admins */}
                {isAdminMode && project.compensation > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Project Value</span>
                    </div>
                    <p className="text-gray-900 font-medium text-lg">${project.compensation.toLocaleString()}</p>
                  </div>
                )}

                {project.year && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Year</span>
                    </div>
                    <p className="text-gray-900 font-medium">{project.year}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Related Projects */}
            {relatedProjects.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Related Projects</h3>
                <div className="space-y-4">
                  {relatedProjects.map((relatedProject) => {
                    const relatedSector = getSectorInfo(relatedProject.marketSector);
                    return (
                      <button
                        key={relatedProject.id}
                        onClick={() => window.location.href = `#project-${relatedProject.id}`}
                        className="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 min-h-[80px]"
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0 mt-2"
                            style={{ backgroundColor: relatedSector.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
                              {relatedProject.title}
                            </h4>
                            <p className="text-sm text-gray-500">{relatedProject.city}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Carousel */}
      {showFullscreenCarousel && (
        <FullscreenImageCarousel
          images={project.imageUrls}
          initialIndex={currentImageIndex}
          onClose={() => setShowFullscreenCarousel(false)}
          projectTitle={project.title}
        />
      )}

      {/* Edit Project Modal - only show if admin mode */}
      {showEditModal && isAdminMode && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditProject}
        />
      )}

      {/* Click outside dropdown to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ProjectPage;