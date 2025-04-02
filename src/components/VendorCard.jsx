export default function VendorCard({ vendor, onSelect, isSelected, disabled }) {
    return (
      <div 
      className={`vendor-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onSelect : undefined}
    >

        
        <div className="vendor-image">
          <img src={vendor.image || '/assets/default-vendor.jpg'} alt={vendor.name} />
        </div>
        <div className="vendor-info">
          <h3>{vendor.name}</h3>
          <p className="cuisine">{vendor.cuisine}</p>
          <div className="vendor-meta">
            <span className="rating">⭐ {vendor.rating || '4.5'}</span>
            <span className="delivery-time">⏱️ {vendor.deliveryTime || '30-45 mins'}</span>
          </div>
          <p className="description">{vendor.description || 'Specializing in home-style meals'}</p>
        </div>
        <button className="btn btn-select">
          {isSelected ? 'Selected' : 'Select Vendor'}
        </button>
      </div>
    );
  }