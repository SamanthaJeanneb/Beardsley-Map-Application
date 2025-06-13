import Papa from 'papaparse';
import { Project } from '../types/project';
import { getMarketSectorFromDescription, MARKET_SECTORS } from '../data/marketSectors';
import { geocodeAddress } from './geocoding';

interface CSVRow {
  [key: string]: string;
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface DuplicateProject {
  row: number;
  title: string;
  existingProject: Project;
}

interface ParseResult {
  projects: Omit<Project, 'id'>[];
  errors: ValidationError[];
  warnings: string[];
  duplicates: DuplicateProject[];
}

export const parseCSV = async (file: File, existingProjects: Project[] = []): Promise<Omit<Project, 'id'>[]> => {
  const result = await parseCSVWithValidation(file, existingProjects);
  
  if (result.errors.length > 0) {
    const errorMessage = formatValidationErrors(result.errors, result.warnings);
    throw new Error(errorMessage);
  }
  
  if (result.duplicates.length > 0) {
    const duplicateMessage = formatDuplicateWarning(result.duplicates);
    const userConfirmed = window.confirm(duplicateMessage);
    
    if (!userConfirmed) {
      throw new Error('Import cancelled by user due to duplicate projects.');
    }
  }
  
  return result.projects;
};

export const parseCSVWithValidation = async (file: File, existingProjects: Project[] = []): Promise<ParseResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const projects: Omit<Project, 'id'>[] = [];
        const errors: ValidationError[] = [];
        const warnings: string[] = [];
        const duplicates: DuplicateProject[] = [];
        const data = results.data as CSVRow[];
        
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const rowNumber = i + 2; // +2 because of header row and 0-based index
          
          // Skip completely empty rows
          const hasAnyData = Object.values(row).some(value => value && value.trim());
          if (!hasAnyData) continue;
          
          // Validate required fields - updated to use "Primary Client Name"
          const title = row.Name || row['Long Name'] || row.Title || '';
          const city = row.City || '';
          const client = row['Primary Client Name'] || row.Client || '';
          
          // Check for missing required fields
          if (!title.trim()) {
            errors.push({
              row: rowNumber,
              field: 'Project Title',
              value: title,
              message: 'Project title is required (Name, Long Name, or Title column)'
            });
          }
          
          if (!city.trim()) {
            errors.push({
              row: rowNumber,
              field: 'City',
              value: city,
              message: 'City is required for mapping location'
            });
          }
          
          if (!client.trim()) {
            errors.push({
              row: rowNumber,
              field: 'Client',
              value: client,
              message: 'Client name is required (Primary Client Name or Client column)'
            });
          }
          
          // Check for duplicate projects by title
          if (title.trim()) {
            const existingProject = existingProjects.find(p => 
              p.title.toLowerCase().trim() === title.toLowerCase().trim()
            );
            
            if (existingProject) {
              duplicates.push({
                row: rowNumber,
                title: title.trim(),
                existingProject
              });
            }
          }
          
          // If we have critical errors for this row, skip processing but continue validation
          if (!title.trim() || !city.trim() || !client.trim()) {
            continue;
          }
          
          // Try to geocode the location
          const coordinates = await geocodeAddress('', city.trim());
          
          if (!coordinates) {
            errors.push({
              row: rowNumber,
              field: 'Location',
              value: city,
              message: `Could not find coordinates for city: ${city}. Please verify the city name is correct.`
            });
            continue;
          }
          
          // Add small random offset to avoid exact overlaps for projects in same city
          const latOffset = (Math.random() - 0.5) * 0.01; // ~0.5 mile radius
          const lonOffset = (Math.random() - 0.5) * 0.01;
          const adjustedCoordinates: [number, number] = [
            coordinates[0] + latOffset,
            coordinates[1] + lonOffset
          ];
          
          // Parse optional fields with defaults - compensation is now truly optional
          const compensation = parseFloat(row.Compensation || '0') || 0;
          const year = parseInt(row.Year || new Date().getFullYear().toString()) || new Date().getFullYear();
          const projectManager = row['Project Manager Name'] || row['Project Manager'] || '';
          const address = row.Address || row['Address Description'] || '';
          const description = row.Description || row['Project Description'] || '';
          const miniDescription = row['Mini Description'] || row['Short Description'] || '';
          const status = (row['Status Description'] || row.Status || 'Active') as 'Active' | 'Inactive' | 'Dormant';
          
          // Use mini description as fallback for main description if main description is empty
          const finalDescription = description.trim() || miniDescription.trim() || title;
          
          // Handle Market Sector - prioritize explicit Market Sector column
          let marketSector = 'commercial'; // default
          
          // First, check for explicit Market Sector column
          const explicitMarketSector = row['Market Sector'] || row['Market'] || row['Sector'] || '';
          
          if (explicitMarketSector.trim()) {
            // Try to match the provided market sector with our known sectors
            const normalizedInput = explicitMarketSector.toLowerCase().trim();
            const matchedSector = MARKET_SECTORS.find(sector => 
              sector.name.toLowerCase() === normalizedInput ||
              sector.id.toLowerCase() === normalizedInput ||
              sector.name.toLowerCase().includes(normalizedInput) ||
              normalizedInput.includes(sector.name.toLowerCase())
            );
            
            if (matchedSector) {
              marketSector = matchedSector.id;
            } else {
              // If no exact match, try to map common variations
              const sectorMappings: { [key: string]: string } = {
                'commercial': 'commercial',
                'education': 'education',
                'educational': 'education',
                'school': 'education',
                'academic': 'education',
                'government': 'government',
                'public': 'government',
                'municipal': 'government',
                'manufacturing': 'manufacturing',
                'industrial': 'industrial',
                'factory': 'manufacturing',
                'mixed use': 'mixed-use',
                'mixed-use': 'mixed-use',
                'parks': 'parks',
                'parks & recreation': 'parks',
                'recreation': 'parks',
                'recreational': 'parks',
                'housing': 'housing',
                'residential': 'housing',
                'professional': 'professional',
                'professional offices': 'professional',
                'office': 'professional',
                'offices': 'professional',
                'research': 'research',
                'r&d': 'research',
                'development': 'research',
                'custom homes': 'custom-homes',
                'custom home': 'custom-homes'
              };
              
              const mappedSector = sectorMappings[normalizedInput];
              if (mappedSector) {
                marketSector = mappedSector;
              } else {
                warnings.push(`Row ${rowNumber}: Unknown market sector "${explicitMarketSector}", defaulting to commercial`);
              }
            }
          } else {
            // Fallback to guessing from project type description if no explicit market sector
            const projectTypeDescription = row['Project Type Description'] || row['Project Type'] || '';
            if (projectTypeDescription.trim()) {
              marketSector = getMarketSectorFromDescription(projectTypeDescription);
            } else {
              warnings.push(`Row ${rowNumber}: No market sector specified, defaulting to commercial`);
            }
          }
          
          // Validate status
          if (!['Active', 'Inactive', 'Dormant'].includes(status)) {
            warnings.push(`Row ${rowNumber}: Invalid status "${status}", defaulting to "Active"`);
          }
          
          // Warn about missing optional but important fields (but don't require compensation)
          if (!projectManager.trim()) {
            warnings.push(`Row ${rowNumber}: No project manager specified`);
          }
          
          if (!description.trim() && !miniDescription.trim()) {
            warnings.push(`Row ${rowNumber}: No description provided, using project title as description`);
          }
          
          const project: Omit<Project, 'id'> = {
            title: title.trim(),
            address: address.trim(),
            city: city.trim(),
            coordinates: adjustedCoordinates,
            marketSector: marketSector,
            buildingType: row['Building Type'] || row['Project Type'] || undefined,
            description: finalDescription,
            miniDescription: miniDescription.trim() || undefined,
            imageUrls: [
              'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
              'https://images.pexels.com/photos/277667/pexels-photo-277667.jpeg'
            ],
            client: client.trim(),
            projectManager: projectManager.trim(),
            status: ['Active', 'Inactive', 'Dormant'].includes(status) ? status : 'Active',
            compensation,
            year,
            featured: Math.random() > 0.8,
            recent: Math.random() > 0.7,
          };
          
          projects.push(project);
        }
        
        resolve({ projects, errors, warnings, duplicates });
      },
      error: (error) => {
        resolve({
          projects: [],
          errors: [{
            row: 0,
            field: 'File',
            value: file.name,
            message: `Failed to parse CSV file: ${error.message}`
          }],
          warnings: [],
          duplicates: []
        });
      }
    });
  });
};

const formatDuplicateWarning = (duplicates: DuplicateProject[]): string => {
  let message = `⚠️ Duplicate Projects Detected\n\n`;
  message += `Found ${duplicates.length} project${duplicates.length > 1 ? 's' : ''} that may already exist:\n\n`;
  
  duplicates.forEach(duplicate => {
    message += `• Row ${duplicate.row}: "${duplicate.title}"\n`;
    message += `  Matches existing project: "${duplicate.existingProject.title}" in ${duplicate.existingProject.city}\n\n`;
  });
  
  message += `Do you want to continue and potentially overwrite these projects?\n\n`;
  message += `Click OK to proceed with import (may create duplicates)\n`;
  message += `Click Cancel to stop the import and review your CSV file`;
  
  return message;
};

const formatValidationErrors = (errors: ValidationError[], warnings: string[]): string => {
  let message = 'CSV Import Failed - Please fix the following issues:\n\n';
  
  // Group errors by type
  const errorsByField: { [key: string]: ValidationError[] } = {};
  errors.forEach(error => {
    if (!errorsByField[error.field]) {
      errorsByField[error.field] = [];
    }
    errorsByField[error.field].push(error);
  });
  
  // Format errors by field
  Object.entries(errorsByField).forEach(([field, fieldErrors]) => {
    message += `❌ ${field} Issues:\n`;
    fieldErrors.forEach(error => {
      message += `   • Row ${error.row}: ${error.message}\n`;
    });
    message += '\n';
  });
  
  // Add suggestions
  message += '💡 Suggestions:\n';
  message += '   • Ensure your CSV has columns for: Project Title/Name, City, and Primary Client Name\n';
  message += '   • Check that city names are spelled correctly (Fort Lee, Ft. Lee will be mapped to Fort Lee, NJ)\n';
  message += '   • Remove any completely empty rows\n';
  message += '   • Optional columns: Address, Project Manager, Compensation, Year, Status, Mini Description, Market Sector\n';
  message += '   • Supported Market Sectors: Commercial, Education, Government, Manufacturing, Mixed Use, Parks & Recreation, Housing, Professional Offices, Industrial, Research, Custom Homes\n\n';
  
  // Add warnings if any
  if (warnings.length > 0) {
    message += '⚠️ Warnings (will use defaults):\n';
    warnings.forEach(warning => {
      message += `   • ${warning}\n`;
    });
  }
  
  return message;
};

export const exportToCSV = (projects: Project[]): void => {
  const csvData = projects.map(project => ({
    'Project Title': project.title,
    'Address': project.address,
    'City': project.city,
    'Building Type': project.buildingType || '',
    'Market Sector': project.marketSector,
    'Description': project.description,
    'Mini Description': project.miniDescription || '',
    'Primary Client Name': project.client,
    'Project Manager Name': project.projectManager,
    'Status Description': project.status,
    'Compensation': project.compensation,
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