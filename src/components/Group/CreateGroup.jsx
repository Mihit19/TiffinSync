import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import '../../App.css';

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetchingVendors, setIsFetchingVendors] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vendors'));
        const vendorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVendors(vendorsData);
      } catch (err) {
        setError('Failed to load vendors');
        console.error(err);
      } finally {
        setIsFetchingVendors(false);
      }
    };

    fetchVendors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!groupName.trim()) {
      setError('Group name is required');
      setLoading(false);
      return;
    }

    if (!selectedVendor) {
      setError('Please select a vendor');
      setLoading(false);
      return;
    }

    try {
      const newGroup = {
        name: groupName,
        members: [currentUser.uid],
        createdBy: currentUser.uid,
        admin: currentUser.uid,
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.name,
        createdAt: new Date(),
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        memberPreferences: {
          [currentUser.uid]: {}
        }
      };

      const docRef = await addDoc(collection(db, 'groups'), newGroup);
      navigate(`/group/${docRef.id}/customize`);
    } catch (err) {
      setError('Failed to create group');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group-form-container">
      <h2>Create New Group</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g., Office Lunch Group"
            required
          />
        </div>

        <div className="form-group">
          <label>Select Vendor</label>
          {isFetchingVendors ? (
            <div className="loading">Loading vendors...</div>
          ) : (
            <div className="vendor-grid">
              {vendors.map(vendor => (
                <div 
                  key={vendor.id}
                  className={`vendor-card ${selectedVendor?.id === vendor.id ? 'selected' : ''}`}
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <h3>{vendor.name}</h3>
                  <p>{vendor.description}</p>
                  <div className="vendor-details">
                    <span>🍛 {vendor.menuItems?.length || 0} options</span>
                    <span>🚚 {vendor.deliveryRadius} km radius</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading || !selectedVendor || !groupName.trim()}
        >
          {loading ? 'Creating...' : 'Create Group & Customize'}
        </button>
      </form>
    </div>
  );
}