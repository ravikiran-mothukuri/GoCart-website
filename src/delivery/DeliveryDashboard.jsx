// import "../delivery/delivery.css";

const DeliveryDashboard = () => {
  return (
    <div className="delivery-page">
      <h2>👋 Welcome, Delivery Partner</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Orders</h3>
          <p>2</p>
        </div>

        <div className="stat-card">
          <h3>Completed Today</h3>
          <p>5</p>
        </div>

        <div className="stat-card">
          <h3>Today’s Earnings</h3>
          <p>₹650</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
