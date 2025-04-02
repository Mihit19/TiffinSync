import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import VendorCard from '../VendorCard';
import OrderStatus from '../OrderStatus';
import { FiArrowLeft, FiShoppingBag, FiInfo, FiPlus, FiSettings } from 'react-icons/fi';

export default function GroupView() {
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' or 'orders'
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Fetch group data
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (!groupDoc.exists()) {
          throw new Error('Group not found');
        }

        const groupData = groupDoc.data();
        if (!groupData.members.includes(currentUser.uid)) {
          throw new Error('You are not a member of this group');
        }

        setGroup(groupData);
        setIsCreator(groupData.createdBy === currentUser.uid);
        
        // If group has a selected vendor, show orders tab by default
        if (groupData.selectedVendor) {
          setSelectedVendor(groupData.selectedVendor);
          setActiveTab('orders');
        }

        // Fetch available vendors
        const vendorsSnapshot = await getDocs(collection(db, 'vendors'));
        const vendorsList = [];
        vendorsSnapshot.forEach(doc => {
          vendorsList.push({ id: doc.id, ...doc.data() });
        });
        setVendors(vendorsList);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, currentUser.uid]);

  const handleSelectVendor = async (vendor) => {
    try {
      if (!isCreator) {
        throw new Error('Only the group creator can change the vendor');
      }

      await updateDoc(doc(db, 'groups', groupId), {
        selectedVendor: vendor,
        orderStatus: 'pending'
      });
      setSelectedVendor(vendor);
      setActiveTab('orders');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="group-view-container">
      <div className="group-header">
        <button onClick={() => navigate('/dashboard')} className="btn btn-back">
          <FiArrowLeft /> Back
        </button>
        <h1>{group.name}</h1>
        <div className="group-meta">
          <span>{group.members.length} members</span>
          <button 
            onClick={() => navigate(`/group/${groupId}/settings`)}
            className="btn btn-settings"
          >
            <FiSettings /> Settings
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendors')}
        >
          <FiShoppingBag /> {selectedVendor ? 'Vendors' : 'Select Vendor'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
          disabled={!selectedVendor}
        >
          <FiInfo /> Order Status
        </button>
      </div>

      {activeTab === 'vendors' ? (
        <div className="vendors-container">
          <h2>Available Tiffin Vendors</h2>
          {!isCreator && selectedVendor && (
            <div className="info-message">
              <p>Current vendor: {selectedVendor.name}</p>
              <p>Only the group creator can change the vendor</p>
            </div>
          )}
          {vendors.length === 0 ? (
            <div className="empty-state">
              <p>No vendors available in your area</p>
            </div>
          ) : (
            <div className="vendors-grid">
              {vendors.map(vendor => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onSelect={() => handleSelectVendor(vendor)}
                  isSelected={selectedVendor?.id === vendor.id}
                  disabled={!isCreator && selectedVendor?.id !== vendor.id}
                />
            ))}
            </div>
          )}
        </div>
      ) : (
        <div className="orders-container">
          {selectedVendor && (
            <>
              <div className="current-vendor">
                <h2>Current Vendor: {selectedVendor.name}</h2>
                {isCreator && (
                  <button 
                    className="btn btn-outline"
                    onClick={() => setActiveTab('vendors')}
                  >
                    <FiPlus /> Change Vendor
                  </button>
                )}
              </div>
              <OrderStatus 
                groupId={groupId}
                vendor={selectedVendor}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}