import React, { useState } from 'react';
import { X, MapPin, Loader } from 'lucide-react';
import { Project } from '../types/project';
import { MARKET_SECTORS } from '../data/marketSectors';
import ImageUpload from './ImageUpload';
import AddressAutocomplete from './AddressAutocomplete';
import { geocodeAddress } from '../utils/geocoding';

interface AddProjectModalProps {
  onClose: () => void;
  onAddProject: (project: Omit<Project, 'id'>) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onClose, onAddProject }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    city: '',
    marketSector: 'commercial',
    buildingType: '',
    description: '',
    miniDescription: '',
    client: '',
    projectManager: '',
    status: 'Active' as const,
    compensation: '',
    year: new Date().getFullYear().toString(),
    imageUrls: [] as string[],
    featured: false,
    recent: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, imageUrls: images }));
  };

  const handleAddressChange = (address: string) => {
    setFormData(prev => ({ ...prev, address }));
    
    // Extract city from address if not already set
    if (!formData.city && address) {
      const parts = address.split(',');
      if (parts.length >= 2) {
        const cityPart = parts[parts.length - 2].trim();
        setFormData(prev => ({ ...prev, city: cityPart }));
      }
    }
  };

  const handleCoordinatesFound = (coords: [number, number]) => {
    setCoordinates(coords);
  };

  const handleCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const city = e.target.value;
    setFormData(prev => ({ ...prev, city }));
    
    // If no address is provided and we have a city, try to geocode the city
    if (!formData.address.trim() && city.trim()) {
      try {
        const coords = await geocodeAddress('', city);
        if (coords) {
          setCoordinates(coords);
        }
      } catch (error) {
        console.error('Error geocoding city:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no coordinates yet, try to geocode using city
    let finalCoordinates = coordinates;
    if (!finalCoordinates && formData.city.trim()) {
      try {
        finalCoordinates = await geocodeAddress(formData.address, formData.city);
      } catch (error) {
        console.error('Error geocoding:', error);
      }
    }
    
    if (!finalCoordinates) {
      alert('Unable to determine location coordinates. Please check the city name or provide a more specific address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const project: Omit<Project, 'id'> = {
        title: formData.title,
        address: formData.address,
        city: formData.city,
        coordinates: finalCoordinates,
        marketSector: formData.marketSector,
        buildingType: formData.buildingType || undefined,
        description: formData.description,
        miniDescription: formData.miniDescription || undefined,
        imageUrls: formData.imageUrls,
        client: formData.client,
        projectManager: formData.projectManager,
        status: formData.status,
        compensation: parseFloat(formData.compensation) || 0,
        year: parseInt(formData.year) || new Date().getFullYear(),
        featured: formData.featured,
        recent: formData.recent,
      };

      onAddProject(project);
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Error adding project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl z-50">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Project</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent text-base"
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Sector *
                </label>
                <select
                  name="marketSector"
                  value={formData.marketSector}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent text-base"
                >
                  {MARKET_SECTORS.map(sector => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Building Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building Type
              </label>
              <input
                type="text"
                name="buildingType"
                value={formData.buildingType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent text-base"
                placeholder="e.g., Residence Hall, Office Building, Manufacturing Facility"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional - Specify the specific type of building (e.g., "Residence Hall" for education projects)
              </p>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address (Optional) {coordinates && <span className="text-green-600 text-xs">(Location found)</span>}
                </label>
                <AddressAutocomplete
                  value={formData.address}
                  onChange={handleAddressChange}
                  onCoordinatesFound={handleCoordinatesFound}
                  placeholder="Start typing an address (optional)..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional - If provided, select from suggestions to get precise coordinates
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City * {!formData.address && coordinates && <span className="text-green-600 text-xs">(Location found)</span>}
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleCityChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent text-base"
                  placeholder="City name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required - Will be used for map location if no specific address is provided
                </p>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mini Description
                </label>
                <textarea
                  name="miniDescription"
                  value={formData.miniDescription}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent text-base resize-none"
                  placeholder="Brief description for hover cards (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional - Short description shown on map hover cards
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent text-base resize-none"
                  placeholder="Full project description"
                />
              </div>
            </div>

            {/* Client and Project Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent text-base"
                  placeholder="Client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Manager
                </label>
                <input
                  type="text"
                  name="projectManager"
                  value={formData.projectManager}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent text-base"
                  placeholder="Project manager name"
                />
              </div>
            </div>

            {/* Status, Compensation, Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent text-base"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Dormant">Dormant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Value ($)
                </label>
                <input
                  type="number"
                  name="compensation"
                  value={formData.compensation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent text-base"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d0020] focus:border-transparent text-base"
                  placeholder="2024"
                />
              </div>
            </div>

            {/* Project Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Project Images
              </label>
              <ImageUpload
                images={formData.imageUrls}
                onImagesChange={handleImagesChange}
                maxImages={10}
              />
            </div>

            {/* Project Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#6d0020] focus:ring-[#6d0020] border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Featured Project
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="recent"
                  checked={formData.recent}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#6d0020] focus:ring-[#6d0020] border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Recent Project
                </label>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2 bg-[#6d0020] hover:bg-[#5a001a] disabled:bg-gray-400 text-white rounded-lg transition-colors min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Adding Project...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>Add Project</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;