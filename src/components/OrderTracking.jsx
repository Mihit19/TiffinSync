import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function OrderTracking({ groupId }) {
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "groups", groupId), (doc) => {
      const groupData = doc.data();
      setStatus(groupData.status || "Pending");
      setLoading(false);
    });
    return unsubscribe;
  }, [groupId]);

  if (loading) return <div>Loading...</div>;

  const statusSteps = [
    { id: 1, name: "Pending", active: status === "Pending" },
    { id: 2, name: "Preparing", active: status === "Preparing" },
    { id: 3, name: "On the way", active: status === "On the way" },
    { id: 4, name: "Delivered", active: status === "Delivered" },
  ];

  return (
    <div className="order-tracking">
      <h3>Order Status</h3>
      <div className="status-steps">
        {statusSteps.map((step) => (
          <div
            key={step.id}
            className={`step ${step.active ? "active" : ""}`}
          >
            {step.name}
          </div>
        ))}
      </div>
    </div>
  );
}