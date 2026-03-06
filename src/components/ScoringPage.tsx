import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Square, Check, X, Pause } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const ScoringPage = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { matches, teams, updateMatch } = useAppContext();
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

  const handleScore = (team: 'A' | 'B', type: string, points: number) => {
    if (team === 'A') {
      let finalPoints = points;
      if (type === 'Raid' && superRaidA) {
        finalPoints = 3;
        setSuperRaidA(false);
      }
      setTeamAScore((prev) => Math.max(0, prev + finalPoints));
    } else {
      let finalPoints = points;
      if (type === 'Raid' && superRaidB) {
        finalPoints = 3;
        setSuperRaidB(false);
      }
      setTeamBScore((prev) => Math.max(0, prev + finalPoints));
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
    });
    setIsResultModalOpen(false);
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-[#0f2320] text-white flex flex-col z-50 overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="bg-[#1c3530] border-b border-[#2d4f4a] p-2 sm:p-4 flex flex-col items-center justify-center relative shadow-lg z-10">
        <button onClick={() => navigate('/')} className="absolute left-4 top-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h2 className="text-sm sm:text-xl font-heading font-bold text-gray-300 mb-1 sm:mb-2">
          {teamA.name} <span className="text-orange-500 mx-1 sm:mx-2">VS</span> {teamB.name}
        </h2>
        <div className="text-4xl sm:text-6xl font-mono font-black tracking-wider text-white mb-2 sm:mb-4 drop-shadow-md">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handleHalfControl}
            disabled={halfState === 4}
            className={`px-4 py-2 sm:px-8 sm:py-3 rounded-full font-bold text-sm sm:text-lg flex items-center gap-2 sm:gap-3 transition-all shadow-lg ${
              halfState === 0 || halfState === 2
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                : halfState === 1 || halfState === 3
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {(halfState === 0 || halfState === 2) ? <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
            {halfState === 0 && 'Start Half 1'}
            {halfState === 1 && 'End Half 1'}
            {halfState === 2 && 'Start Half 2'}
            {halfState === 3 && 'End Half 2'}
            {halfState === 4 && 'Match Ended'}
          </button>

          {(halfState === 1 || halfState === 3) && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-4 py-2 sm:px-8 sm:py-3 rounded-full font-bold text-sm sm:text-lg flex items-center gap-2 sm:gap-3 transition-all shadow-lg ${
                isPaused ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 animate-pulse' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
      </div>

      {/* Scoring Panels */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Team A Panel */}
        <div className="w-1/2 border-r border-[#2d4f4a] flex flex-col bg-[#0a1816] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/10 to-transparent pointer-events-none"></div>
          
          <div className="p-2 sm:p-4 flex flex-col items-center border-b border-[#2d4f4a] relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
              {teamA.logoUrl ? (
                <img src={teamA.logoUrl} alt={teamA.name} className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover bg-white shadow-md border-2 border-[#2d4f4a]" />
              ) : (
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-teal-900 flex items-center justify-center text-sm sm:text-lg font-bold shadow-md border-2 border-[#2d4f4a]">{teamA.prefix}</div>
              )}
              <h2 className="text-lg sm:text-2xl font-heading font-bold text-center truncate max-w-[150px] sm:max-w-xs">{teamA.name}</h2>
            </div>
            <div className="text-6xl sm:text-8xl lg:text-[100px] font-mono font-black text-orange-500 leading-none drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              {teamAScore}
            </div>
          </div>

          <div className="flex-1 p-2 sm:p-4 flex flex-col gap-2 sm:gap-3 overflow-y-auto relative z-10">
            <button onClick={() => handleScore('A', 'Raid', 1)} className={`w-full py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors shadow-md ${superRaidA ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'bg-teal-700 hover:bg-teal-600 shadow-teal-700/20'}`}>
              +Raid Point {superRaidA && '(3)'}
            </button>
            <button onClick={() => handleScore('A', 'Tackle', 1)} className="w-full bg-teal-700 hover:bg-teal-600 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors shadow-md shadow-teal-700/20">
              +Tackle Point
            </button>
            <button onClick={() => handleScore('A', 'Bonus', 1)} className="w-full bg-teal-700 hover:bg-teal-600 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors shadow-md shadow-teal-700/20">
              +Bonus Point
            </button>
            <button onClick={() => handleScore('A', 'AllOut', 2)} className="w-full bg-orange-500 hover:bg-orange-600 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors shadow-md shadow-orange-500/20">
              +All-Out (2)
            </button>
            
            <label className={`w-full flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-colors shadow-md ${superRaidA ? 'bg-teal-900/50 border-teal-500' : 'bg-[#1c3530] border-[#2d4f4a] hover:border-teal-500/50'}`}>
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border flex items-center justify-center ${superRaidA ? 'bg-teal-500 border-teal-500' : 'border-gray-500 bg-[#0f2320]'}`}>
                {superRaidA && <Check className="w-3 h-3 text-white" />}
              </div>
              <input type="checkbox" checked={superRaidA} onChange={(e) => setSuperRaidA(e.target.checked)} className="hidden" />
              <span className="font-bold text-sm sm:text-base text-teal-400">Super Raid Active</span>
            </label>

            <button onClick={() => handleScore('A', 'SuperTackle', 2)} className="w-full bg-orange-500 hover:bg-orange-600 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors shadow-md shadow-orange-500/20">
              +Super Tackle (2)
            </button>
            <div className="flex gap-2 sm:gap-3 mt-auto pt-2">
              <button onClick={() => handleScore('A', 'MinusSuperTackle', -2)} className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-lg font-bold text-xs sm:text-sm transition-colors shadow-md shadow-red-600/20">
                -Super Tackle
              </button>
              <button onClick={() => handleScore('A', 'Undo', -1)} className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-lg font-bold text-xs sm:text-sm transition-colors shadow-md shadow-red-600/20">
                -1 Undo
              </button>
            </div>
          </div>

          {/* Reviews Bar */}
          <div className="bg-[#1c3530] border-t border-[#2d4f4a] p-2 sm:p-4 flex flex-col sm:flex-row items-center justify-between relative z-10 gap-2">
            <span className="font-bold text-gray-400 text-xs sm:text-sm">Reviews:</span>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-green-500/20 text-green-400 rounded text-xs sm:text-sm font-bold">✅ {teamAReviews.success}</span>
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  <button onClick={() => handleReview('A', 'success', true)} className="w-4 h-4 sm:w-5 sm:h-5 bg-[#2d4f4a] hover:bg-teal-600 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold">+</button>
                  <button onClick={() => handleReview('A', 'success', false)} className="w-4 h-4 sm:w-5 sm:h-5 bg-[#2d4f4a] hover:bg-red-600 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold">-</button>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-500/20 text-red-400 rounded text-xs sm:text-sm font-bold">❌ {teamAReviews.fail}</span>
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  <button onClick={() => handleReview('A', 'fail', true)} className="w-4 h-4 sm:w-5 sm:h-5 bg-[#2d4f4a] hover:bg-teal-600 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold">+</button>
                  <button onClick={() => handleReview('A', 'fail', false)} className="w-4 h-4 sm:w-5 sm:h-5 bg-[#2d4f4a] hover:bg-red-600 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold">-</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team B Panel */}
        <div className="w-1/2 flex flex-col bg-[#0a1816] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/10 to-transparent pointer-events-none"></div>
          
          <div className="p-2 sm:p-4 flex flex-col items-center border-b border-[#2d4f4a] relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
              {teamB.logoUrl ? (
                <img src={teamB.logoUrl} alt={teamB.name} className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover bg-white shadow-md border-2 border-[#2d4f4a]" />
              ) : (
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-teal-900 flex items-center justify-center text-sm sm:text-lg font-bold shadow-md border-2 border-[#2d4f4a]">{teamB.prefix}</div>
              )}
              <h2 className="text-lg sm:text-2xl font-heading font-bold text-center truncate max-w-[150px] sm:max-w-xs">{teamB.name}</h2>
            </div>
            <div className="text-6xl sm:text-8xl lg:text-[100px] font-mono font-black text-orange-500 leading-none drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              {teamBScore}
            </div>
          </div>

          <div className="flex-1 p-2 sm:p-4 flex flex-col gap-2 sm:gap-3 overflow-y-auto relative z-10">
            <button onClick={() => handleScore('B', 'Raid', 1)} className={`w-full py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors shadow-md ${superRaidB ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'bg-teal-700 hover:bg-teal-600 shadow-teal-700/20'}`}>
              +Raid Point {superRaidB && '(3)'}
            </button>
            <button onClick={() => handleScore('B', 'Tackle', 1)} className="w-full bg-teal-700 hover:bg-teal-600 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors shadow-md shadow-teal-700/20">
              +Tackle Point
            </button>
            <button onClick={() => handleScore('B', 'Bonus', 1)} className="w-full bg-teal-700 hover:bg-teal-600 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors shadow-md shadow-teal-700/20">
              +Bonus Point
            </button>
            <button onClick={() => handleScore('B', 'AllOut', 2)} className="w-full bg-orange-500 hover:bg-orange-600 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors shadow-md shadow-orange-500/20">
              +All-Out (2)
            </button>
            
            <label className={`w-full flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-colors shadow-md ${superRaidB ? 'bg-teal-900/50 border-teal-500' : 'bg-[#1c3530] border-[#2d4f4a] hover:border-teal-500/50'}`}>
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border flex items-center justify-center ${superRaidB ? 'bg-teal-500 border-teal-500' : 'border-gray-500 bg-[#0f2320]'}`}>
                {superRaidB && <Check className="w-3 h-3 text-white" />}
              </div>
              <input type="checkbox" checked={superRaidB} onChange={(e) => setSuperRaidB(e.target.checked)} className="hidden" />
              <span className="font-bold text-sm sm:text-base text-teal-400">Super Raid Active</span>
            </label>

            <button onClick={() => handleScore('B', 'SuperTackle', 2)} className="w-full bg-orange-500 hover:bg-orange-600 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors shadow-md shadow-orange-500/20">
              +Super Tackle (2)
            </button>
            <div className="flex gap-2 sm:gap-3 mt-auto pt-2">
              <button onClick={() => handleScore('B', 'MinusSuperTackle', -2)} className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-lg font-bold text-xs sm:text-sm transition-colors shadow-md shadow-red-600/20">
                -Super Tackle
              </button>
              <button onClick={() => handleScore('B', 'Undo', -1)} className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-lg font-bold text-xs sm:text-sm transition-colors shadow-md shadow-red-600/20">
                -1 Undo
              </button>
            </div>
          </div>

          {/* Reviews Bar */}
          <div className="bg-[#1c3530] border-t border-[#2d4f4a] p-2 sm:p-4 flex flex-col sm:flex-row items-center justify-between relative z-10 gap-2">
            <span className="font-bold text-gray-400 text-xs sm:text-sm">Reviews:</span>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-green-500/20 text-green-400 rounded text-xs sm:text-sm font-bold">✅ {teamBReviews.success}</span>
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  <button onClick={() => handleReview('B', 'success', true)} className="w-4 h-4 sm:w-5 sm:h-5 bg-[#2d4f4a] hover:bg-teal-600 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold">+</button>
                  <button onClick={() => handleReview('B', 'success', false)} className="w-4 h-4 sm:w-5 sm:h-5 bg-[#2d4f4a] hover:bg-red-600 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold">-</button>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-500/20 text-red-400 rounded text-xs sm:text-sm font-bold">❌ {teamBReviews.fail}</span>
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  <button onClick={() => handleReview('B', 'fail', true)} className="w-4 h-4 sm:w-5 sm:h-5 bg-[#2d4f4a] hover:bg-teal-600 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold">+</button>
                  <button onClick={() => handleReview('B', 'fail', false)} className="w-4 h-4 sm:w-5 sm:h-5 bg-[#2d4f4a] hover:bg-red-600 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold">-</button>
                </div>
              </div>
            </div>
          </div>
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
