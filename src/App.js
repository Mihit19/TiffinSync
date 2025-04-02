import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Loader from './components/Loader';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard';
import CreateGroup from './components/Group/CreateGroup';
import JoinGroup from './components/Group/JoinGroup';
import GroupView from './components/Group/GroupView';
import MealSelection from './components/MealSelection';
import BillSplit from './components/BillSplit';
import OrderTracking from './components/OrderTracking';
import TiffinCustomization from './components/Group/TiffinCustomization';
import VendorSelection from './components/Group/VendorSelection';
import './App.css';
import { initializeVendors } from './initializeVendors';
import Profile from './components/Profile';
import GroupSettings from './components/Group/GroupSettings';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
}

function FloatingFoodIcons() {
  // Array of food emojis with random positions
  const foodEmojis = ['🍛', '🥘', '🍲', '🍚', '🍗', '🥗', '🍜', '🍱'];
  
  return (
    <>
      {foodEmojis.map((emoji, index) => (
        <span 
          key={index}
          className="food-icon"
          style={{
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            fontSize: `${Math.random() * 1 + 1.5}rem`,
            animationDelay: `${index * 0.5}s`,
            opacity: 0.7
          }}
        >
          {emoji}
        </span>
      ))}
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    // For development only - will only run once
    const initializeData = async () => {
      try {
        const result = await initializeVendors();
        if (result.success) {
          console.log(`Initialized ${result.count} vendors`);
        } else {
          console.log('Vendors already exist or initialization failed');
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    // Only run in development mode
    if (process.env.NODE_ENV === 'development') {
      initializeData();
    }
  }, []);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handle successful order submission
  const handleOrderSuccess = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <AuthProvider>
      {loading ? (
        <Loader />
      ) : (
        <div className="app-container">
          {/* Background elements */}
          <FloatingFoodIcons />
          
          {/* Confetti effect */}
          {showConfetti && (
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => (
                <div 
                  key={i}
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}
            </div>
          )}

          {/* Main application routes */}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/profile" element={<Profile />} />
              <Route 
                path="/group/:groupId/bill" 
                element={
                  <PrivateRoute>
                    <BillSplit />
                  </PrivateRoute>
                }/>
              
              <Route path="/create-group" element={<VendorSelection />} />
              <Route path="/create-group/customize" element={<TiffinCustomization />} />
            <Route path="/join-group" element={<JoinGroup />} />
            <Route path="/group/:groupId/customize" element={<TiffinCustomization />} />
            <Route path="/group/:groupId/bill" element={<BillSplit />} />
            <Route path="/group/:groupId/settings" element={<GroupSettings />} />
            <Route path="/group/:groupId/vendors" element={<VendorSelection />} />
              <Route
                path="/create-group"
                element={
                  <PrivateRoute>
                    <CreateGroup />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/join-group"
                element={
                  <PrivateRoute>
                    <JoinGroup />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/group/:groupId"
                element={
                  <PrivateRoute>
                    <GroupView onOrderSuccess={handleOrderSuccess} />
                  </PrivateRoute>
                }
              >
                <Route index element={<MealSelection />} />
                <Route path="bill" element={<BillSplit />} />
                <Route path="tracking" element={<OrderTracking />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </div>
      )}
    </AuthProvider>
  );
}

export default App;