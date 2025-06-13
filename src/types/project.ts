export interface Project {
  id: string;
  title: string;
  address: string;
  city: string;
  coordinates: [number, number];
  marketSector: string;
  buildingType?: string; // New optional field
  description: string;
  miniDescription?: string; // New optional field for short descriptions
  imageUrls: string[];
  client: string;
  projectManager: string;
  status: 'Active' | 'Inactive' | 'Dormant';
  compensation: number;
  year?: number;
  featured?: boolean;
  recent?: boolean;
}

export interface MarketSector {
  id: string;
  name: string;
  color: string;
}

export interface FilterState {
  marketSectors: string[];
  searchQuery: string;
  status: string[];
}

export interface RadialMenuOption {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}