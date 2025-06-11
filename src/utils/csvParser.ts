import Papa from 'papaparse';
import { Project } from '../types/project';
import { getMarketSectorFromDescription } from '../data/marketSectors';
import { geocodeAddress } from './geocoding';

interface CSVRow {
  [key: string]: string;
}

export const parseCSV = async (file: File): Promise<Omit<Project, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const projects: Omit<Project, 'id'>[] = [];
          const data = results.data as CSVRow[];
          
          for (const row of data) {
            // Skip rows without essential data
            if (!row.Name && !row['Long Name']) continue;
            if (!row.City) continue;
            
            // Use city for geocoding since these are mostly NY state projects without exact addresses
            // Add "NY" to city if not already present to improve geocoding accuracy
            let cityForGeocoding = row.City.trim();
            if (!cityForGeocoding.toLowerCase().includes('ny') && 
                !cityForGeocoding.toLowerCase().includes('new york')) {
              cityForGeocoding += ', NY';
            }
            
            // Try to geocode using the city (with some random offset to avoid exact overlaps)
            const coordinates = await geocodeAddress('', cityForGeocoding);
            
            // Only add projects where we can find coordinates
            if (coordinates) {
              // Add small random offset to avoid exact overlaps for projects in same city
              const latOffset = (Math.random() - 0.5) * 0.01; // ~0.5 mile radius
              const lonOffset = (Math.random() - 0.5) * 0.01;
              const adjustedCoordinates: [number, number] = [
                coordinates[0] + latOffset,
                coordinates[1] + lonOffset
              ];

              const project: Omit<Project, 'id'> = {
                title: row['Long Name'] || row.Name || 'Untitled Project',
                address: row.Address || row['Address Description'] || '',
                city: row.City,
                coordinates: adjustedCoordinates,
                marketSector: getMarketSectorFromDescription(
                  row['Project Type Description'] || ''
                ),
                description: row['Long Name'] || row.Name || 'No description available',
                imageUrls: [
                  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
                  'https://images.pexels.com/photos/277667/pexels-photo-277667.jpeg'
                ],
                client: row['Primary Client Name'] || 'Unknown Client',
                projectManager: row['Project Manager Name'] || 'TBD',
                status: (row['Status Description'] as 'Active' | 'Inactive' | 'Dormant') || 'Active',
                compensation: parseFloat(row.Compensation || '0') || 0,
                year: new Date().getFullYear(),
                featured: Math.random() > 0.8,
                recent: Math.random() > 0.7,
              };
              
              projects.push(project);
            } else {
              console.warn(`Could not geocode city: ${row.City} for project: ${row.Name || row['Long Name']}`);
            }
          }
          
          resolve(projects);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const exportToCSV = (projects: Project[]): void => {
  const csvData = projects.map(project => ({
    'Project Title': project.title,
    'Address': project.address,
    'City': project.city,
    'Market Sector': project.marketSector,
    'Description': project.description,
    'Client': project.client,
    'Project Manager': project.projectManager,
    'Status': project.status,
    'Project Value': project.compensation,
    'Year': project.year,
    'Latitude': project.coordinates[0],
    'Longitude': project.coordinates[1],
  }));
  
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `projects_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};