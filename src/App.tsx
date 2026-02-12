import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AppView from './pages/AppView';
import LockScreen from './components/App/LockScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<AppView />} />
        <Route
          path="/locked"
          element={
            <LockScreen
              onUnlock={() => window.location.href = '/app'}
              childName={localStorage.getItem('childName') || 'your child'}
            />
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
