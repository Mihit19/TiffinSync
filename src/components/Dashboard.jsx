import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiPlus, FiUsers, FiHome, FiUser, FiLogOut, FiBell } from 'react-icons/fi';
import GroupCard from './Group/GroupCard';
import Profile from './Profile';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsRef = collection(db, 'groups');
        const q = query(groupsRef, where('members', 'array-contains', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const userGroups = [];
        querySnapshot.forEach((doc) => {
          userGroups.push({ id: doc.id, ...doc.data() });
        });
        
        setGroups(userGroups);
        setLoading(false);
      } catch (err) {
        setError('Failed to load groups');
        console.error(err);
        setLoading(false);
      }
    };

    fetchGroups();
  }, [currentUser.uid]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      const newGroup = {
        name: groupName,
        members: [currentUser.uid],
        createdBy: currentUser.uid,
        createdAt: new Date(),
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      };

      const docRef = await addDoc(collection(db, 'groups'), newGroup);
      setGroups([...groups, { id: docRef.id, ...newGroup }]);
      setGroupName('');
      setShowCreateForm(false);
      navigate(`/group/${docRef.id}`);
    } catch (err) {
      setError('Failed to create group');
      console.error(err);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!joinCode.trim()) {
      setError('Invite code is required');
      return;
    }

    try {
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('inviteCode', '==', joinCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid invite code');
        return;
      }

      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();

      if (groupData.members.includes(currentUser.uid)) {
        setError('You are already in this group');
        return;
      }

      await updateDoc(groupDoc.ref, {
        members: [...groupData.members, currentUser.uid]
      });

      setGroups([...groups, { id: groupDoc.id, ...groupData }]);
      setJoinCode('');
      setShowJoinForm(false);
      navigate(`/group/${groupDoc.id}`);
    } catch (err) {
      setError('Failed to join group');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      //await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to log out');
    }
  };

  const Profile = async () => {
    try {
      //await logout();
      navigate('/Profile');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Navigation Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>TiffinSync</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <FiHome className="nav-icon" />
            <span>Dashboard</span>
          </Link>
          <div className="nav-item" onClick={Profile}>
            <FiUser className="nav-icon" />
            <span>Profile</span>
          </div>
          <Link to="/notifications" className="nav-item">
            <FiBell className="nav-icon" />
            <span>Notifications</span>
          </Link>
          <div className="nav-item logout" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
            <span>Logout</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Your Tiffin Groups</h1>
          <div className="header-actions">
            <button 
              className="btn btn-create"
              onClick={() => setShowCreateForm(true)}
            >
              <FiPlus /> Create Group
            </button>
            <button 
              className="btn btn-join"
              onClick={() => setShowJoinForm(true)}
            >
              <FiUsers /> Join Group
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="groups-container">
            {groups.length === 0 ? (
              <div className="empty-state">
                <img src="/assets/empty-group.svg" alt="No groups" />
                <h3>No groups yet</h3>
                <p>Create or join a group to get started</p>
              </div>
            ) : (
              groups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={group}
                  onClick={() => navigate(`/group/${group.id}`)}
                />
              ))
            )}
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Create New Group</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowCreateForm(false)}
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleCreateGroup}>
                <div className="form-group">
                  <label>Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g., Office Lunch Group"
                    className="input-field"
                  />
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-cancel"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-confirm">
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Group Modal */}
        {showJoinForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Join Existing Group</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowJoinForm(false)}
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleJoinGroup}>
                <div className="form-group">
                  <label>Invite Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="input-field"
                  />
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-cancel"
                    onClick={() => setShowJoinForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-confirm">
                    Join Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}