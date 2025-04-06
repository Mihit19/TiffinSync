import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function BillSplit() {
  const { groupId } = useParams();
  const { currentUser, userData } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMemberDetails = async (memberIds) => {
      const membersData = await Promise.all(
        memberIds.map(async (memberId) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', memberId));
            if (userDoc.exists()) {
              return {
                id: memberId,
                name: userDoc.data().displayName || userDoc.data().email.split('@')[0],
                email: userDoc.data().email
              };
            }
            return { id: memberId, name: `User ${memberId.slice(0, 4)}` };
          } catch (err) {
            return { id: memberId, name: `User ${memberId.slice(0, 4)}` };
          }
        })
      );
      return membersData;
    };

    const unsubscribe = onSnapshot(doc(db, 'groups', groupId), async (doc) => {
      if (doc.exists()) {
        const groupData = doc.data();
        const membersInfo = await fetchMemberDetails(groupData.members);
        
        const membersWithDetails = groupData.members.map(memberId => {
          const memberInfo = membersInfo.find(m => m.id === memberId) || { 
            name: `User ${memberId.slice(0, 4)}`,
            email: ''
          };
          
          const order = groupData.memberOrders?.[memberId] || {};
          const total = order.price || 0;
          
          return {
            id: memberId,
            name: memberId === currentUser?.uid ? 'You' : memberInfo.name,
            email: memberInfo.email,
            mealType: order.mealType || 'Not ordered',
            portion: order.portion || '',
            addOns: order.addOns || [],
            specialInstructions: order.specialInstructions || '',
            total,
            lastUpdated: order.lastUpdated || null
          };
        });

        membersWithDetails.sort((a, b) => b.total - a.total);
        
        setGroup({
          ...groupData,
          membersWithDetails,
          total: membersWithDetails.reduce((sum, member) => sum + member.total, 0)
        });
        setLoading(false);
      } else {
        setError('Group not found');
        setLoading(false);
      }
    }, (err) => {
      setError('Failed to load group data');
      setLoading(false);
    });

    return unsubscribe;
  }, [groupId, currentUser?.uid]);

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="bill-split-container">
      <div className="bill-header">
        <Link to={`/group/${groupId}`} className="btn btn-back">
          ← Back to Group
        </Link>
        <h1>Bill Split - {group.name}</h1>
        <h2>Vendor: {group.selectedVendor?.name}</h2>
      </div>

      <div className="summary-card">
        <h3>Total Group Bill: ₹{group.total}</h3>
        <p>{group.members.length} members</p>
      </div>

      <div className="members-list">
        {group.membersWithDetails.map(member => (
          <div 
            key={member.id} 
            className={`member-card ${member.id === currentUser?.uid ? 'current-user' : ''}`}
          >
            <div className="member-info">
              <div className="member-avatar">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3>{member.name}</h3>
                <p className="meal-details">
                  {member.mealType} ({member.portion}) - ₹{member.total}
                </p>
                {member.addOns.length > 0 && (
                  <p className="addons">Add-ons: {member.addOns.join(', ')}</p>
                )}
                {member.specialInstructions && (
                  <p className="instructions">Notes: {member.specialInstructions}</p>
                )}
              </div>
            </div>
            {member.lastUpdated && (
              <div className="last-updated">
                {new Date(member.lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bill-actions">
        <button className="btn btn-primary">
          Request Payments
        </button>
      </div>
    </div>
  );
}