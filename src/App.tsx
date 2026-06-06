import { HashRouter, Routes, Route } from 'react-router-dom';
import Game from './pages/Game';
import History from './pages/History';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </HashRouter>
  );
}
