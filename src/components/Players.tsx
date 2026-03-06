import React, { useState } from 'react';
import { Plus, Edit2, X, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Player, Role } from '../types';

export const Players = () => {
  const { players, addPlayer, updatePlayer, teams } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [role, setRole] = useState<Role>('Raider');
  const [jerseyNumber, setJerseyNumber] = useState<number | ''>('');
  const [error, setError] = useState('');

  const handleOpenModal = (player?: Player) => {
    if (player) {
      setEditingPlayerId(player.id);
      setFirstName(player.firstName);
      setLastName(player.lastName);
      setAge(player.age);
      setRole(player.role);
      setJerseyNumber(player.jerseyNumber);
    } else {
      setEditingPlayerId(null);
      setFirstName('');
      setLastName('');
      setAge('');
      setRole('Raider');
      setJerseyNumber('');
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !age || !jerseyNumber) {
      setError('All fields are required.');
      return;
    }

    if (Number(age) <= 0 || Number(jerseyNumber) <= 0) {
      setError('Age and Jersey Number must be positive numbers.');
      return;
    }

    if (editingPlayerId) {
      const existingPlayer = players.find((p) => p.id === editingPlayerId);
      if (existingPlayer) {
        updatePlayer({
          ...existingPlayer,
          firstName,
          lastName,
          age: Number(age),
          role,
          jerseyNumber: Number(jerseyNumber),
        });
      }
    } else {
      addPlayer({
        firstName,
        lastName,
        age: Number(age),
        role,
        jerseyNumber: Number(jerseyNumber),
      });
    }

    setIsModalOpen(false);
  };

  const getPlayerTeam = (playerId: number) => {
    return teams.find((t) => t.squadPlayerIds.includes(playerId));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-white">Players</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Player
        </button>
      </div>

      <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f2320] border-b border-[#2d4f4a]">
                <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Full Name</th>
                <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Age</th>
                <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Jersey No.</th>
                <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Team</th>
                <th className="p-4 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d4f4a]">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">No players found.</td>
                </tr>
              ) : (
                players.map((player) => {
                  const team = getPlayerTeam(player.id);
                  return (
                    <tr key={player.id} className="hover:bg-[#2d4f4a]/30 transition-colors group">
                      <td className="p-4">
                        <span className="px-2 py-1 bg-[#0f2320] rounded text-gray-300 font-mono text-sm border border-[#2d4f4a]">#{player.id}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white">{player.firstName} {player.lastName}</div>
                      </td>
                      <td className="p-4 text-gray-300">{player.age}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                          player.role === 'Raider' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          player.role === 'Defender' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                          'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}>
                          {player.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="w-8 h-8 bg-teal-900 rounded-full flex items-center justify-center font-bold text-white border border-teal-500 shadow-sm">
                          {player.jerseyNumber}
                        </div>
                      </td>
                      <td className="p-4">
                        {team ? (
                          <div className="flex items-center gap-2">
                            {team.logoUrl ? (
                              <img src={team.logoUrl} alt={team.name} className="w-6 h-6 rounded-full object-cover bg-white shadow-sm" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-teal-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">{team.prefix}</div>
                            )}
                            <span className="text-sm font-medium text-gray-300">{team.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenModal(player)}
                          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#2d4f4a]">
              <h2 className="text-xl font-heading font-bold text-white">
                {editingPlayerId ? 'Edit Player' : 'Create Player'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="p-6 overflow-y-auto space-y-5 flex-1">
              {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    min="1"
                    className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Jersey Number</label>
                  <input
                    type="number"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(Number(e.target.value))}
                    min="1"
                    className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none"
                >
                  <option value="Raider">Raider</option>
                  <option value="Defender">Defender</option>
                  <option value="All-Rounder">All-Rounder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Player ID</label>
                <input
                  type="text"
                  value={editingPlayerId ? `#${editingPlayerId}` : 'Auto-assigned'}
                  disabled
                  className="w-full bg-[#0f2320]/50 border border-[#2d4f4a] rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[#2d4f4a] hover:bg-[#3d6f6a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Save & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
