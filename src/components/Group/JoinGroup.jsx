import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import '../../App.css';

export default function JoinGroup() {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleFindGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!joinCode.trim()) {
      setError('Invite code is required');
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'groups'),
        where('inviteCode', '==', joinCode.toUpperCase().trim())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid invite code');
      }

      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();
      
      setGroupInfo({
        id: groupDoc.id,
        ...groupData
      });
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'groups', groupInfo.id), {
        members: arrayUnion(currentUser.uid),
        [`memberPreferences.${currentUser.uid}`]: {}
      });
      navigate(`/group/${groupInfo.id}/customize`);
    } catch (err) {
      setError('Failed to join group');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group-form-container">
      <h2>Join Existing Group</h2>
      {error && <div className="error-message">{error}</div>}
      
      {!groupInfo ? (
        <form onSubmit={handleFindGroup}>
          <div className="form-group">
            <label>Invite Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Find Group'}
          </button>
        </form>
      ) : (
        <div className="group-preview">
          <h3>Group Found!</h3>
          <div className="group-details">
            <p><strong>Group Name:</strong> {groupInfo.name}</p>
            <p><strong>Vendor:</strong> {groupInfo.vendorName}</p>
            <p><strong>Members:</strong> {groupInfo.members.length}</p>
          </div>
          <button 
            onClick={handleJoinGroup}
            className="submit-btn"
            disabled={loading || groupInfo.members.includes(currentUser.uid)}
          >
            {loading ? 'Joining...' : 
             groupInfo.members.includes(currentUser.uid) ? 
             'Already Member' : 'Join & Customize'}
          </button>
        </div>
      )}
    </div>
  );
}