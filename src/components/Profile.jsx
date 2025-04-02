import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FiHome, FiUser, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import '../App.css';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword && newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    try {
      setLoading(true);
      
      // Update email if changed
      if (email !== currentUser.email) {
        await updateEmail(currentUser, email);
        setMessage('Email updated successfully');
      }

      // Update password if provided
      if (newPassword) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        setMessage('Password updated successfully');
        
        // Clear password fields
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      setError('Failed to log out');
      console.error(err);
    }
  };

  return (
    <div className="profile-layout">
      {/* Navigation Sidebar (same as Dashboard for consistency) */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>TiffinSync</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <FiHome className="nav-icon" />
            <span>Dashboard</span>
          </Link>
          <Link to="/profile" className="nav-item active">
            <FiUser className="nav-icon" />
            <span>Profile</span>
          </Link>
          <button onClick={handleLogout} className="nav-item logout">
            <FiLogOut className="nav-icon" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        <div className="profile-header">
          <button 
            className="btn-back"
            onClick={() => navigate('/dashboard')}
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
          <h1>Your Profile</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="profile-card">
          <div className="profile-info">
            <div className="avatar">
              {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h2>{currentUser?.email}</h2>
              <p>Member since: {new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label>Current Password (required for changes)</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field"
                placeholder="Enter current password to make changes"
              />
            </div>

            <div className="form-group">
              <label>New Password (leave blank to keep unchanged)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="New password"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirm new password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-save"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}