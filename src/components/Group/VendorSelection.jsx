import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { doc, updateDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import VendorCard from '../VendorCard';

export default function VendorSelection() {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChangingVendor, setIsChangingVendor] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if we're changing vendor for existing group
        if (groupId) {
          const groupDoc = await getDoc(doc(db, 'groups', groupId));
          if (groupDoc.exists()) {
            setIsChangingVendor(true);
            setSelectedVendor(groupDoc.data().selectedVendor || null);
          }
        }

        // Fetch vendors
        const querySnapshot = await getDocs(collection(db, 'vendors'));
        const vendorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVendors(vendorsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const handleVendorSelect = async () => {
    try {
      if (!selectedVendor) {
        setError('Please select a vendor');
        return;
      }

      if (isChangingVendor) {
        // Update existing group's vendor
        await updateDoc(doc(db, 'groups', groupId), {
          selectedVendor: selectedVendor
        });
        navigate(`/group/${groupId}/settings`);
      } else {
        // Create new group flow (original behavior)
        navigate('/create-group/customize', {
          state: {
            vendor: selectedVendor,
            groupName: location.state?.groupName || ''
          }
        });
      }
    } catch (err) {
      setError('Failed to save vendor selection');
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="vendor-selection-container">
      <h1>{isChangingVendor ? 'Change Group Vendor' : 'Create New Group'}</h1>
      
      {!isChangingVendor && (
        <form className="group-name-form">
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              value={location.state?.groupName || ''}
              onChange={(e) => navigate('.', { 
                state: { groupName: e.target.value },
                replace: true 
              })}
              placeholder="e.g., Office Lunch Group"
              required={!isChangingVendor}
            />
          </div>
        </form>
      )}

      <h2>Select a Vendor</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="vendors-grid">
        {vendors.map(vendor => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            isSelected={selectedVendor?.id === vendor.id}
            onSelect={() => setSelectedVendor(vendor)}
          />
        ))}
      </div>

      <button 
        onClick={handleVendorSelect}
        className="btn btn-primary"
        disabled={!selectedVendor || (!isChangingVendor && !location.state?.groupName)}
      >
        {isChangingVendor ? 'Confirm Vendor Change' : 'Continue to Customize'}
      </button>

      {isChangingVendor && (
        <button 
          onClick={() => navigate(`/group/${groupId}/settings`)}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      )}
    </div>
  );
}