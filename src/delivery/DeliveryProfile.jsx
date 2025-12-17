import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/delivery/delivery.css';

const DeliveryProfile = () => {
  const [profile, setProfile] = useState({
    username: '',
    mobile: '',
    vehicle: 'Bike',
    city: 'Hyderabad',
    status: 'IDLE',
    currentLatitude: 0.0,
    currentLongitude: 0.0
  });
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [isEditing, setIsEditing] = useState(false);
  const deliveryToken = localStorage.getItem("deliveryToken");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Mock profile data - replace with actual API call
      setProfile({
        username: 'Randy Orthon',
        mobile: '9XXXXXXXXX',
        vehicle: 'Bike',
        city: 'Hyderabad',
        status: 'AVAILABLE',
        currentLatitude: 17.4485,
        currentLongitude: 78.3908
      });
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // eslint-disable-next-line no-unused-vars
            const res = await axios.put(
              `${import.meta.env.VITE_API_URL}/api/delivery/updateLocation`,
              {
                lat: position.coords.latitude,
                lon: position.coords.longitude
              },
              {
                headers: {
                  Authorization: `Bearer ${deliveryToken}`
                }
              }
            );
            setProfile({
              ...profile,
              currentLatitude: position.coords.latitude,
              currentLongitude: position.coords.longitude
            });
            alert("Location updated successfully!");
          } catch (err) {
            alert("Failed to update location");
            console.error(err);
          }
        },
        (error) => {
          alert("Please enable location services");
          console.error(error);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  if (loading) {
    return (
      <div className="delivery-page">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-page">
      <h2>👤 My Profile</h2>

      <div className="profile-card">
        <p><strong>Name:</strong> {profile.username}</p>
        <p><strong>Phone:</strong> {profile.mobile}</p>
        <p><strong>Vehicle:</strong> {profile.vehicle}</p>
        <p><strong>City:</strong> {profile.city}</p>
        <p><strong>Status:</strong> 
          <span style={{
            marginLeft: '12px',
            padding: '4px 12px',
            borderRadius: '12px',
            background: profile.status === 'AVAILABLE' 
              ? 'linear-gradient(135deg, #10b981, #059669)' 
              : 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            fontSize: '14px',
            fontWeight: '700'
          }}>
            {profile.status}
          </span>
        </p>
      </div>

      {/* Location Section */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#065f46', 
          marginBottom: '20px' 
        }}>
          📍 Location
        </h3>
        
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
          border: '2px solid #d1fae5',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <p style={{ 
            fontSize: '16px', 
            color: '#374151', 
            marginBottom: '12px' 
          }}>
            <strong>Latitude:</strong> {profile.currentLatitude.toFixed(6)}
          </p>
          <p style={{ 
            fontSize: '16px', 
            color: '#374151', 
            marginBottom: '20px' 
          }}>
            <strong>Longitude:</strong> {profile.currentLongitude.toFixed(6)}
          </p>
          
          <button 
            className="btn"
            onClick={updateLocation}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            📍 Update Current Location
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#065f46', 
          marginBottom: '20px' 
        }}>
          📊 Statistics
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
            border: '2px solid #d1fae5',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              color: '#10b981',
              margin: '0 0 8px 0'
            }}>
              156
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: 0
            }}>
              Total Deliveries
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
            border: '2px solid #d1fae5',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              color: '#10b981',
              margin: '0 0 8px 0'
            }}>
              4.8★
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: 0
            }}>
              Average Rating
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
            border: '2px solid #d1fae5',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              color: '#10b981',
              margin: '0 0 8px 0'
            }}>
              98%
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: 0
            }}>
              On-Time Rate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfile;