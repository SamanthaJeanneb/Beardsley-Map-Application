import React from 'react';
import { CheckCircle, Circle, Building2 } from 'lucide-react';
import { FilterState } from '../types/project';
import { MARKET_SECTORS } from '../data/marketSectors';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  projectCount: number;
  totalCount: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  projectCount,
  totalCount,
}) => {
  const toggleMarketSector = (sectorId: string) => {
    const newSectors = filters.marketSectors.includes(sectorId)
      ? filters.marketSectors.filter(id => id !== sectorId)
      : [...filters.marketSectors, sectorId];
    
    onFiltersChange({
      ...filters,
      marketSectors: newSectors,
    });
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    onFiltersChange({
      ...filters,
      status: newStatuses,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      marketSectors: [],
      searchQuery: '',
      status: [],
    });
  };

  const statusOptions = ['Active', 'Inactive', 'Dormant'];

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Building2 className="h-4 w-4 text-[#6d0020]" />
          <span className="font-medium text-gray-900">Results</span>
        </div>
        <p className="text-2xl font-bold text-[#6d0020]">{projectCount}</p>
        <p className="text-sm text-gray-600">of {totalCount} projects</p>
      </div>

      {/* Clear Filters */}
      {(filters.marketSectors.length > 0 || filters.status.length > 0 || filters.searchQuery) && (
        <button
          onClick={clearFilters}
          className="w-full text-sm text-[#6d0020] hover:text-[#5a001a] font-medium transition-colors"
        >
          Clear all filters
        </button>
      )}

      {/* Market Sectors */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Market Sectors</h3>
        <div className="space-y-2">
          {MARKET_SECTORS.map((sector) => {
            const isSelected = filters.marketSectors.includes(sector.id);
            return (
              <button
                key={sector.id}
                onClick={() => toggleMarketSector(sector.id)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                {isSelected ? (
                  <CheckCircle className="h-4 w-4 text-[#6d0020]" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                )}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sector.color }}
                />
                <span className={`text-sm flex-1 text-left ${
                  isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
                }`}>
                  {sector.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;