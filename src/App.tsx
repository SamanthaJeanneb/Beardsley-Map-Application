import React, { useState, useEffect } from 'react';
import { Filter, Search, MapPin, Maximize, Minimize, Menu, X, MoreVertical } from 'lucide-react';
import MapView from './components/MapView';
import ProjectPage from './components/ProjectPage';
import FilterPanel from './components/FilterPanel';
import AddProjectModal from './components/AddProjectModal';
import CSVImportModal from './components/CSVImportModal';
import AdminLogin from './components/AdminLogin';
import AdminDropdown from './components/AdminDropdown';
import BulkDeleteModal from './components/BulkDeleteModal';
import StatsPanel from './components/StatsPanel';
import { Project, FilterState } from './types/project';
import { parseCSV, exportToCSV } from './utils/csvParser';
import { projectDB } from './utils/database';

// Sample projects data to start with (only used if database is empty)
const sampleProjects: Omit<Project, 'id'>[] = [
  {
    title: 'BMPC BMPI NN801 Electronic Network',
    address: 'Knolls',
    city: 'West Milton',
    coordinates: [43.0184, -73.8190],
    marketSector: 'industrial',
    buildingType: 'Manufacturing Facility',
    description: 'State-of-the-art industrial facility featuring advanced electronic network infrastructure for marine propulsion systems. This project showcases cutting-edge technology integration and sustainable design principles.',
    imageUrls: [
      'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg',
      'https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg'
    ],
    client: 'Fluor Marine Propulsion, LLC',
    projectManager: 'Andrea DeLany, CBCP',
    status: 'Active',
    compensation: 114600,
    year: 2024,
    featured: true,
    recent: true,
  },
  {
    title: 'Parks Horse Island Additional Design Services',
    address: 'Thousand Islands Reg',
    city: 'Sackets Harbor',
    coordinates: [43.9469, -76.1188],
    marketSector: 'parks',
    buildingType: 'Visitor Center',
    description: 'Comprehensive design services for recreational facility enhancement, focusing on visitor experience and environmental preservation. The project includes modern amenities while respecting the natural landscape.',
    imageUrls: [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
      'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg'
    ],
    client: 'New York State Office of Parks, Recreation & Historic Preservation',
    projectManager: 'Thomas Ascienzo, LEED AP BD+C',
    status: 'Active',
    compensation: 180251,
    year: 2024,
    featured: false,
    recent: true,
  },
  {
    title: 'Excelsior Park Townhouses - Phase 2',
    address: 'Excelsior Park',
    city: 'Saratoga Springs',
    coordinates: [43.0831, -73.7845],
    marketSector: 'housing',
    buildingType: 'Townhouse Complex',
    description: 'Modern townhome development featuring energy-efficient design and contemporary living spaces. This phase expands the community with 24 additional units designed for modern families.',
    imageUrls: [
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    ],
    client: 'Witt Construction, Inc.',
    projectManager: 'Jace Brown, R.A.',
    status: 'Active',
    compensation: 141000,
    year: 2024,
    featured: true,
    recent: false,
  }
];

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    marketSectors: [],
    searchQuery: '',
    status: [],
  });

  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  // Check admin authentication on app start
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuthenticated');
    setIsAdminAuthenticated(adminAuth === 'true');
  }, []);

  // Load projects from database on app start
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setError(null);
        const savedProjects = await projectDB.getAll();
        
        if (savedProjects.length === 0) {
          // If no projects in database, add sample projects
          await projectDB.bulkAdd(sampleProjects);
          const newProjects = await projectDB.getAll();
          setProjects(newProjects);
        } else {
          setProjects(savedProjects);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        setError('Failed to load projects. Please check your database connection.');
        // Fallback to empty array instead of sample projects
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Apply filters whenever filters or projects change
  useEffect(() => {
    let filtered = projects;

    // Filter by market sectors
    if (filters.marketSectors.length > 0) {
      filtered = filtered.filter(project => 
        filters.marketSectors.includes(project.marketSector)
      );
    }

    // Filter by status
    if (filters.status.length > 0) {
      filtered = filtered.filter(project => 
        filters.status.includes(project.status)
      );
    }

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(query) ||
        project.city.toLowerCase().includes(query) ||
        project.client.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        (project.buildingType && project.buildingType.toLowerCase().includes(query))
      );
    }

    setFilteredProjects(filtered);
  }, [filters, projects]);

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setShowAdminLogin(false);
    setShowOptionsDropdown(false);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminEmail');
    setIsAdminAuthenticated(false);
    setShowAddModal(false);
    setShowImportModal(false);
    setSelectedProjectIds(new Set());
  };

  const handleCSVImport = async (file: File) => {
    try {
      setError(null);
      const importedProjects = await parseCSV(file, projects); // Pass existing projects for duplicate detection
      await projectDB.bulkAdd(importedProjects);
      const updatedProjects = await projectDB.getAll();
      setProjects(updatedProjects);
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing CSV:', error);
      setError('Error importing CSV file. Please check the format and try again.');
    }
  };

  const handleAddProject = async (project: Omit<Project, 'id'>) => {
    try {
      setError(null);
      await projectDB.add(project);
      const updatedProjects = await projectDB.getAll();
      setProjects(updatedProjects);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding project:', error);
      setError('Error adding project. Please try again.');
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      setError(null);
      await projectDB.update(updatedProject.id, updatedProject);
      const updatedProjects = await projectDB.getAll();
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Error updating project. Please try again.');
      throw error; // Re-throw to handle in component
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setError(null);
      await projectDB.delete(projectId);
      const updatedProjects = await projectDB.getAll();
      setProjects(updatedProjects);
      setSelectedProjectId(null); // Clear selection after delete
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Error deleting project. Please try again.');
      throw error; // Re-throw to handle in component
    }
  };

  const handleBulkDelete = async (projectIds: string[]) => {
    try {
      setError(null);
      for (const id of projectIds) {
        await projectDB.delete(id);
      }
      const updatedProjects = await projectDB.getAll();
      setProjects(updatedProjects);
      setSelectedProjectIds(new Set());
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Error bulk deleting projects:', error);
      setError('Error deleting projects. Please try again.');
      throw error;
    }
  };

  const handleExportCSV = () => {
    exportToCSV(filteredProjects);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProjectId(project.id);
  };

  const handleBackToMap = () => {
    setSelectedProjectId(null);
    setSelectedProjectIds(new Set()); // Clear selections when going back to map
  };

  const toggleProjectSelection = (projectId: string) => {
    const newSelection = new Set(selectedProjectIds);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
    } else {
      newSelection.add(projectId);
    }
    setSelectedProjectIds(newSelection);
  };

  const selectAllProjects = () => {
    setSelectedProjectIds(new Set(filteredProjects.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedProjectIds(new Set());
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMobileMenu && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-trigger')) {
        setShowMobileMenu(false);
      }
      if (showOptionsDropdown && !target.closest('.options-dropdown') && !target.closest('.options-dropdown-trigger')) {
        setShowOptionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu, showOptionsDropdown]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/BDA-logo-RGB.png" alt="Beardsley" className="h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto p-6">
          <img src="/BDA-logo-RGB.png" alt="Beardsley" className="h-16 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Database Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please ensure your Supabase configuration is correct in the .env file.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#6d0020] text-white rounded-lg hover:bg-[#5a001a] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If a project is selected, show the project page
  if (selectedProject) {
    return (
      <ProjectPage 
        project={selectedProject} 
        onBack={handleBackToMap}
        allProjects={projects}
        onUpdateProject={isAdminAuthenticated ? handleUpdateProject : undefined}
        onDeleteProject={isAdminAuthenticated ? handleDeleteProject : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      {!isFullscreen && (
        <header className="bg-white shadow-sm border-b border-gray-200 relative z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <img src="/BDA-logo-RGB.png" alt="Beardsley" className="h-11" />
              </div>
              
              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent w-64"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>

                {/* Options Dropdown */}
                <div className="relative options-dropdown">
                  <button
                    onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                    className="options-dropdown-trigger flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {showOptionsDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {!isAdminAuthenticated ? (
                        <button
                          onClick={() => setShowAdminLogin(true)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Admin Login
                        </button>
                      ) : (
                        <>
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Admin Actions
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setShowAddModal(true);
                              setShowOptionsDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Add Project
                          </button>
                          <button
                            onClick={() => {
                              setShowImportModal(true);
                              setShowOptionsDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Import CSV
                          </button>
                          <button
                            onClick={() => {
                              handleExportCSV();
                              setShowOptionsDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Export CSV
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Admin Dropdown - Only show when authenticated */}
                {isAdminAuthenticated && (
                  <AdminDropdown
                    onAddProject={() => setShowAddModal(true)}
                    onImportCSV={() => setShowImportModal(true)}
                    onExportCSV={handleExportCSV}
                    onLogout={handleAdminLogout}
                    selectedCount={selectedProjectIds.size}
                    onBulkDelete={() => setShowBulkDeleteModal(true)}
                    onSelectAll={selectAllProjects}
                    onClearSelection={clearSelection}
                  />
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden mobile-menu-trigger p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>

            {/* Mobile Search Bar */}
            <div className="lg:hidden pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent"
                />
              </div>
            </div>

            {/* Bulk Actions Bar - Only show when admin and projects selected */}
         {isAdminAuthenticated && selectedProjectIds.size > 0 && (
  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-white shadow-lg border border-gray-200 rounded-lg px-4 py-3 w-[90%] max-w-xl">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-800">
        {selectedProjectIds.size} project{selectedProjectIds.size !== 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center space-x-3">
        <button
          onClick={clearSelection}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={() => setShowBulkDeleteModal(true)}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
        >
          Delete Selected
        </button>
      </div>
    </div>
  </div>
)}

          </div>
        </header>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
          <div className="mobile-menu fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowFilters(!showFilters);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left"
                >
                  <Filter className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Filters</span>
                </button>
                
                {/* Mobile Admin Actions */}
                {isAdminAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        handleExportCSV();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-[#91982c] hover:bg-[#7d8428] text-white rounded-lg transition-colors text-left"
                    >
                      <span className="font-medium">Export CSV</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowImportModal(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-[#f7941d] hover:bg-[#e8851a] text-white rounded-lg transition-colors text-left"
                    >
                      <span className="font-medium">Import CSV</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowAddModal(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-[#6d0020] hover:bg-[#5a001a] text-white rounded-lg transition-colors text-left"
                    >
                      <span className="font-medium">Add Project</span>
                    </button>

                    {selectedProjectIds.size > 0 && (
                      <button
                        onClick={() => {
                          setShowBulkDeleteModal(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-left"
                      >
                        <span className="font-medium">Delete Selected ({selectedProjectIds.size})</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        handleAdminLogout();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-left"
                    >
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowAdminLogin(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-[#6d0020] hover:bg-[#5a001a] text-white rounded-lg transition-colors text-left"
                  >
                    <span className="font-medium">Admin Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]'} relative`}>
        {/* Sidebar - Desktop Only */}
        {!isFullscreen && showFilters && (
          <div className="hidden lg:block w-80 bg-white border-r border-gray-200 overflow-y-auto relative z-30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                projectCount={filteredProjects.length}
                totalCount={projects.length}
              />
            </div>
          </div>
        )}

        {/* Mobile Filter Panel */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <FilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  projectCount={filteredProjects.length}
                  totalCount={projects.length}
                />
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="flex-1 relative z-10">
          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-4 right-4 z-40 p-2 bg-white hover:bg-gray-50 rounded-lg shadow-lg border border-gray-200 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5 text-gray-600" />
            ) : (
              <Maximize className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Mobile Filter Toggle */}
          {!isFullscreen && (
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden absolute top-4 left-4 z-40 p-2 bg-white hover:bg-gray-50 rounded-lg shadow-lg border border-gray-200 transition-colors"
              title="Open Filters"
            >
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          )}

          <MapView
            projects={filteredProjects}
            onProjectSelect={handleProjectSelect}
            isFullscreen={isFullscreen}
            isAdminMode={isAdminAuthenticated}
            selectedProjectIds={selectedProjectIds}
            onToggleProjectSelection={toggleProjectSelection}
          />
        </div>
      </div>

      {/* Modals - These need to be at the highest z-index */}
      {showAdminLogin && (
        <div className="relative z-50">
          <AdminLogin
            onClose={() => setShowAdminLogin(false)}
            onLogin={handleAdminLogin}
          />
        </div>
      )}

      {showAddModal && isAdminAuthenticated && (
        <div className="relative z-50">
          <AddProjectModal
            onClose={() => setShowAddModal(false)}
            onAddProject={handleAddProject}
          />
        </div>
      )}

      {showImportModal && isAdminAuthenticated && (
        <div className="relative z-50">
          <CSVImportModal
            onClose={() => setShowImportModal(false)}
            onImport={handleCSVImport}
          />
        </div>
      )}

      {showBulkDeleteModal && isAdminAuthenticated && (
        <div className="relative z-50">
          <BulkDeleteModal
            projectIds={Array.from(selectedProjectIds)}
            projects={projects}
            onClose={() => setShowBulkDeleteModal(false)}
            onConfirm={handleBulkDelete}
          />
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 left-4 lg:left-auto z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-gray-200 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;