import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, Zap, Plus, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MatchSetupModal } from './MatchSetupModal';
import { CreateCompetitionModal } from './CreateCompetitionModal';

export const Dashboard = () => {
  const { competitions, players, matches, teams } = useAppContext();
  const navigate = useNavigate();
  const [isMatchSetupOpen, setIsMatchSetupOpen] = useState(false);
  const [isCreateCompetitionOpen, setIsCreateCompetitionOpen] = useState(false);

  const liveMatches = matches.filter((m) => m.status === 'live');
  const recentMatches = [...matches].sort((a, b) => b.id - a.id).slice(0, 5);

  const getTeam = (id: number) => teams.find((t) => t.id === id);

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-xl p-6 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-teal-900/50 rounded-lg text-teal-400">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Competitions</p>
            <p className="text-3xl font-heading font-bold text-white">{competitions.length}</p>
          </div>
        </div>
        
        <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-xl p-6 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-blue-900/50 rounded-lg text-blue-400">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Players</p>
            <p className="text-3xl font-heading font-bold text-white">{players.length}</p>
          </div>
        </div>

        <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-xl p-6 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-purple-900/50 rounded-lg text-purple-400">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Matches</p>
            <p className="text-3xl font-heading font-bold text-white">{matches.length}</p>
          </div>
        </div>

        <div className="bg-orange-500 border border-orange-400 rounded-xl p-6 flex items-center gap-4 shadow-lg shadow-orange-500/20">
          <div className="p-3 bg-orange-600 rounded-lg text-white">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <p className="text-orange-100 text-sm font-medium">Live Now</p>
            <p className="text-3xl font-heading font-bold text-white">{liveMatches.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setIsCreateCompetitionOpen(true)}
          className="bg-[#1c3530] hover:bg-[#2d4f4a] border border-[#2d4f4a] rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors group"
        >
          <div className="p-4 bg-[#0f2320] rounded-full group-hover:bg-teal-900/50 transition-colors">
            <Plus className="w-6 h-6 text-teal-400" />
          </div>
          <span className="font-medium text-white">New Competition</span>
        </button>

        <button
          onClick={() => navigate('/players')}
          className="bg-[#1c3530] hover:bg-[#2d4f4a] border border-[#2d4f4a] rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors group"
        >
          <div className="p-4 bg-[#0f2320] rounded-full group-hover:bg-blue-900/50 transition-colors">
            <Settings className="w-6 h-6 text-blue-400" />
          </div>
          <span className="font-medium text-white">Manage Players</span>
        </button>

        <button
          onClick={() => setIsMatchSetupOpen(true)}
          className="bg-[#1c3530] hover:bg-[#2d4f4a] border border-orange-500/30 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors group"
        >
          <div className="p-4 bg-[#0f2320] rounded-full group-hover:bg-orange-500/20 transition-colors">
            <Zap className="w-6 h-6 text-orange-500" />
          </div>
          <span className="font-medium text-orange-400">Start Scoring</span>
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Matches */}
        <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#2d4f4a]">
            <h2 className="text-xl font-heading font-bold text-white">Recent Matches</h2>
          </div>
          <div className="divide-y divide-[#2d4f4a] flex-1">
            {recentMatches.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No matches found.</div>
            ) : (
              recentMatches.map((match) => {
                const teamA = getTeam(match.teamAId);
                const teamB = getTeam(match.teamBId);
                return (
                  <div
                    key={match.id}
                    onClick={() => navigate(`/scoring/${match.id}`)}
                    className="p-4 hover:bg-[#2d4f4a]/50 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 w-1/3 justify-end">
                        <span className="font-medium text-right truncate">{teamA?.name}</span>
                        {teamA?.logoUrl ? (
                          <img src={teamA.logoUrl} alt={teamA.name} className="w-8 h-8 rounded-full object-cover bg-white" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-teal-900 flex items-center justify-center text-xs font-bold">{teamA?.prefix}</div>
                        )}
                      </div>
                      <div className="px-4 py-1 bg-[#0f2320] rounded-lg font-mono font-bold text-lg min-w-[80px] text-center">
                        {match.teamAScore} - {match.teamBScore}
                      </div>
                      <div className="flex items-center gap-2 w-1/3">
                        {teamB?.logoUrl ? (
                          <img src={teamB.logoUrl} alt={teamB.name} className="w-8 h-8 rounded-full object-cover bg-white" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-teal-900 flex items-center justify-center text-xs font-bold">{teamB?.prefix}</div>
                        )}
                        <span className="font-medium truncate">{teamB?.name}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {match.status === 'live' && <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">Live</span>}
                      {match.status === 'upcoming' && <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider">Upcoming</span>}
                      {match.status === 'completed' && <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-bold rounded-full uppercase tracking-wider">Completed</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Competitions */}
        <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#2d4f4a] flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-white">Competitions</h2>
            <Link to="/competitions" className="text-sm text-orange-500 hover:text-orange-400 font-medium">Manage</Link>
          </div>
          <div className="divide-y divide-[#2d4f4a] flex-1">
            {competitions.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No competitions found.</div>
            ) : (
              competitions.map((comp) => (
                <div key={comp.id} className="p-4 hover:bg-[#2d4f4a]/50 transition-colors flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">{comp.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">Starts: {comp.startDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-teal-900/50 text-teal-400 text-xs font-bold rounded-full">
                      {comp.teamIds.length} Teams
                    </span>
                    <span className="px-3 py-1 bg-[#0f2320] text-gray-300 text-xs font-bold rounded-full">
                      {comp.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isMatchSetupOpen && <MatchSetupModal onClose={() => setIsMatchSetupOpen(false)} />}
      {isCreateCompetitionOpen && <CreateCompetitionModal onClose={() => setIsCreateCompetitionOpen(false)} />}
    </div>
  );
};
