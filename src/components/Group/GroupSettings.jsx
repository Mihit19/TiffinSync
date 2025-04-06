import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FiArrowLeft, FiUsers, FiDollarSign, FiUser, FiCheck, FiX, FiEdit } from 'react-icons/fi';

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
  const [editingOrder, setEditingOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (!groupDoc.exists()) throw new Error('Group not found');
        
        const groupData = groupDoc.data();
        setGroup(groupData);
        setIsCreator(groupData.createdBy === currentUser?.uid);

        // Set current user's order if exists
        if (groupData.memberOrders?.[currentUser?.uid]) {
          setCurrentOrder(groupData.memberOrders[currentUser.uid]);
        }

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

  const handleEditOrder = () => {
    setEditingOrder(true);
  };

  const handleSaveOrder = async (updatedOrder) => {
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        [`memberOrders.${currentUser.uid}`]: updatedOrder
      });
      setCurrentOrder(updatedOrder);
      setEditingOrder(false);
    } catch (err) {
      setError('Failed to update order');
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(false);
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

        {group.selectedVendor && (
          <div className="settings-section">
            <h2>Your Order</h2>
            {editingOrder ? (
              <OrderEditor
                vendor={group.selectedVendor}
                currentOrder={currentOrder}
                onSave={handleSaveOrder}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="order-summary">
                {currentOrder ? (
                  <>
                    <div className="order-details">
                      <p><strong>Meal:</strong> {currentOrder.mealType}</p>
                      <p><strong>Portion:</strong> {currentOrder.portion}</p>
                      {currentOrder.addOns.length > 0 && (
                        <p><strong>Add-ons:</strong> {currentOrder.addOns.join(', ')}</p>
                      )}
                      {currentOrder.specialInstructions && (
                        <p><strong>Notes:</strong> {currentOrder.specialInstructions}</p>
                      )}
                      <p><strong>Price:</strong> ₹{currentOrder.price}</p>
                    </div>
                    <button 
                      onClick={handleEditOrder}
                      className="btn btn-edit-order"
                    >
                      <FiEdit /> Edit Order
                    </button>
                  </>
                ) : (
                  <>
                    <p>You haven't placed an order yet</p>
                    <button 
                      onClick={() => setEditingOrder(true)}
                      className="btn btn-primary"
                    >
                      Create Order
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
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

function OrderEditor({ vendor, currentOrder, onSave, onCancel }) {
  const [selectedBase, setSelectedBase] = useState(currentOrder?.mealType || vendor.tiffinOptions.baseOptions[0].id);
  const [selectedPortion, setSelectedPortion] = useState(currentOrder?.portion || vendor.tiffinOptions.portionSizes[0].id);
  const [selectedAddOns, setSelectedAddOns] = useState(currentOrder?.addOns || []);
  const [specialInstructions, setSpecialInstructions] = useState(currentOrder?.specialInstructions || '');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    calculatePrice();
  }, [selectedBase, selectedPortion, selectedAddOns]);

  const calculatePrice = () => {
    const baseOption = vendor.tiffinOptions.baseOptions.find(b => b.id === selectedBase);
    const portionOption = vendor.tiffinOptions.portionSizes.find(p => p.id === selectedPortion);
    
    const addOnsTotal = selectedAddOns.reduce((sum, addOnId) => {
      const addOn = vendor.tiffinOptions.addOns.find(a => a.id === addOnId);
      return sum + (addOn?.price || 0);
    }, 0);
    
    const calculatedPrice = Math.round(
      (baseOption.basePrice * portionOption.multiplier) + addOnsTotal
    );
    
    setPrice(calculatedPrice);
  };

  const handleAddOnToggle = (addOnId) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId) 
        : [...prev, addOnId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      mealType: selectedBase,
      portion: selectedPortion,
      addOns: selectedAddOns,
      specialInstructions,
      price,
      lastUpdated: new Date()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="order-editor">
      <div className="meal-section">
        <h3>Meal Type</h3>
        <div className="option-group">
          {vendor.tiffinOptions.baseOptions.map(option => (
            <label 
              key={option.id}
              className={`option-card ${selectedBase === option.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="mealType"
                value={option.id}
                checked={selectedBase === option.id}
                onChange={() => setSelectedBase(option.id)}
              />
              <div>
                <span>{option.name}</span>
                <p className="option-description">{option.description}</p>
                <p className="option-price">₹{option.basePrice}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="meal-section">
        <h3>Portion Size</h3>
        <div className="option-group">
          {vendor.tiffinOptions.portionSizes.map(option => (
            <label 
              key={option.id}
              className={`option-card ${selectedPortion === option.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="portion"
                value={option.id}
                checked={selectedPortion === option.id}
                onChange={() => setSelectedPortion(option.id)}
              />
              <div>
                <span>{option.name}</span>
                <p className="option-description">{option.description}</p>
                {option.multiplier !== 1 && (
                  <p className="option-price">{option.multiplier * 100}% of base price</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="meal-section">
        <h3>Add-ons</h3>
        <div className="addons-grid">
          {vendor.tiffinOptions.addOns.map(addOn => (
            <label 
              key={addOn.id}
              className={`addon-item ${selectedAddOns.includes(addOn.id) ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedAddOns.includes(addOn.id)}
                onChange={() => handleAddOnToggle(addOn.id)}
              />
              <div>
                <span>{addOn.name}</span>
                <p className="addon-description">{addOn.description}</p>
                <p className="addon-price">+₹{addOn.price}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="meal-section">
        <h3>Special Instructions</h3>
        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="No onions, less spicy, etc."
        />
      </div>

      <div className="price-summary">
        <h3>Your Total: ₹{price}</h3>
      </div>

      <div className="order-actions">
        <button type="button" onClick={onCancel} className="btn btn-cancel">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Order
        </button>
      </div>
    </form>
  );
}