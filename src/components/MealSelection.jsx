import { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function MealSelection({ groupId }) {
  const [mealType, setMealType] = useState('veg');
  const [portion, setPortion] = useState('full');
  const [addOns, setAddOns] = useState([]);
  const { currentUser } = useAuth();

  const availableAddOns = [
    { id: 1, name: 'Extra Salad', emoji: '🥗', price: 15 },
    { id: 2, name: 'Dessert', emoji: '🍨', price: 25 },
    { id: 3, name: 'Spicy Curry', emoji: '🌶️', price: 20 }
  ];

  const handleAddOnChange = (addOn) => {
    if (addOns.includes(addOn)) {
      setAddOns(addOns.filter(item => item !== addOn));
    } else {
      setAddOns([...addOns, addOn]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        orders: arrayUnion({
          userId: currentUser.uid,
          mealType,
          portion,
          addOns,
          timestamp: new Date()
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="meal-selection">
      <h2>🍽️ Customize Your Meal</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="meal-card">
          <h3>Meal Type</h3>
          <div className="meal-options">
            <label className={`meal-option ${mealType === 'veg' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="mealType" 
                value="veg" 
                checked={mealType === 'veg'}
                onChange={() => setMealType('veg')}
              />
              <span>Vegetarian 🌱</span>
            </label>
            
            <label className={`meal-option ${mealType === 'non-veg' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="mealType" 
                value="non-veg" 
                checked={mealType === 'non-veg'}
                onChange={() => setMealType('non-veg')}
              />
              <span>Non-Veg 🍗</span>
            </label>
          </div>
        </div>

        <div className="meal-card">
          <h3>Portion Size</h3>
          <div className="portion-options">
            <label className={`portion-option ${portion === 'half' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="portion" 
                value="half" 
                checked={portion === 'half'}
                onChange={() => setPortion('half')}
              />
              <span>Half Portion</span>
              <small>(Light eater)</small>
            </label>
            
            <label className={`portion-option ${portion === 'full' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="portion" 
                value="full" 
                checked={portion === 'full'}
                onChange={() => setPortion('full')}
              />
              <span>Full Portion</span>
              <small>(Hungry mode)</small>
            </label>
          </div>
        </div>

        <div className="meal-card">
          <h3>Add Extras</h3>
          {availableAddOns.map((addOn) => (
            <div className="addon-option" key={addOn.id}>
              <input
                type="checkbox"
                id={`addon-${addOn.id}`}
                checked={addOns.includes(addOn.id)}
                onChange={() => handleAddOnChange(addOn.id)}
              />
              <label htmlFor={`addon-${addOn.id}`} className="addon-label">
                <span className="addon-emoji">{addOn.emoji}</span>
                {addOn.name} (+₹{addOn.price})
              </label>
            </div>
          ))}
        </div>

        <button type="submit" className="btn confetti-btn">
          Submit Order 🚀
        </button>
      </form>
    </div>
  );
}