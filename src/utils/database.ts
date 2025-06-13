import { supabase } from './supabase';
import { Project } from '../types/project';

// Convert database row to Project type
const dbRowToProject = (row: any): Project => ({
  id: row.id,
  title: row.title,
  address: row.address || '',
  city: row.city,
  coordinates: [parseFloat(row.latitude), parseFloat(row.longitude)] as [number, number],
  marketSector: row.market_sector,
  buildingType: row.building_type || undefined,
  description: row.description,
  miniDescription: row.mini_description || undefined,
  imageUrls: row.image_urls || [],
  client: row.client,
  projectManager: row.project_manager || '',
  status: row.status as 'Active' | 'Inactive' | 'Dormant',
  compensation: parseFloat(row.compensation) || 0,
  year: row.year,
  featured: row.featured || false,
  recent: row.recent || false,
});

// Convert Project type to database row
const projectToDbRow = (project: Omit<Project, 'id'> | Project) => ({
  ...(('id' in project) && { id: project.id }),
  title: project.title,
  address: project.address,
  city: project.city,
  latitude: project.coordinates[0],
  longitude: project.coordinates[1],
  market_sector: project.marketSector,
  building_type: project.buildingType || null,
  description: project.description,
  mini_description: project.miniDescription || null,
  image_urls: project.imageUrls,
  client: project.client,
  project_manager: project.projectManager,
  status: project.status,
  compensation: project.compensation,
  year: project.year,
  featured: project.featured,
  recent: project.recent,
});

export const projectDB = {
  // Get all projects
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data?.map(dbRowToProject) || [];
  },

  // Add a new project
  async add(project: Omit<Project, 'id'>): Promise<string> {
    const dbRow = projectToDbRow(project);
    
    const { data, error } = await supabase
      .from('projects')
      .insert(dbRow)
      .select('id')
      .single();

    if (error) {
      console.error('Error adding project:', error);
      throw new Error(`Failed to add project: ${error.message}`);
    }

    return data.id;
  },

  // Update an existing project
  async update(id: string, changes: Partial<Project>): Promise<void> {
    // Create a complete project object for conversion
    const currentProject = await this.getById(id);
    if (!currentProject) {
      throw new Error('Project not found');
    }

    const updatedProject = { ...currentProject, ...changes };
    const dbChanges = projectToDbRow(updatedProject);
    delete dbChanges.id; // Remove id from changes
    
    const { error } = await supabase
      .from('projects')
      .update(dbChanges)
      .eq('id', id);

    if (error) {
      console.error('Error updating project:', error);
      throw new Error(`Failed to update project: ${error.message}`);
    }
  },

  // Delete a project
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  },

  // Get a single project by ID
  async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Project not found
      }
      console.error('Error fetching project:', error);
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data ? dbRowToProject(data) : null;
  },

  // Bulk add projects (for CSV import)
  async bulkAdd(projects: Omit<Project, 'id'>[]): Promise<void> {
    if (projects.length === 0) return;
    
    const dbRows = projects.map(projectToDbRow);
    
    const { error } = await supabase
      .from('projects')
      .insert(dbRows);

    if (error) {
      console.error('Error bulk adding projects:', error);
      throw new Error(`Failed to import projects: ${error.message}`);
    }
  },

  // Clear all projects
  async clear(): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Error clearing projects:', error);
      throw new Error(`Failed to clear projects: ${error.message}`);
    }
  }
};