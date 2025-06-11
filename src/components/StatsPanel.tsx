import React from 'react';
import { DollarSign, Building2, TrendingUp, MapPin } from 'lucide-react';
import { Project } from '../types/project';

interface StatsPanelProps {
  projects: Project[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ projects }) => {
  const totalCompensation = projects.reduce((sum, project) => sum + project.compensation, 0);
  const averageCompensation = projects.length > 0 ? totalCompensation / projects.length : 0;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const uniqueCities = new Set(projects.map(p => p.city)).size;

  const stats = [
    {
      icon: DollarSign,
      label: 'Total Value',
      value: `$${totalCompensation.toLocaleString()}`,
      color: '#6d0020',
    },
    {
      icon: Building2,
      label: 'Active Projects',
      value: activeProjects.toString(),
      color: '#91982c',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Project Value',
      value: `$${Math.round(averageCompensation).toLocaleString()}`,
      color: '#f7941d',
    },
    {
      icon: MapPin,
      label: 'Cities',
      value: uniqueCities.toString(),
      color: '#6d0020',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Quick Stats</h3>
      <div className="grid grid-cols-1 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon 
                  className="h-4 w-4" 
                  style={{ color: stat.color }}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsPanel;