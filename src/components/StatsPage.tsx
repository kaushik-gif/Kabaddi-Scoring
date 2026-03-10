import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Trophy, Users, Target, Shield, Zap, ArrowUpDown } from 'lucide-react';

type SortField = 'name' | 'matchesPlayed' | 'totalPoints' | 'raidPoints' | 'tacklePoints' | 'superRaids' | 'superTackles';
type SortOrder = 'asc' | 'desc';

export const StatsPage = () => {
  const { players, teams } = useAppContext();
  const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
  
  // Player Sorting State
  const [playerSortField, setPlayerSortField] = useState<SortField>('totalPoints');
  const [playerSortOrder, setPlayerSortOrder] = useState<SortOrder>('desc');
  const [playerSearch, setPlayerSearch] = useState('');

  // Team Sorting State
  const [teamSortField, setTeamSortField] = useState<'name' | 'matchesPlayed' | 'totalWins' | 'totalPoints' | 'totalRaidPoints' | 'totalTacklePoints'>('totalPoints');
  const [teamSortOrder, setTeamSortOrder] = useState<SortOrder>('desc');

  const handlePlayerSort = (field: SortField) => {
    if (playerSortField === field) {
      setPlayerSortOrder(playerSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setPlayerSortField(field);
      setPlayerSortOrder('desc');
    }
  };

  const handleTeamSort = (field: typeof teamSortField) => {
    if (teamSortField === field) {
      setTeamSortOrder(teamSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setTeamSortField(field);
      setTeamSortOrder('desc');
    }
  };

  const sortedPlayers = useMemo(() => {
    let filtered = players;
    if (playerSearch) {
      const lowerSearch = playerSearch.toLowerCase();
      filtered = players.filter(p => 
        p.firstName.toLowerCase().includes(lowerSearch) || 
        p.lastName.toLowerCase().includes(lowerSearch)
      );
    }

    return [...filtered].sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (playerSortField === 'name') {
        valA = `${a.firstName} ${a.lastName}`;
        valB = `${b.firstName} ${b.lastName}`;
      } else {
        valA = a.stats[playerSortField] || 0;
        valB = b.stats[playerSortField] || 0;
      }

      if (valA < valB) return playerSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return playerSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [players, playerSortField, playerSortOrder, playerSearch]);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (teamSortField === 'name') {
        valA = a.name;
        valB = b.name;
      } else {
        valA = a.stats[teamSortField] || 0;
        valB = b.stats[teamSortField] || 0;
      }

      if (valA < valB) return teamSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return teamSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [teams, teamSortField, teamSortOrder]);

  const SortIcon = ({ field, currentField, currentOrder }: { field: string, currentField: string, currentOrder: SortOrder }) => {
    if (field !== currentField) return <ArrowUpDown className="w-4 h-4 text-gray-600 opacity-50 group-hover:opacity-100 transition-opacity" />;
    return (
      <ArrowUpDown className={`w-4 h-4 text-orange-500 transition-transform ${currentOrder === 'asc' ? 'rotate-180' : ''}`} />
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Statistics Hub</h1>
          <p className="text-gray-400 mt-1">Comprehensive player and team leaderboards</p>
        </div>
        
        <div className="flex bg-[#1c3530] p-1 rounded-xl border border-[#2d4f4a]">
          <button
            onClick={() => setActiveTab('players')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'players' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Players
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'teams' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            Teams
          </button>
        </div>
      </div>

      {activeTab === 'players' && (
        <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#2d4f4a] flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              Player Leaderboard
            </h2>
            <input
              type="text"
              placeholder="Search players..."
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              className="bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full sm:w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f2320] border-b border-[#2d4f4a] text-xs uppercase tracking-wider text-gray-400">
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handlePlayerSort('name')}>
                    <div className="flex items-center gap-2">Player <SortIcon field="name" currentField={playerSortField} currentOrder={playerSortOrder} /></div>
                  </th>
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handlePlayerSort('matchesPlayed')}>
                    <div className="flex items-center gap-2">M <SortIcon field="matchesPlayed" currentField={playerSortField} currentOrder={playerSortOrder} /></div>
                  </th>
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handlePlayerSort('totalPoints')}>
                    <div className="flex items-center gap-2 text-orange-400">Pts <SortIcon field="totalPoints" currentField={playerSortField} currentOrder={playerSortOrder} /></div>
                  </th>
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handlePlayerSort('raidPoints')}>
                    <div className="flex items-center gap-2 text-teal-400"><Target className="w-3 h-3" /> Raid <SortIcon field="raidPoints" currentField={playerSortField} currentOrder={playerSortOrder} /></div>
                  </th>
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handlePlayerSort('tacklePoints')}>
                    <div className="flex items-center gap-2 text-blue-400"><Shield className="w-3 h-3" /> Tackle <SortIcon field="tacklePoints" currentField={playerSortField} currentOrder={playerSortOrder} /></div>
                  </th>
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handlePlayerSort('superRaids')}>
                    <div className="flex items-center gap-2 text-yellow-400"><Zap className="w-3 h-3" /> SR <SortIcon field="superRaids" currentField={playerSortField} currentOrder={playerSortOrder} /></div>
                  </th>
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handlePlayerSort('superTackles')}>
                    <div className="flex items-center gap-2 text-purple-400"><Shield className="w-3 h-3" /> ST <SortIcon field="superTackles" currentField={playerSortField} currentOrder={playerSortOrder} /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d4f4a]">
                {sortedPlayers.map((player, index) => (
                  <tr key={player.id} className="hover:bg-[#2d4f4a]/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 text-center font-mono text-xs ${index < 3 ? 'text-orange-500 font-bold' : 'text-gray-500'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-medium text-white">{player.firstName} {player.lastName}</div>
                          <div className="text-xs text-gray-400">{player.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 font-mono">{player.stats.matchesPlayed}</td>
                    <td className="p-4 font-bold text-orange-400 font-mono text-lg">{player.stats.totalPoints}</td>
                    <td className="p-4 text-teal-400 font-mono">{player.stats.raidPoints}</td>
                    <td className="p-4 text-blue-400 font-mono">{player.stats.tacklePoints}</td>
                    <td className="p-4 text-yellow-400 font-mono">{player.stats.superRaids}</td>
                    <td className="p-4 text-purple-400 font-mono">{player.stats.superTackles}</td>
                  </tr>
                ))}
                {sortedPlayers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">No players found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#2d4f4a]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Team Leaderboard
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f2320] border-b border-[#2d4f4a] text-xs uppercase tracking-wider text-gray-400">
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handleTeamSort('name')}>
                    <div className="flex items-center gap-2">Team <SortIcon field="name" currentField={teamSortField} currentOrder={teamSortOrder} /></div>
                  </th>
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handleTeamSort('matchesPlayed')}>
                    <div className="flex items-center gap-2">M <SortIcon field="matchesPlayed" currentField={teamSortField} currentOrder={teamSortOrder} /></div>
                  </th>
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handleTeamSort('totalWins')}>
                    <div className="flex items-center gap-2 text-green-400">W <SortIcon field="totalWins" currentField={teamSortField} currentOrder={teamSortOrder} /></div>
                  </th>
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handleTeamSort('totalPoints')}>
                    <div className="flex items-center gap-2 text-orange-400">Pts <SortIcon field="totalPoints" currentField={teamSortField} currentOrder={teamSortOrder} /></div>
                  </th>
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handleTeamSort('totalRaidPoints')}>
                    <div className="flex items-center gap-2 text-teal-400"><Target className="w-3 h-3" /> Raid <SortIcon field="totalRaidPoints" currentField={teamSortField} currentOrder={teamSortOrder} /></div>
                  </th>
                  <th className="p-4 font-medium cursor-pointer group" onClick={() => handleTeamSort('totalTacklePoints')}>
                    <div className="flex items-center gap-2 text-blue-400"><Shield className="w-3 h-3" /> Tackle <SortIcon field="totalTacklePoints" currentField={teamSortField} currentOrder={teamSortOrder} /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d4f4a]">
                {sortedTeams.map((team, index) => (
                  <tr key={team.id} className="hover:bg-[#2d4f4a]/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 text-center font-mono text-xs ${index < 3 ? 'text-orange-500 font-bold' : 'text-gray-500'}`}>
                          {index + 1}
                        </span>
                        {team.logoUrl ? (
                          <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded-full object-cover bg-white" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-teal-900 flex items-center justify-center text-xs font-bold text-white">{team.prefix}</div>
                        )}
                        <span className="font-medium text-white">{team.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 font-mono">{team.stats.matchesPlayed}</td>
                    <td className="p-4 text-green-400 font-mono font-bold">{team.stats.totalWins}</td>
                    <td className="p-4 font-bold text-orange-400 font-mono text-lg">{team.stats.totalPoints}</td>
                    <td className="p-4 text-teal-400 font-mono">{team.stats.totalRaidPoints}</td>
                    <td className="p-4 text-blue-400 font-mono">{team.stats.totalTacklePoints}</td>
                  </tr>
                ))}
                {sortedTeams.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No teams found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
