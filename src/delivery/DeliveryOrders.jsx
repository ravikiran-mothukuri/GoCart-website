import '../styles/delivery/delivery.css';

const DeliveryOrders = () => {
  const orders = [
    {
      id: 101,
      customer: "Ravi",
      address: "Madhapur, Hyderabad",
      status: "OUT_FOR_DELIVERY",
    },
    {
      id: 102,
      customer: "Anil",
      address: "Gachibowli, Hyderabad",
      status: "PICKED_UP",
    },
  ];

  return (
    <div className="delivery-page">
      <h2>📦 Assigned Orders</h2>

      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Customer:</strong> {order.customer}</p>
          <p><strong>Address:</strong> {order.address}</p>
          <p><strong>Status:</strong> {order.status}</p>

          <button className="btn">Mark as Delivered</button>
        </div>
      ))}
    </div>
  );
};

export default DeliveryOrders;


