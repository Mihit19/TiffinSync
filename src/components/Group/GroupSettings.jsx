import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FiArrowLeft, FiUsers, FiDollarSign, FiUser, FiCheck, FiX } from 'react-icons/fi';

export default function GroupSettings() {
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Fetch group data
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (!groupDoc.exists()) throw new Error('Group not found');
        
        const groupData = groupDoc.data();
        setGroup(groupData);
        setIsCreator(groupData.createdBy === currentUser?.uid);

        // Fetch member details
        const membersData = await Promise.all(
          groupData.members.map(async (memberId) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', memberId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                  id: memberId,
                  name: userData.displayName || userData.email.split('@')[0],
                  email: userData.email
                };
              }
              return { id: memberId, name: 'User not found', email: '' };
            } catch (err) {
              return { id: memberId, name: 'Error loading user', email: '' };
            }
          })
        );
        
        setMembers(membersData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (currentUser) fetchGroupData();
  }, [groupId, currentUser]);

  const handleVendorChangeInit = () => {
    setShowConfirm(true);
  };

  const handleConfirmVendorChange = async () => {
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        selectedVendor: null
      });
      navigate(`/group/${groupId}/vendors`);
    } catch (err) {
      setError('Failed to initiate vendor change');
    }
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!group) return <div className="error-message">Group not found</div>;

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button onClick={() => navigate(`/group/${groupId}`)} className="btn btn-back">
          <FiArrowLeft /> Back to Group
        </button>
        <h1>{group.name} Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2><FiUsers /> Group Members</h2>
          <div className="members-list">
            {members.map(member => (
              <div key={member.id} className="member-item">
                <div className="member-avatar">
                  <FiUser />
                </div>
                <div className="member-details">
                  <span className="member-name">{member.name}</span>
                </div>
                {member.id === group.createdBy && (
                  <span className="creator-badge">Creator</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h2><FiDollarSign /> Current Vendor</h2>
          {group.selectedVendor ? (
            <div className="current-vendor">
              <div className="vendor-info">
                <h3>{group.selectedVendor.name}</h3>
                <p>{group.selectedVendor.description}</p>
              </div>
              {isCreator && (
                <button 
                  onClick={handleVendorChangeInit}
                  className="btn btn-change-vendor"
                >
                  Change Vendor
                </button>
              )}
            </div>
          ) : (
            <div className="no-vendor">
              <p>No vendor selected</p>
              {isCreator && (
                <button 
                  onClick={() => navigate(`/group/${groupId}/vendors`)}
                  className="btn btn-primary"
                >
                  Select Vendor
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Vendor Change</h3>
            <p>Are you sure you want to change the vendor for this group?</p>
            <div className="confirmation-buttons">
              <button 
                onClick={() => setShowConfirm(false)}
                className="btn btn-cancel"
              >
                <FiX /> Cancel
              </button>
              <button 
                onClick={handleConfirmVendorChange}
                className="btn btn-confirm"
              >
                <FiCheck /> Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}