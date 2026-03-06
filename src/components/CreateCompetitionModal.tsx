import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface CreateCompetitionModalProps {
  onClose: () => void;
}

export const CreateCompetitionModal: React.FC<CreateCompetitionModalProps> = ({ onClose }) => {
  const { teams, addCompetition, addMatch, competitions } = useAppContext();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<'League' | 'Knockout' | 'Round Robin'>('League');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberOfTeams, setNumberOfTeams] = useState<number>(4);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!name || !startDate || !endDate || !numberOfTeams) {
        setError('Please fill in all details.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedTeams.length !== numberOfTeams) {
        setError(`Please select exactly ${numberOfTeams} teams.`);
        return;
      }
      setStep(3);
    }
  };

  const handleSave = () => {
    const newCompId = competitions.length ? Math.max(...competitions.map(c => c.id)) + 1 : 1;
    const fixtureIds: number[] = [];

    // Generate fixtures (simple round robin)
    for (let i = 0; i < selectedTeams.length; i++) {
      for (let j = i + 1; j < selectedTeams.length; j++) {
        const matchId = addMatch({
          competitionId: newCompId,
          teamAId: selectedTeams[i],
          teamBId: selectedTeams[j],
          status: 'upcoming',
          halfDuration: 20,
          teamAScore: 0,
          teamBScore: 0,
          winnerId: null,
          teamAReviews: { success: 0, fail: 0 },
          teamBReviews: { success: 0, fail: 0 },
          scoringLog: [],
        });
        fixtureIds.push(matchId);
      }
    }

    addCompetition({
      name,
      type,
      startDate,
      endDate,
      numberOfTeams,
      teamIds: selectedTeams,
      fixtures: fixtureIds,
    });
    onClose();
  };

  const toggleTeam = (id: number) => {
    setSelectedTeams((prev) =>
      prev.includes(id) ? prev.filter((tId) => tId !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1c3530] border border-[#2d4f4a] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#2d4f4a]">
          <h2 className="text-xl font-heading font-bold text-white">Create Competition</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2d4f4a] px-6">
          {['Details', 'Add Teams', 'Fixtures'].map((tab, idx) => (
            <div
              key={tab}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                step === idx + 1
                  ? 'border-orange-500 text-orange-500'
                  : step > idx + 1
                  ? 'border-transparent text-teal-400'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {idx + 1}. {tab}
            </div>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Competition Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none"
                >
                  <option value="League">League</option>
                  <option value="Knockout">Knockout</option>
                  <option value="Round Robin">Round Robin</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Number of Teams</label>
                <input
                  type="number"
                  value={numberOfTeams}
                  onChange={(e) => setNumberOfTeams(Number(e.target.value))}
                  min="2"
                  className="w-full bg-[#0f2320] border border-[#2d4f4a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTeams.map((id) => {
                  const team = teams.find((t) => t.id === id);
                  return (
                    <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-teal-900/50 text-teal-400 rounded-full text-sm font-medium border border-teal-800">
                      {team?.name}
                      <button onClick={() => toggleTeam(id)} className="hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                  );
                })}
              </div>
              <div className="text-sm text-gray-400 mb-4">Selected: {selectedTeams.length} / {numberOfTeams}</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
                {teams.map((team) => {
                  const isSelected = selectedTeams.includes(team.id);
                  return (
                    <div
                      key={team.id}
                      onClick={() => toggleTeam(team.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-900/30 border-teal-500' : 'bg-[#0f2320] border-[#2d4f4a] hover:border-teal-500/50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                        isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-500'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex items-center gap-3">
                        {team.logoUrl ? (
                          <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded-full object-cover bg-white" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-teal-900 flex items-center justify-center text-xs font-bold text-white">{team.prefix}</div>
                        )}
                        <span className="font-medium text-white">{team.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center py-8">
              <div className="w-16 h-16 bg-teal-900/50 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-white">Ready to Generate</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {numberOfTeams} teams selected. We will auto-generate the fixtures based on the {type} format.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#2d4f4a] flex justify-end gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-xl font-bold text-white bg-[#2d4f4a] hover:bg-[#3d6f6a] transition-colors"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
            >
              Save Competition
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
