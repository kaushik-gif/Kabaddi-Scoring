import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Trophy, Users, AlertCircle, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MatchSetupModal } from './MatchSetupModal';

export const CompetitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { competitions, matches, teams } = useAppContext();
  const navigate = useNavigate();
  const [isMatchSetupOpen, setIsMatchSetupOpen] = useState(false);
  const [confirmMatchId, setConfirmMatchId] = useState<number | null>(null);

  const compId = Number(id);
  const competition = competitions.find((c) => c.id === compId);

  if (!competition) {
    return <div className="text-center py-12 text-gray-400">Competition not found.</div>;
  }

  const compMatches = matches.filter((m) => m.competitionId === compId);

  const handleMatchClick = (matchId: number, status: string) => {
    if (status === 'completed') {
      setConfirmMatchId(matchId);
    } else {
      navigate(`/scoring/${matchId}`);
    }
  };

  const getTeam = (teamId: number) => teams.find((t) => t.id === teamId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-900/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-4 py-1.5 bg-orange-500/20 text-orange-400 text-sm font-bold rounded-full uppercase tracking-wider border border-orange-500/30">
              {competition.type}
            </span>
            <span className="px-4 py-1.5 bg-[#0f2320] text-gray-300 text-sm font-bold rounded-full uppercase tracking-wider border border-[#2d4f4a]">
              {competition.numberOfTeams} Teams
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">{competition.name}</h1>
          <div className="flex flex-wrap gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-500" />
              <span>{competition.startDate} to {competition.endDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>{competition.teamIds.length} Teams Assigned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixtures */}
      <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#2d4f4a] flex items-center justify-between bg-[#0f2320]/50">
          <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
            <Trophy className="w-6 h-6 text-teal-500" />
            Fixtures
          </h2>
          <button
            onClick={() => setIsMatchSetupOpen(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg shadow-teal-500/20"
          >
            <Play className="w-4 h-4" />
            Start Match
          </button>
        </div>

        <div className="divide-y divide-[#2d4f4a]">
          {compMatches.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No fixtures generated yet.</p>
            </div>
          ) : (
            compMatches.map((match) => {
              const teamA = getTeam(match.teamAId);
              const teamB = getTeam(match.teamBId);
              return (
                <div
                  key={match.id}
                  onClick={() => handleMatchClick(match.id, match.status)}
                  className="p-6 hover:bg-[#2d4f4a]/30 cursor-pointer transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-6 flex-1 w-full justify-center sm:justify-start">
                    {/* Team A */}
                    <div className="flex items-center gap-3 w-1/3 justify-end">
                      <span className="font-bold text-lg text-right truncate group-hover:text-teal-400 transition-colors">{teamA?.name}</span>
                      {teamA?.logoUrl ? (
                        <img src={teamA.logoUrl} alt={teamA.name} className="w-10 h-10 rounded-full object-cover bg-white shadow-md" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-teal-900 flex items-center justify-center text-sm font-bold shadow-md">{teamA?.prefix}</div>
                      )}
                    </div>

                    {/* Score / VS */}
                    <div className="px-6 py-2 bg-[#0f2320] border border-[#2d4f4a] rounded-xl font-mono font-bold text-2xl min-w-[100px] text-center shadow-inner">
                      {match.status === 'upcoming' ? (
                        <span className="text-gray-500">VS</span>
                      ) : (
                        <span className={match.status === 'live' ? 'text-orange-500' : 'text-white'}>
                          {match.teamAScore} - {match.teamBScore}
                        </span>
                      )}
                    </div>

                    {/* Team B */}
                    <div className="flex items-center gap-3 w-1/3">
                      {teamB?.logoUrl ? (
                        <img src={teamB.logoUrl} alt={teamB.name} className="w-10 h-10 rounded-full object-cover bg-white shadow-md" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-teal-900 flex items-center justify-center text-sm font-bold shadow-md">{teamB?.prefix}</div>
                      )}
                      <span className="font-bold text-lg truncate group-hover:text-teal-400 transition-colors">{teamB?.name}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {match.status === 'live' && <span className="px-4 py-1.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full uppercase tracking-wider border border-green-500/30 animate-pulse">Live</span>}
                    {match.status === 'upcoming' && <span className="px-4 py-1.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider border border-orange-500/30">Upcoming</span>}
                    {match.status === 'completed' && <span className="px-4 py-1.5 bg-gray-500/20 text-gray-400 text-xs font-bold rounded-full uppercase tracking-wider border border-gray-500/30">Completed</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isMatchSetupOpen && <MatchSetupModal onClose={() => setIsMatchSetupOpen(false)} competitionId={compId} />}

      {/* Confirmation Modal */}
      {confirmMatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmMatchId(null)}>
          <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl w-full max-w-md shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-heading font-bold text-white mb-2">Match Completed</h3>
            <p className="text-gray-400 mb-8">This match has ended. Do you still want to open the scoring page?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmMatchId(null)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[#2d4f4a] hover:bg-[#3d6f6a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  navigate(`/scoring/${confirmMatchId}`);
                  setConfirmMatchId(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
