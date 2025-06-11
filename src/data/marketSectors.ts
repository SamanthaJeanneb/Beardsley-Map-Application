import { MarketSector } from '../types/project';

export const MARKET_SECTORS: MarketSector[] = [
  { id: 'commercial', name: 'Commercial', color: '#6d0020' },
  { id: 'education', name: 'Education', color: '#f7941d' },
  { id: 'government', name: 'Government', color: '#91982c' },
  { id: 'manufacturing', name: 'Manufacturing & Distribution', color: '#dc2626' },
  { id: 'mixed-use', name: 'Mixed Use', color: '#7c3aed' },
  { id: 'parks', name: 'Parks & Recreation', color: '#059669' },
  { id: 'housing', name: 'Housing', color: '#0891b2' },
  { id: 'professional', name: 'Professional Offices', color: '#64748b' },
  { id: 'industrial', name: 'Industrial/Manufacturing', color: '#ea580c' },
  { id: 'research', name: 'Research and Development', color: '#8b5cf6' },
];

export const getMarketSectorFromDescription = (description: string): string => {
  const desc = description.toLowerCase();
  
  if (desc.includes('housing') || desc.includes('residential')) return 'housing';
  if (desc.includes('parks') || desc.includes('recreation')) return 'parks';
  if (desc.includes('industrial') || desc.includes('manufacturing')) return 'industrial';
  if (desc.includes('academic') || desc.includes('education')) return 'education';
  if (desc.includes('office') || desc.includes('administrative')) return 'professional';
  if (desc.includes('research') || desc.includes('development')) return 'research';
  if (desc.includes('mixed')) return 'mixed-use';
  if (desc.includes('commercial')) return 'commercial';
  if (desc.includes('government')) return 'government';
  
  return 'commercial';
};