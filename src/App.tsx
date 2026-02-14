import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import AppView from './pages/AppView';
import LockScreen from './components/App/LockScreen';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Wrapper for LockScreen to handle navigation using React Router (SPA transition)
const LockScreenWrapper = () => {
  const navigate = useNavigate();
  return (
    <LockScreen
      onUnlock={() => navigate('/app')}
      childName={localStorage.getItem('childName') || 'your child'}
    />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<AppView />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/locked"
          element={<LockScreenWrapper />}
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
