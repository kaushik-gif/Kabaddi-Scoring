import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface MatchSetupModalProps {
  onClose: () => void;
  competitionId?: number;
}

export const MatchSetupModal: React.FC<MatchSetupModalProps> = ({ onClose, competitionId }) => {
  const { teams, addMatch, competitions } = useAppContext();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [teamAId, setTeamAId] = useState<number | ''>('');
  const [teamBId, setTeamBId] = useState<number | ''>('');
  const [halfDuration, setHalfDuration] = useState<number>(20);
  const [error, setError] = useState('');

  const availableTeams = competitionId
    ? teams.filter((t) => competitions.find((c) => c.id === competitionId)?.teamIds.includes(t.id))
    : teams;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!teamAId || !teamBId) {
      setError('Please select both teams.');
      return;
    }

    if (teamAId === teamBId) {
      setError('Team A and Team B cannot be the same.');
      return;
    }

    if (halfDuration <= 0) {
      setError('Half duration must be greater than 0.');
      return;
    }

    const matchId = addMatch({
      competitionId: competitionId || null,
      teamAId: Number(teamAId),
      teamBId: Number(teamBId),
      status: 'live',
      halfDuration,
      teamAScore: 0,
      teamBScore: 0,
      winnerId: null,
      teamAReviews: { success: 0, fail: 0 },
      teamBReviews: { success: 0, fail: 0 },
      scoringLog: [],
    });

    onClose();
    navigate(`/scoring/${matchId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#2d4f4a]">
          <h2 className="text-xl font-heading font-bold text-white">Match Setup</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Match Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Final, Semi-Final 1"
              className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Team A</label>
            <select
              value={teamAId}
              onChange={(e) => setTeamAId(Number(e.target.value))}
              className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none"
            >
              <option value="">Select Team A</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Team B</label>
            <select
              value={teamBId}
              onChange={(e) => setTeamBId(Number(e.target.value))}
              className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none"
            >
              <option value="">Select Team B</option>
              {availableTeams.filter(t => t.id !== teamAId).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Half Duration (minutes)</label>
            <input
              type="number"
              value={halfDuration}
              onChange={(e) => setHalfDuration(Number(e.target.value))}
              min="1"
              className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
          >
            Confirm & Start Scoring
          </button>
        </form>
      </div>
    </div>
  );
};
