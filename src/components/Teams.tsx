import React, { useState, useRef } from 'react';
import { Plus, Upload, Edit2, Users, Check, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Team } from '../types';

export const Teams = () => {
  const { teams, addTeam, updateTeam, competitions, players } = useAppContext();
  const [activeTab, setActiveTab] = useState<'manage' | 'squad'>('manage');

  // Manage Teams State
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [country, setCountry] = useState('');
  const [tournamentIds, setTournamentIds] = useState<number[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Squad Builder State
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png') {
        setError('Logo must be a PNG image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !prefix || !country) {
      setError('Name, Prefix, and Country are required.');
      return;
    }

    if (prefix.length > 3) {
      setError('Prefix must be max 3 characters.');
      return;
    }

    if (editingTeamId) {
      const existingTeam = teams.find((t) => t.id === editingTeamId);
      if (existingTeam) {
        updateTeam({
          ...existingTeam,
          name,
          prefix: prefix.toUpperCase(),
          country,
          tournamentIds,
          logoUrl,
        });
      }
      setEditingTeamId(null);
    } else {
      addTeam({
        name,
        prefix: prefix.toUpperCase(),
        country,
        tournamentIds,
        logoUrl,
        squadPlayerIds: [],
      });
    }

    // Reset form
    setName('');
    setPrefix('');
    setCountry('');
    setTournamentIds([]);
    setLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setName(team.name);
    setPrefix(team.prefix);
    setCountry(team.country);
    setTournamentIds(team.tournamentIds);
    setLogoUrl(team.logoUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTournament = (id: number) => {
    setTournamentIds((prev) =>
      prev.includes(id) ? prev.filter((tId) => tId !== id) : [...prev, id]
    );
  };

  // Squad Builder Logic
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const squadPlayers = selectedTeam ? players.filter((p) => selectedTeam.squadPlayerIds.includes(p.id)) : [];
  
  const availablePlayers = players.filter(
    (p) => !selectedTeam?.squadPlayerIds.includes(p.id) && 
           (p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddPlayersToSquad = () => {
    if (selectedTeam) {
      updateTeam({
        ...selectedTeam,
        squadPlayerIds: [...selectedTeam.squadPlayerIds, ...selectedPlayerIds],
      });
      setIsAddPlayerModalOpen(false);
      setSelectedPlayerIds([]);
      setSearchQuery('');
    }
  };

  const togglePlayerSelection = (id: number) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-white">Teams</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2d4f4a]">
        <button
          onClick={() => setActiveTab('manage')}
          className={`py-4 px-8 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'manage' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Manage Teams
        </button>
        <button
          onClick={() => setActiveTab('squad')}
          className={`py-4 px-8 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'squad' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Squad Builder
        </button>
      </div>

      {activeTab === 'manage' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl p-6 sticky top-24 shadow-xl">
              <h2 className="text-xl font-heading font-bold text-white mb-6">
                {editingTeamId ? 'Edit Team' : 'Create New Team'}
              </h2>
              
              <form onSubmit={handleSaveTeam} className="space-y-5">
                {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    placeholder="e.g. Bengal Warriors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Prefix (Max 3)</label>
                    <input
                      type="text"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                      maxLength={3}
                      className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all uppercase"
                      placeholder="e.g. BW"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                      placeholder="e.g. India"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tournaments</label>
                  <div className="max-h-32 overflow-y-auto bg-[#0f2320] border border-[#2d4f4a] rounded-lg p-2 space-y-1">
                    {competitions.length === 0 ? (
                      <div className="text-gray-500 text-sm p-2 text-center">No competitions available</div>
                    ) : (
                      competitions.map((comp) => (
                        <label key={comp.id} className="flex items-center gap-3 p-2 hover:bg-[#1c3530] rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={tournamentIds.includes(comp.id)}
                            onChange={() => toggleTournament(comp.id)}
                            className="w-4 h-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500 bg-[#0f2320]"
                          />
                          <span className="text-sm text-gray-300">{comp.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Team Logo (PNG only)</label>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="relative group">
                        <img src={logoUrl} alt="Logo preview" className="w-16 h-16 rounded-full object-cover bg-white border-2 border-[#2d4f4a]" />
                        <button
                          type="button"
                          onClick={() => setLogoUrl(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#0f2320] border-2 border-dashed border-[#2d4f4a] flex items-center justify-center text-gray-500">
                        <Upload className="w-6 h-6" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/png"
                      onChange={handleLogoUpload}
                      ref={fileInputRef}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="px-4 py-2 bg-[#0f2320] border border-[#2d4f4a] rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2d4f4a] cursor-pointer transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  {editingTeamId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTeamId(null);
                        setName('');
                        setPrefix('');
                        setCountry('');
                        setTournamentIds([]);
                        setLogoUrl(null);
                      }}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[#2d4f4a] hover:bg-[#3d6f6a] transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    {editingTeamId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingTeamId ? 'Update Team' : 'Create Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2">
            <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f2320] border-b border-[#2d4f4a]">
                      <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Team</th>
                      <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Prefix</th>
                      <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Country</th>
                      <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Tournaments</th>
                      <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2d4f4a]">
                    {teams.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">No teams found.</td>
                      </tr>
                    ) : (
                      teams.map((team) => (
                        <tr key={team.id} className="hover:bg-[#2d4f4a]/30 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {team.logoUrl ? (
                                <img src={team.logoUrl} alt={team.name} className="w-10 h-10 rounded-full object-cover bg-white shadow-sm" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-teal-900 flex items-center justify-center text-sm font-bold text-white shadow-sm">{team.prefix}</div>
                              )}
                              <span className="font-bold text-white">{team.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-[#0f2320] rounded text-gray-300 font-mono text-sm border border-[#2d4f4a]">{team.prefix}</span>
                          </td>
                          <td className="p-4 text-gray-300">{team.country}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {team.tournamentIds.length === 0 ? (
                                <span className="text-gray-500 text-sm">-</span>
                              ) : (
                                team.tournamentIds.map((id) => {
                                  const comp = competitions.find(c => c.id === id);
                                  return comp ? (
                                    <span key={id} className="px-2 py-1 bg-teal-900/30 text-teal-400 text-xs rounded border border-teal-800/50 truncate max-w-[120px]" title={comp.name}>
                                      {comp.name}
                                    </span>
                                  ) : null;
                                })
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleEditTeam(team)}
                              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'squad' && (
        <div className="space-y-6">
          <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex-1 w-full max-w-md">
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Team</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none"
              >
                <option value="">-- Select a Team --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            
            {selectedTeamId && (
              <button
                onClick={() => setIsAddPlayerModalOpen(true)}
                className="w-full sm:w-auto mt-6 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Player to Squad
              </button>
            )}
          </div>

          {selectedTeamId ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {squadPlayers.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-[#1c3530] border border-[#2d4f4a] rounded-2xl">
                  <Users className="w-16 h-16 text-teal-900 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Empty Squad</h3>
                  <p className="text-gray-400">Add players to build your team's squad.</p>
                </div>
              ) : (
                squadPlayers.map((player) => (
                  <div key={player.id} className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl p-6 relative overflow-hidden group hover:border-teal-500/50 transition-colors shadow-lg">
                    <div className="absolute -top-6 -right-6 text-9xl font-heading font-black text-[#0f2320] opacity-50 select-none z-0">
                      {player.jerseyNumber}
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-teal-900 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 border-teal-500 shadow-md">
                          {player.jerseyNumber}
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                          player.role === 'Raider' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          player.role === 'Defender' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                          'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}>
                          {player.role}
                        </span>
                      </div>
                      <h3 className="text-xl font-heading font-bold text-white leading-tight mb-1">{player.firstName}</h3>
                      <h3 className="text-2xl font-heading font-black text-white uppercase tracking-wide mb-4">{player.lastName}</h3>
                      <div className="text-sm text-gray-400">Age: {player.age}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#1c3530] border border-[#2d4f4a] rounded-2xl">
              <p className="text-gray-400">Select a team to view and manage its squad.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Player Modal */}
      {isAddPlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsAddPlayerModalOpen(false)}>
          <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#2d4f4a]">
              <h2 className="text-xl font-heading font-bold text-white">Add Players to Squad</h2>
              <button onClick={() => setIsAddPlayerModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 border-b border-[#2d4f4a] bg-[#0f2320]/50">
              <input
                type="text"
                placeholder="Search players by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-3">
                {availablePlayers.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No available players found.</div>
                ) : (
                  availablePlayers.map((player) => {
                    const isSelected = selectedPlayerIds.includes(player.id);
                    return (
                      <div
                        key={player.id}
                        onClick={() => togglePlayerSelection(player.id)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                          isSelected ? 'bg-teal-900/30 border-teal-500' : 'bg-[#0f2320] border-[#2d4f4a] hover:border-teal-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                            isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-500'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div className="w-10 h-10 bg-[#1c3530] rounded-full flex items-center justify-center font-bold text-white border border-[#2d4f4a]">
                            {player.jerseyNumber}
                          </div>
                          <div>
                            <div className="font-bold text-white">{player.firstName} {player.lastName}</div>
                            <div className="text-xs text-gray-400">ID: {player.id} • Age: {player.age}</div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                          player.role === 'Raider' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          player.role === 'Defender' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                          'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}>
                          {player.role}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[#2d4f4a] flex justify-between items-center bg-[#0f2320]/50">
              <span className="text-gray-400 font-medium">{selectedPlayerIds.length} players selected</span>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddPlayerModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-white bg-[#2d4f4a] hover:bg-[#3d6f6a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlayersToSquad}
                  disabled={selectedPlayerIds.length === 0}
                  className="px-6 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-500/20"
                >
                  Add to Squad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
