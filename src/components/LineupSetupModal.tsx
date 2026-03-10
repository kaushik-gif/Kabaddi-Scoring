import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface LineupSetupModalProps {
  matchId: number;
  onClose: () => void;
  onComplete: () => void;
}

export const LineupSetupModal: React.FC<LineupSetupModalProps> = ({ matchId, onClose, onComplete }) => {
  const { matches, teams, players, updateMatch } = useAppContext();
  const match = matches.find(m => m.id === matchId);
  
  const teamA = teams.find(t => t.id === match?.teamAId);
  const teamB = teams.find(t => t.id === match?.teamBId);

  const [teamAStarting7, setTeamAStarting7] = useState<number[]>([]);
  const [teamASubstitutes, setTeamASubstitutes] = useState<number[]>([]);
  const [teamACaptain, setTeamACaptain] = useState<number | null>(null);

  const [teamBStarting7, setTeamBStarting7] = useState<number[]>([]);
  const [teamBSubstitutes, setTeamBSubstitutes] = useState<number[]>([]);
  const [teamBCaptain, setTeamBCaptain] = useState<number | null>(null);

  const [error, setError] = useState('');

  if (!match || !teamA || !teamB) return null;

  const teamAPlayers = players.filter(p => teamA.squadPlayerIds.includes(p.id));
  const teamBPlayers = players.filter(p => teamB.squadPlayerIds.includes(p.id));

  const handleTogglePlayer = (teamId: number, playerId: number, isStarting: boolean) => {
    if (teamId === teamA.id) {
      if (isStarting) {
        if (teamAStarting7.includes(playerId)) {
          setTeamAStarting7(prev => prev.filter(id => id !== playerId));
          if (teamACaptain === playerId) setTeamACaptain(null);
        } else {
          if (teamAStarting7.length < 7) {
            setTeamAStarting7(prev => [...prev, playerId]);
            setTeamASubstitutes(prev => prev.filter(id => id !== playerId));
          }
        }
      } else {
        if (teamASubstitutes.includes(playerId)) {
          setTeamASubstitutes(prev => prev.filter(id => id !== playerId));
        } else {
          if (teamASubstitutes.length < 5) {
            setTeamASubstitutes(prev => [...prev, playerId]);
            setTeamAStarting7(prev => prev.filter(id => id !== playerId));
            if (teamACaptain === playerId) setTeamACaptain(null);
          }
        }
      }
    } else {
      if (isStarting) {
        if (teamBStarting7.includes(playerId)) {
          setTeamBStarting7(prev => prev.filter(id => id !== playerId));
          if (teamBCaptain === playerId) setTeamBCaptain(null);
        } else {
          if (teamBStarting7.length < 7) {
            setTeamBStarting7(prev => [...prev, playerId]);
            setTeamBSubstitutes(prev => prev.filter(id => id !== playerId));
          }
        }
      } else {
        if (teamBSubstitutes.includes(playerId)) {
          setTeamBSubstitutes(prev => prev.filter(id => id !== playerId));
        } else {
          if (teamBSubstitutes.length < 5) {
            setTeamBSubstitutes(prev => [...prev, playerId]);
            setTeamBStarting7(prev => prev.filter(id => id !== playerId));
            if (teamBCaptain === playerId) setTeamBCaptain(null);
          }
        }
      }
    }
  };

  const handleSubmit = () => {
    if (teamAStarting7.length !== 7 || teamBStarting7.length !== 7) {
      setError('Both teams must have exactly 7 starting players.');
      return;
    }
    if (!teamACaptain || !teamBCaptain) {
      setError('Both teams must have a captain selected from the starting 7.');
      return;
    }

    updateMatch({
      ...match,
      teamALineup: {
        starting7: teamAStarting7,
        substitutes: teamASubstitutes,
        captainId: teamACaptain
      },
      teamBLineup: {
        starting7: teamBStarting7,
        substitutes: teamBSubstitutes,
        captainId: teamBCaptain
      }
    });

    onComplete();
  };

  const renderTeamSetup = (
    team: typeof teamA, 
    teamPlayers: typeof teamAPlayers, 
    starting7: number[], 
    substitutes: number[], 
    captain: number | null, 
    setCaptain: (id: number) => void
  ) => (
    <div className="flex-1 space-y-4">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        {team.logoUrl ? (
          <img src={team.logoUrl} alt={team.name} className="w-6 h-6 rounded-full bg-white object-cover" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-teal-900 flex items-center justify-center text-[10px] font-bold">{team.prefix}</div>
        )}
        {team.name} Lineup
      </h3>
      
      <div className="flex justify-between text-xs text-gray-400 mb-2 px-2">
        <span>Player</span>
        <div className="flex gap-4">
          <span className="w-12 text-center">Start ({starting7.length}/7)</span>
          <span className="w-12 text-center">Sub ({substitutes.length}/5)</span>
          <span className="w-12 text-center">Capt</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {teamPlayers.map(player => {
          const isStarting = starting7.includes(player.id);
          const isSub = substitutes.includes(player.id);
          const isCaptain = captain === player.id;

          return (
            <div key={player.id} className="flex items-center justify-between bg-[#0f2320] p-3 rounded-lg border border-[#2d4f4a]">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1c3530] flex items-center justify-center text-xs font-bold text-gray-300">
                  {player.jerseyNumber}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{player.firstName} {player.lastName}</p>
                  <p className="text-xs text-gray-400">{player.role}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleTogglePlayer(team.id, player.id, true)}
                  className={`w-12 h-8 rounded flex items-center justify-center border transition-colors ${
                    isStarting ? 'bg-orange-500 border-orange-500 text-white' : 'border-[#2d4f4a] text-gray-500 hover:border-orange-500/50'
                  }`}
                >
                  {isStarting && <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleTogglePlayer(team.id, player.id, false)}
                  className={`w-12 h-8 rounded flex items-center justify-center border transition-colors ${
                    isSub ? 'bg-teal-600 border-teal-600 text-white' : 'border-[#2d4f4a] text-gray-500 hover:border-teal-500/50'
                  }`}
                >
                  {isSub && <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => isStarting && setCaptain(player.id)}
                  disabled={!isStarting}
                  className={`w-12 h-8 rounded flex items-center justify-center border transition-colors ${
                    isCaptain ? 'bg-yellow-500 border-yellow-500 text-white' : 
                    !isStarting ? 'opacity-30 cursor-not-allowed border-[#2d4f4a]' : 'border-[#2d4f4a] text-gray-500 hover:border-yellow-500/50'
                  }`}
                >
                  {isCaptain ? 'C' : ''}
                </button>
              </div>
            </div>
          );
        })}
        {teamPlayers.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-4">No players in squad. Add players to team first.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#2d4f4a] shrink-0">
          <h2 className="text-2xl font-heading font-bold text-white">Set Match Lineups</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">{error}</div>}
          
          <div className="flex flex-col md:flex-row gap-8">
            {renderTeamSetup(teamA, teamAPlayers, teamAStarting7, teamASubstitutes, teamACaptain, setTeamACaptain)}
            <div className="hidden md:block w-px bg-[#2d4f4a]"></div>
            {renderTeamSetup(teamB, teamBPlayers, teamBStarting7, teamBSubstitutes, teamBCaptain, setTeamBCaptain)}
          </div>
        </div>

        <div className="p-6 border-t border-[#2d4f4a] shrink-0 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-white bg-[#2d4f4a] hover:bg-[#3d6f6a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
          >
            Confirm Lineups & Start Match
          </button>
        </div>
      </div>
    </div>
  );
};
