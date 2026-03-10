import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Square, Check, X, Pause } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ScoringLogEntry } from '../types';

export const ScoringPage = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { matches, teams, players, updateMatch, finalizeMatch } = useAppContext();
  const navigate = useNavigate();

  const match = matches.find((m) => m.id === Number(matchId));
  const teamA = teams.find((t) => t.id === match?.teamAId);
  const teamB = teams.find((t) => t.id === match?.teamBId);

  const [halfState, setHalfState] = useState<0 | 1 | 2 | 3 | 4>(0); // 0: Start H1, 1: H1 running, 2: Start H2, 3: H2 running, 4: Ended
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(match ? match.halfDuration * 60 : 20 * 60);
  const [teamAScore, setTeamAScore] = useState(match?.teamAScore || 0);
  const [teamBScore, setTeamBScore] = useState(match?.teamBScore || 0);
  const [teamAReviews, setTeamAReviews] = useState(match?.teamAReviews || { success: 0, fail: 0 });
  const [teamBReviews, setTeamBReviews] = useState(match?.teamBReviews || { success: 0, fail: 0 });
  const [superRaidA, setSuperRaidA] = useState(false);
  const [superRaidB, setSuperRaidB] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [scoringLog, setScoringLog] = useState<ScoringLogEntry[]>(match?.scoringLog || []);

  const [currentRaiderA, setCurrentRaiderA] = useState<number | ''>('');
  const [currentTacklerA, setCurrentTacklerA] = useState<number | ''>('');
  const [currentRaiderB, setCurrentRaiderB] = useState<number | ''>('');
  const [currentTacklerB, setCurrentTacklerB] = useState<number | ''>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!match || !teamA || !teamB) {
      navigate('/');
    }
  }, [match, teamA, teamB, navigate]);

  useEffect(() => {
    if ((halfState === 1 || halfState === 3) && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            if (halfState === 1) setHalfState(2);
            if (halfState === 3) {
              setHalfState(4);
              setIsResultModalOpen(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [halfState, isPaused]);

  if (!match || !teamA || !teamB) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleHalfControl = () => {
    if (halfState === 0) {
      setHalfState(1);
      setIsPaused(false);
    }
    else if (halfState === 1) {
      setHalfState(2);
      setTimeLeft(match.halfDuration * 60);
      setIsPaused(false);
    }
    else if (halfState === 2) {
      setHalfState(3);
      setIsPaused(false);
    }
    else if (halfState === 3) {
      setHalfState(4);
      setIsResultModalOpen(true);
      setIsPaused(false);
    }
  };

  const handleScore = (team: 'A' | 'B', type: string, points: number, playerId?: number) => {
    const teamId = team === 'A' ? teamA.id : teamB.id;
    const currentHalf = halfState === 1 ? 1 : halfState === 3 ? 2 : 0;
    
    let finalPoints = points;
    if (team === 'A') {
      if (type === 'RaidSuccess' && superRaidA) {
        finalPoints = 3;
        setSuperRaidA(false);
      }
      if (type === 'Undo') {
        setTeamAScore((prev) => Math.max(0, prev - 1));
      } else {
        setTeamAScore((prev) => Math.max(0, prev + finalPoints));
      }
    } else {
      if (type === 'RaidSuccess' && superRaidB) {
        finalPoints = 3;
        setSuperRaidB(false);
      }
      if (type === 'Undo') {
        setTeamBScore((prev) => Math.max(0, prev - 1));
      } else {
        setTeamBScore((prev) => Math.max(0, prev + finalPoints));
      }
    }

    if (type !== 'Undo') {
      const newLogEntry: ScoringLogEntry = {
        type,
        playerId: playerId || null,
        teamId,
        points: finalPoints,
        timestamp: Date.now(),
        half: currentHalf,
      };
      setScoringLog((prev) => [...prev, newLogEntry]);
    } else {
      // For undo, we might want to remove the last log entry for this team, but for simplicity, we just add an undo log or remove the last one.
      setScoringLog((prev) => {
        const newLog = [...prev];
        for (let i = newLog.length - 1; i >= 0; i--) {
          if (newLog[i].teamId === teamId) {
            newLog.splice(i, 1);
            break;
          }
        }
        return newLog;
      });
    }
  };

  const handleReview = (team: 'A' | 'B', type: 'success' | 'fail', increment: boolean) => {
    if (team === 'A') {
      setTeamAReviews((prev) => ({
        ...prev,
        [type]: Math.max(0, prev[type] + (increment ? 1 : -1)),
      }));
    } else {
      setTeamBReviews((prev) => ({
        ...prev,
        [type]: Math.max(0, prev[type] + (increment ? 1 : -1)),
      }));
    }
  };

  const handleSaveResult = () => {
    updateMatch({
      ...match,
      status: 'completed',
      teamAScore,
      teamBScore,
      teamAReviews,
      teamBReviews,
      winnerId,
      scoringLog,
    });
    finalizeMatch(match.id, teamAScore, teamBScore, winnerId, scoringLog);
    setIsResultModalOpen(false);
    navigate('/');
  };

  const getPlayerName = (id: number) => {
    const p = players.find(p => p.id === id);
    return p ? `${p.jerseyNumber} - ${p.firstName} ${p.lastName}` : '';
  };

  const teamAStarters = match.teamALineup?.starting7 || [];
  const teamBStarters = match.teamBLineup?.starting7 || [];
  const teamASubs = match.teamALineup?.substitutes || [];
  const teamBSubs = match.teamBLineup?.substitutes || [];
  const teamACaptain = players.find(p => p.id === match.teamALineup?.captainId);
  const teamBCaptain = players.find(p => p.id === match.teamBLineup?.captainId);

  return (
    <div className="fixed inset-0 bg-[#0f2320] text-white flex flex-col z-50 overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="bg-[#1c3530] border-b border-[#2d4f4a] p-2 flex items-center justify-between relative shadow-lg z-10 shrink-0">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xs sm:text-sm font-heading font-bold text-gray-300">
            {teamA.name} <span className="text-orange-500 mx-1">VS</span> {teamB.name}
          </h2>
          <div className="text-2xl sm:text-4xl font-mono font-black tracking-wider text-white drop-shadow-md leading-none mt-1">
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleHalfControl}
            disabled={halfState === 4}
            className={`px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md ${
              halfState === 0 || halfState === 2
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : halfState === 1 || halfState === 3
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {(halfState === 0 || halfState === 2) ? <Play className="w-3 h-3 fill-current" /> : <Square className="w-3 h-3 fill-current" />}
            <span className="hidden sm:inline">
              {halfState === 0 && 'Start Half 1'}
              {halfState === 1 && 'End Half 1'}
              {halfState === 2 && 'Start Half 2'}
              {halfState === 3 && 'End Half 2'}
              {halfState === 4 && 'Match Ended'}
            </span>
          </button>

          {(halfState === 1 || halfState === 3) && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md ${
                isPaused ? 'bg-orange-500 hover:bg-orange-600 text-white animate-pulse' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/stats?competitionId=${match.competitionId}`)}
            className="px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
          >
            Stats
          </button>
        </div>
      </div>

      {/* Scoring Panels */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Team A Panel */}
        <div className="w-1/2 border-r border-[#2d4f4a] flex flex-col bg-[#0a1816] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/10 to-transparent pointer-events-none"></div>
          
          <div className="p-2 flex flex-col items-center border-b border-[#2d4f4a] relative z-10 shrink-0">
            <div className="flex items-center gap-2 mb-1">
              {teamA.logoUrl ? (
                <img src={teamA.logoUrl} alt={teamA.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover bg-white shadow-md border border-[#2d4f4a]" />
              ) : (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-teal-900 flex items-center justify-center text-xs font-bold shadow-md border border-[#2d4f4a]">{teamA.prefix}</div>
              )}
              <h2 className="text-sm sm:text-base font-heading font-bold text-center truncate max-w-[120px] sm:max-w-[200px]">{teamA.name}</h2>
            </div>
            {teamACaptain && (
              <div className="text-[10px] sm:text-xs text-gray-400 mb-1">
                © {teamACaptain.firstName} {teamACaptain.lastName}
              </div>
            )}
            <div className="text-4xl sm:text-6xl font-mono font-black text-orange-500 leading-none drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">
              {teamAScore}
            </div>
          </div>

          <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto relative z-10">
            {/* Raider Section */}
            <div className="bg-[#1c3530] p-2 rounded-lg border border-[#2d4f4a]">
              <label className="block text-[10px] sm:text-xs text-gray-400 mb-1">Current Raider</label>
              <select
                value={currentRaiderA}
                onChange={(e) => setCurrentRaiderA(Number(e.target.value))}
                className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded px-2 py-1 text-xs text-white mb-2 focus:outline-none focus:border-teal-500"
              >
                <option value="">Select Raider...</option>
                {teamAStarters.map(id => (
                  <option key={id} value={id}>{getPlayerName(id)}</option>
                ))}
              </select>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleScore('A', 'RaidSuccess', 1, Number(currentRaiderA))}
                  disabled={!currentRaiderA}
                  className={`flex-1 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm ${superRaidA ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  ✅ Raid {superRaidA && '(3)'}
                </button>
                <button
                  onClick={() => handleScore('A', 'RaidFail', 0, Number(currentRaiderA))}
                  disabled={!currentRaiderA}
                  className="flex-1 bg-red-600 hover:bg-red-500 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ❌ Fail
                </button>
              </div>
            </div>

            {/* Tackle Section */}
            <div className="bg-[#1c3530] p-2 rounded-lg border border-[#2d4f4a]">
              <label className="block text-[10px] sm:text-xs text-gray-400 mb-1">Tackler</label>
              <select
                value={currentTacklerA}
                onChange={(e) => setCurrentTacklerA(Number(e.target.value))}
                className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded px-2 py-1 text-xs text-white mb-2 focus:outline-none focus:border-teal-500"
              >
                <option value="">Select Tackler...</option>
                {[...teamAStarters, ...teamASubs].map(id => (
                  <option key={id} value={id}>{getPlayerName(id)}</option>
                ))}
              </select>
              <button
                onClick={() => handleScore('A', 'Tackle', 1, Number(currentTacklerA))}
                disabled={!currentTacklerA}
                className="w-full bg-teal-700 hover:bg-teal-600 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +Tackle Point
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => handleScore('A', 'Bonus', 1)} className="bg-teal-700 hover:bg-teal-600 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm">
                +Bonus
              </button>
              <button onClick={() => handleScore('A', 'AllOut', 2)} className="bg-orange-500 hover:bg-orange-600 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm">
                +All-Out (2)
              </button>
            </div>
            
            <label className={`w-full flex items-center justify-center gap-1.5 p-1.5 rounded border cursor-pointer transition-colors shadow-sm ${superRaidA ? 'bg-teal-900/50 border-teal-500' : 'bg-[#1c3530] border-[#2d4f4a] hover:border-teal-500/50'}`}>
              <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${superRaidA ? 'bg-teal-500 border-teal-500' : 'border-gray-500 bg-[#0f2320]'}`}>
                {superRaidA && <Check className="w-2 h-2 text-white" />}
              </div>
              <input type="checkbox" checked={superRaidA} onChange={(e) => setSuperRaidA(e.target.checked)} className="hidden" />
              <span className="font-bold text-[10px] sm:text-xs text-teal-400">Super Raid Active</span>
            </label>

            <button onClick={() => handleScore('A', 'SuperTackle', 2, Number(currentTacklerA))} className="w-full bg-orange-500 hover:bg-orange-600 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm">
              +Super Tackle (2)
            </button>
            <div className="flex gap-1.5 mt-auto pt-1">
              <button onClick={() => handleScore('A', 'MinusSuperTackle', -2)} className="flex-1 bg-red-600 hover:bg-red-500 py-1 rounded font-bold text-[10px] transition-colors shadow-sm">
                -Super Tackle
              </button>
              <button onClick={() => handleScore('A', 'Undo', -1)} className="flex-1 bg-red-600 hover:bg-red-500 py-1 rounded font-bold text-[10px] transition-colors shadow-sm">
                -1 Undo
              </button>
            </div>
          </div>

          {/* Reviews Bar */}
          <div className="bg-[#1c3530] border-t border-[#2d4f4a] p-2 flex flex-col sm:flex-row items-center justify-between relative z-10 gap-1 shrink-0">
            <span className="font-bold text-gray-400 text-[10px] sm:text-xs">Reviews:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="px-1 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-bold">✅ {teamAReviews.success}</span>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => handleReview('A', 'success', true)} className="w-3 h-3 bg-[#2d4f4a] hover:bg-teal-600 rounded flex items-center justify-center text-[8px] font-bold">+</button>
                  <button onClick={() => handleReview('A', 'success', false)} className="w-3 h-3 bg-[#2d4f4a] hover:bg-red-600 rounded flex items-center justify-center text-[8px] font-bold">-</button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-bold">❌ {teamAReviews.fail}</span>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => handleReview('A', 'fail', true)} className="w-3 h-3 bg-[#2d4f4a] hover:bg-teal-600 rounded flex items-center justify-center text-[8px] font-bold">+</button>
                  <button onClick={() => handleReview('A', 'fail', false)} className="w-3 h-3 bg-[#2d4f4a] hover:bg-red-600 rounded flex items-center justify-center text-[8px] font-bold">-</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team B Panel */}
        <div className="w-1/2 flex flex-col bg-[#0a1816] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/10 to-transparent pointer-events-none"></div>
          
          <div className="p-2 flex flex-col items-center border-b border-[#2d4f4a] relative z-10 shrink-0">
            <div className="flex items-center gap-2 mb-1">
              {teamB.logoUrl ? (
                <img src={teamB.logoUrl} alt={teamB.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover bg-white shadow-md border border-[#2d4f4a]" />
              ) : (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-teal-900 flex items-center justify-center text-xs font-bold shadow-md border border-[#2d4f4a]">{teamB.prefix}</div>
              )}
              <h2 className="text-sm sm:text-base font-heading font-bold text-center truncate max-w-[120px] sm:max-w-[200px]">{teamB.name}</h2>
            </div>
            {teamBCaptain && (
              <div className="text-[10px] sm:text-xs text-gray-400 mb-1">
                © {teamBCaptain.firstName} {teamBCaptain.lastName}
              </div>
            )}
            <div className="text-4xl sm:text-6xl font-mono font-black text-orange-500 leading-none drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">
              {teamBScore}
            </div>
          </div>

          <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto relative z-10">
            {/* Raider Section */}
            <div className="bg-[#1c3530] p-2 rounded-lg border border-[#2d4f4a]">
              <label className="block text-[10px] sm:text-xs text-gray-400 mb-1">Current Raider</label>
              <select
                value={currentRaiderB}
                onChange={(e) => setCurrentRaiderB(Number(e.target.value))}
                className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded px-2 py-1 text-xs text-white mb-2 focus:outline-none focus:border-teal-500"
              >
                <option value="">Select Raider...</option>
                {teamBStarters.map(id => (
                  <option key={id} value={id}>{getPlayerName(id)}</option>
                ))}
              </select>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleScore('B', 'RaidSuccess', 1, Number(currentRaiderB))}
                  disabled={!currentRaiderB}
                  className={`flex-1 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm ${superRaidB ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  ✅ Raid {superRaidB && '(3)'}
                </button>
                <button
                  onClick={() => handleScore('B', 'RaidFail', 0, Number(currentRaiderB))}
                  disabled={!currentRaiderB}
                  className="flex-1 bg-red-600 hover:bg-red-500 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ❌ Fail
                </button>
              </div>
            </div>

            {/* Tackle Section */}
            <div className="bg-[#1c3530] p-2 rounded-lg border border-[#2d4f4a]">
              <label className="block text-[10px] sm:text-xs text-gray-400 mb-1">Tackler</label>
              <select
                value={currentTacklerB}
                onChange={(e) => setCurrentTacklerB(Number(e.target.value))}
                className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded px-2 py-1 text-xs text-white mb-2 focus:outline-none focus:border-teal-500"
              >
                <option value="">Select Tackler...</option>
                {[...teamBStarters, ...teamBSubs].map(id => (
                  <option key={id} value={id}>{getPlayerName(id)}</option>
                ))}
              </select>
              <button
                onClick={() => handleScore('B', 'Tackle', 1, Number(currentTacklerB))}
                disabled={!currentTacklerB}
                className="w-full bg-teal-700 hover:bg-teal-600 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +Tackle Point
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => handleScore('B', 'Bonus', 1)} className="bg-teal-700 hover:bg-teal-600 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm">
                +Bonus
              </button>
              <button onClick={() => handleScore('B', 'AllOut', 2)} className="bg-orange-500 hover:bg-orange-600 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm">
                +All-Out (2)
              </button>
            </div>
            
            <label className={`w-full flex items-center justify-center gap-1.5 p-1.5 rounded border cursor-pointer transition-colors shadow-sm ${superRaidB ? 'bg-teal-900/50 border-teal-500' : 'bg-[#1c3530] border-[#2d4f4a] hover:border-teal-500/50'}`}>
              <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${superRaidB ? 'bg-teal-500 border-teal-500' : 'border-gray-500 bg-[#0f2320]'}`}>
                {superRaidB && <Check className="w-2 h-2 text-white" />}
              </div>
              <input type="checkbox" checked={superRaidB} onChange={(e) => setSuperRaidB(e.target.checked)} className="hidden" />
              <span className="font-bold text-[10px] sm:text-xs text-teal-400">Super Raid Active</span>
            </label>

            <button onClick={() => handleScore('B', 'SuperTackle', 2, Number(currentTacklerB))} className="w-full bg-orange-500 hover:bg-orange-600 py-1.5 rounded font-bold text-[10px] sm:text-xs transition-colors shadow-sm">
              +Super Tackle (2)
            </button>
            <div className="flex gap-1.5 mt-auto pt-1">
              <button onClick={() => handleScore('B', 'MinusSuperTackle', -2)} className="flex-1 bg-red-600 hover:bg-red-500 py-1 rounded font-bold text-[10px] transition-colors shadow-sm">
                -Super Tackle
              </button>
              <button onClick={() => handleScore('B', 'Undo', -1)} className="flex-1 bg-red-600 hover:bg-red-500 py-1 rounded font-bold text-[10px] transition-colors shadow-sm">
                -1 Undo
              </button>
            </div>
          </div>

          {/* Reviews Bar */}
          <div className="bg-[#1c3530] border-t border-[#2d4f4a] p-2 flex flex-col sm:flex-row items-center justify-between relative z-10 gap-1 shrink-0">
            <span className="font-bold text-gray-400 text-[10px] sm:text-xs">Reviews:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="px-1 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-bold">✅ {teamBReviews.success}</span>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => handleReview('B', 'success', true)} className="w-3 h-3 bg-[#2d4f4a] hover:bg-teal-600 rounded flex items-center justify-center text-[8px] font-bold">+</button>
                  <button onClick={() => handleReview('B', 'success', false)} className="w-3 h-3 bg-[#2d4f4a] hover:bg-red-600 rounded flex items-center justify-center text-[8px] font-bold">-</button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-bold">❌ {teamBReviews.fail}</span>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => handleReview('B', 'fail', true)} className="w-3 h-3 bg-[#2d4f4a] hover:bg-teal-600 rounded flex items-center justify-center text-[8px] font-bold">+</button>
                  <button onClick={() => handleReview('B', 'fail', false)} className="w-3 h-3 bg-[#2d4f4a] hover:bg-red-600 rounded flex items-center justify-center text-[8px] font-bold">-</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Log Section */}
      <div className="h-32 sm:h-48 bg-[#0a1816] border-t border-[#2d4f4a] overflow-y-auto p-2">
        <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider sticky top-0 bg-[#0a1816] pb-1">Scoring Log</h3>
        <div className="flex flex-col gap-1">
          {scoringLog.slice().reverse().map((log, index) => {
            const team = log.teamId === teamA.id ? teamA : teamB;
            const player = players.find(p => p.id === log.playerId);
            return (
              <div key={index} className="flex items-center justify-between bg-[#1c3530] p-1.5 rounded text-[10px] sm:text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${log.teamId === teamA.id ? 'text-teal-400' : 'text-orange-400'}`}>{team.prefix}</span>
                  <span className="text-gray-300">{log.type}</span>
                  {player && <span className="text-gray-400">({player.firstName} {player.lastName})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`font-bold ${log.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {log.points > 0 ? '+' : ''}{log.points}
                  </span>
                </div>
              </div>
            );
          })}
          {scoringLog.length === 0 && (
            <div className="text-center text-gray-500 text-xs py-4">No events yet</div>
          )}
        </div>
      </div>

      {/* Match Result Popup */}
      {isResultModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#0f2320] p-6 border-b border-[#2d4f4a] text-center">
              <h2 className="text-3xl font-heading font-bold text-white">Match Result</h2>
              <p className="text-gray-400 mt-2">Confirm final scores and winner</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Team A Row */}
              <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${winnerId === teamA.id ? 'bg-orange-500/10 border-orange-500' : 'bg-[#0f2320] border-[#2d4f4a]'}`}>
                <div className="flex items-center gap-4 w-1/2">
                  {teamA.logoUrl ? (
                    <img src={teamA.logoUrl} alt={teamA.name} className="w-12 h-12 rounded-full object-cover bg-white shadow-md" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-teal-900 flex items-center justify-center text-lg font-bold shadow-md">{teamA.prefix}</div>
                  )}
                  <span className="font-bold text-lg text-white truncate">{teamA.name}</span>
                </div>
                
                <div className="flex items-center gap-6">
                  <input
                    type="number"
                    value={teamAScore}
                    onChange={(e) => setTeamAScore(Number(e.target.value))}
                    className="w-20 bg-[#1c3530] border border-[#2d4f4a] rounded-lg px-3 py-2 text-white text-center text-xl font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${winnerId === teamA.id ? 'bg-orange-500 border-orange-500' : 'border-gray-500 bg-[#1c3530]'}`}>
                      {winnerId === teamA.id && <Check className="w-5 h-5 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={winnerId === teamA.id}
                      onChange={() => setWinnerId(winnerId === teamA.id ? null : teamA.id)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Team B Row */}
              <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${winnerId === teamB.id ? 'bg-orange-500/10 border-orange-500' : 'bg-[#0f2320] border-[#2d4f4a]'}`}>
                <div className="flex items-center gap-4 w-1/2">
                  {teamB.logoUrl ? (
                    <img src={teamB.logoUrl} alt={teamB.name} className="w-12 h-12 rounded-full object-cover bg-white shadow-md" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-teal-900 flex items-center justify-center text-lg font-bold shadow-md">{teamB.prefix}</div>
                  )}
                  <span className="font-bold text-lg text-white truncate">{teamB.name}</span>
                </div>
                
                <div className="flex items-center gap-6">
                  <input
                    type="number"
                    value={teamBScore}
                    onChange={(e) => setTeamBScore(Number(e.target.value))}
                    className="w-20 bg-[#1c3530] border border-[#2d4f4a] rounded-lg px-3 py-2 text-white text-center text-xl font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${winnerId === teamB.id ? 'bg-orange-500 border-orange-500' : 'border-gray-500 bg-[#1c3530]'}`}>
                      {winnerId === teamB.id && <Check className="w-5 h-5 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={winnerId === teamB.id}
                      onChange={() => setWinnerId(winnerId === teamB.id ? null : teamB.id)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#2d4f4a] bg-[#0f2320]">
              <button
                onClick={handleSaveResult}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-orange-500/20 text-lg"
              >
                Save & Submit Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
