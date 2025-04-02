import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function TiffinCustomization() {
  const { currentUser } = useAuth();
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [vendor, setVendor] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [setExistingGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Order state
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedPortion, setSelectedPortion] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const initialize = async () => {
      try {
        if (groupId) {
          // Existing group - fetch data
          const groupDoc = await getDoc(doc(db, 'groups', groupId));
          if (groupDoc.exists()) {
            const groupData = groupDoc.data();
            setExistingGroup(groupData);
            setGroupName(groupData.name);
            
            // Fetch vendor details
            const vendorDoc = await getDoc(doc(db, 'vendors', groupData.selectedVendor.id));
            setVendor(vendorDoc.data());
            
            // Load existing order if available
            if (groupData.memberOrders?.[currentUser.uid]) {
              const order = groupData.memberOrders[currentUser.uid];
              setSelectedBase(order.mealType);
              setSelectedPortion(order.portion);
              setSelectedAddOns(order.addOns || []);
              setSpecialInstructions(order.specialInstructions || '');
              setPrice(order.price || 0);
            } else {
              // Set defaults from vendor
              setSelectedBase(vendorDoc.data().tiffinOptions.baseOptions[0].id);
              setSelectedPortion(vendorDoc.data().tiffinOptions.portionSizes[0].id);
            }
          }
        } else {
          // New group - use location state
          setVendor(location.state?.vendor);
          setGroupName(location.state?.groupName);
          setSelectedBase(location.state?.vendor.tiffinOptions.baseOptions[0].id);
          setSelectedPortion(location.state?.vendor.tiffinOptions.portionSizes[0].id);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    initialize();
  }, [groupId, currentUser.uid, location]);

  useEffect(() => {
    if (vendor && selectedBase && selectedPortion) {
      calculatePrice();
    }
  }, [vendor, selectedBase, selectedPortion, selectedAddOns]);

  const calculatePrice = () => {
    if (!vendor) return;
    
    const baseOption = vendor.tiffinOptions.baseOptions.find(b => b.id === selectedBase);
    const portionOption = vendor.tiffinOptions.portionSizes.find(p => p.id === selectedPortion);
    
    if (!baseOption || !portionOption) return;
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const orderData = {
        mealType: selectedBase,
        portion: selectedPortion,
        addOns: selectedAddOns,
        specialInstructions,
        price,
        lastUpdated: new Date()
      };

      if (!groupId) {
        // Create new group
        const newGroup = {
          name: groupName,
          members: [currentUser.uid],
          createdBy: currentUser.uid,
          selectedVendor: {
            id: vendor.id,
            name: vendor.name,
            cuisine: vendor.cuisine
          },
          inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          memberOrders: {
            [currentUser.uid]: orderData
          },
          createdAt: new Date()
        };

        const docRef = await addDoc(collection(db, 'groups'), newGroup);
        navigate(`/group/${docRef.id}`);
      } else {
        // Update existing group
        await updateDoc(doc(db, 'groups', groupId), {
          [`memberOrders.${currentUser.uid}`]: orderData
        });
        navigate(`/group/${groupId}`);
      }
    } catch (err) {
      setError('Failed to save order');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (!vendor) return <div>Vendor not selected</div>;

  return (
    <div className="tiffin-customization-container">
      <h1>Customize Your Tiffin</h1>
      <h2>{groupName} - {vendor.name}</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Base Options */}
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

        {/* Portion Sizes */}
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

        {/* Add-ons */}
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

        {/* Special Instructions */}
        <div className="meal-section">
          <h3>Special Instructions</h3>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="No onions, less spicy, etc."
          />
        </div>

        {/* Price Summary */}
        <div className="price-summary">
          <h3>Your Total: ₹{price}</h3>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Confirm Order'}
        </button>
      </form>
    </div>
  );
}