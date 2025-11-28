import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BscConfigPage from './pages/BscConfigPage';
import EthConfigPage from './pages/EthConfigPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bsc" element={<BscConfigPage />} />
        <Route path="/eth" element={<EthConfigPage />} />
      </Routes>
    </Router>
  );
}

export default App;
