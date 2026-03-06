/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Competitions } from './components/Competitions';
import { CompetitionDetail } from './components/CompetitionDetail';
import { Teams } from './components/Teams';
import { Players } from './components/Players';
import { ScoringPage } from './components/ScoringPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="competitions" element={<Competitions />} />
            <Route path="competitions/:id" element={<CompetitionDetail />} />
            <Route path="teams" element={<Teams />} />
            <Route path="players" element={<Players />} />
          </Route>
          <Route path="/scoring/:matchId" element={<ScoringPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

