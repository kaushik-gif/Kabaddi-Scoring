import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trophy, Calendar, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CreateCompetitionModal } from './CreateCompetitionModal';

export const Competitions = () => {
  const { competitions } = useAppContext();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-white">Competitions</h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Competition
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#1c3530] border border-[#2d4f4a] rounded-2xl">
            <Trophy className="w-16 h-16 text-teal-900 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Competitions Yet</h3>
            <p className="text-gray-400">Create your first competition to start managing matches.</p>
          </div>
        ) : (
          competitions.map((comp) => (
            <div
              key={comp.id}
              onClick={() => navigate(`/competitions/${comp.id}`)}
              className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl p-6 hover:border-teal-500/50 transition-colors cursor-pointer group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-teal-900/30 rounded-xl text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-[#0f2320] border border-[#2d4f4a] text-gray-300 text-xs font-bold rounded-full uppercase tracking-wider">
                  {comp.type}
                </span>
              </div>
              
              <h3 className="text-xl font-heading font-bold text-white mb-4 line-clamp-2">{comp.name}</h3>
              
              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  <span>{comp.startDate} to {comp.endDate}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{comp.teamIds.length} / {comp.numberOfTeams} Teams</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isCreateOpen && <CreateCompetitionModal onClose={() => setIsCreateOpen(false)} />}
    </div>
  );
};
