import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';

export default function OrderStatus({ groupId, vendor }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'groups', groupId), (doc) => {
      if (doc.exists()) {
        setOrder(doc.data().currentOrder || { status: 'pending' });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [groupId]);

  const statusSteps = [
    { id: 1, status: 'pending', label: 'Order Placed', icon: <FiClock /> },
    { id: 2, status: 'preparing', label: 'Preparing', icon: <FiCheckCircle /> },
    { id: 3, status: 'on-the-way', label: 'On the Way', icon: <FiTruck /> },
    { id: 4, status: 'delivered', label: 'Delivered', icon: <FiCheckCircle /> },
  ];

  return (
    <div className="order-status-container">
      <h3>Current Order Status</h3>
      
      {loading ? (
        <div className="loading">Loading order details...</div>
      ) : (
        <>
          <div className="status-tracker">
            {statusSteps.map(step => (
              <div 
                key={step.id}
                className={`status-step ${order.status === step.status ? 'active' : ''} ${
                  statusSteps.findIndex(s => s.status === order.status) >= step.id ? 'completed' : ''
                }`}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>

          <div className="order-details">
            <h4>Order Details</h4>
            <p><strong>Vendor:</strong> {vendor.name}</p>
            <p><strong>Status:</strong> {order.status.replace('-', ' ')}</p>
            <p><strong>Estimated Delivery:</strong> 12:30 PM</p>
          </div>

          <div className="order-actions">
            <button className="btn btn-primary">View Full Order</button>
            <button className="btn btn-outline">Contact Vendor</button>
          </div>
        </>
      )}
    </div>
  );
}