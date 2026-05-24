import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { API_URL } from '../context/AuthContext';
import { CheckCircle2, ShieldCheck, MapPin, Phone, Truck, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadGoogleMaps } from '../utils/loadGoogleMaps';

const storeNames = {
  keells: 'Keells Super',
  cargills: 'Cargills Food City',
  spar: 'SPAR Sri Lanka',
  laugfs: 'Laugfs Super'
};

const statuses = ['Pending', 'Confirmed', 'Preparing', 'Picked Up', 'On the Way', 'Delivered'];

// Preset store coordinates for maps matching seeding configs
const storeCoordinates = {
  keells: { lat: 6.9142, lng: 79.8519 },
  cargills: { lat: 6.8973, lng: 79.8558 },
  spar: { lat: 6.9189, lng: 79.8681 },
  laugfs: { lat: 6.8894, lng: 79.8647 }
};

export const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverCoord, setDriverCoord] = useState({ lat: 6.9142, lng: 79.8519 }); // Start near Keells
  const [destinationCoord, setDestinationCoord] = useState({ lat: 6.9271, lng: 79.8612 }); // Colombo 03
  const [socket, setSocket] = useState(null);

  // Google Maps references
  const [useGoogleMap, setUseGoogleMap] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapObj = useRef(null);
  const courierMarker = useRef(null);

  useEffect(() => {
    loadGoogleMaps((isSuccess) => {
      if (isSuccess && window.google) {
        setMapsLoaded(true);
        setUseGoogleMap(true);
      } else {
        setUseGoogleMap(false);
      }
    });
  }, []);

  const loadOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.data);
        
        // Setup coordinates
        if (res.data.data.deliveryAddress) {
          setDestinationCoord({
            lat: res.data.data.deliveryAddress.latitude,
            lng: res.data.data.deliveryAddress.longitude
          });
        }
        
        const storeCoords = storeCoordinates[res.data.data.store] || storeCoordinates.keells;
        if (res.data.data.courier && res.data.data.courier.lat) {
          setDriverCoord({
            lat: res.data.data.courier.lat,
            lng: res.data.data.courier.lng
          });
        } else {
          // Default driver start to store location
          setDriverCoord(storeCoords);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      navigate('/dashboard');
      return;
    }
    loadOrder();
  }, [orderId]);

  // WebSocket & simulation fallback setup
  useEffect(() => {
    if (!orderId) return;

    const socketUrl = 'http://localhost:5005';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected, joining order channel:', orderId);
      newSocket.emit('join', `order_${orderId}`);
    });

    newSocket.on('order_status_updated', (updatedOrder) => {
      console.log('Order status updated from socket:', updatedOrder.status);
      setOrder(updatedOrder);
    });

    newSocket.on('courier:location_changed', (coords) => {
      console.log('Courier location changed from socket:', coords);
      setDriverCoord(coords);
      if (courierMarker.current && window.google) {
        courierMarker.current.setPosition(new window.google.maps.LatLng(coords.lat, coords.lng));
      }
    });

    // Simulated Courier Movement fallback in case we want a dynamic out-of-the-box movement showcase
    let moveInterval;
    if (order && order.status === 'On the Way') {
      let step = 0;
      const totalSteps = 20;
      
      const storeCoords = storeCoordinates[order.store] || storeCoordinates.keells;
      const startLat = storeCoords.lat;
      const startLng = storeCoords.lng;
      const endLat = destinationCoord.lat;
      const endLng = destinationCoord.lng;

      moveInterval = setInterval(() => {
        if (step <= totalSteps) {
          const ratio = step / totalSteps;
          const currentLat = startLat + (endLat - startLat) * ratio;
          const currentLng = startLng + (endLng - startLng) * ratio;
          const newCoords = { lat: currentLat, lng: currentLng };
          
          setDriverCoord(newCoords);
          if (courierMarker.current && window.google) {
            courierMarker.current.setPosition(new window.google.maps.LatLng(currentLat, currentLng));
          }
          
          // Emit coordinate update mock if we are simulated courier
          newSocket.emit('courier:update_location', {
            courierId: order.courier?.id || 'courier_001',
            orderId: order.orderId,
            lat: currentLat,
            lng: currentLng
          });

          step++;
        } else {
          clearInterval(moveInterval);
          // Auto deliver order simulation for nice demo
          axios.put(`${API_URL}/orders/${orderId}/status`, { status: 'Delivered' });
        }
      }, 3000);
    }

    return () => {
      newSocket.disconnect();
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [orderId, order?.status]);

  // Mount Google Map
  useEffect(() => {
    if (useGoogleMap && mapsLoaded && mapRef.current && order) {
      const storeCoords = storeCoordinates[order.store] || storeCoordinates.keells;
      const mapCenter = {
        lat: (storeCoords.lat + destinationCoord.lat) / 2,
        lng: (storeCoords.lng + destinationCoord.lng) / 2
      };

      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 13,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#198754' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] }
        ],
        disableDefaultUI: true,
        zoomControl: true
      });

      googleMapObj.current = map;

      // Store Marker
      new window.google.maps.Marker({
        position: storeCoords,
        map: map,
        title: storeNames[order.store],
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#10b981',
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#020617'
        }
      });

      // Customer Marker
      new window.google.maps.Marker({
        position: destinationCoord,
        map: map,
        title: 'Delivery Address',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#020617'
        }
      });

      // Active Courier Rider Marker
      const courier = new window.google.maps.Marker({
        position: driverCoord,
        map: map,
        title: 'Rider Location',
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#FFB703',
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#020617'
        }
      });

      courierMarker.current = courier;

      // Draw Path Polyline
      new window.google.maps.Polyline({
        path: [storeCoords, destinationCoord],
        geodesic: true,
        strokeColor: '#FFB703',
        strokeOpacity: 0.6,
        strokeWeight: 4,
        map: map
      });
    }
  }, [useGoogleMap, mapsLoaded, order]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center text-xs text-slate-500 font-semibold">
        <RefreshCw className="w-5 h-5 animate-spin text-ceylon-500 mr-2" /> Loading Live Tracking Interface...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center text-xs text-slate-500">
        Order not found.
      </div>
    );
  }

  const activeIndex = statuses.indexOf(order.status);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Track Order {order.orderId}</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time status and live courier navigation console.</p>
        </div>
        <div className={`px-4.5 py-1.5 rounded-full text-xs font-bold border ${
          order.status === 'Delivered'
            ? 'bg-ceylon-500/10 border-ceylon-500 text-ceylon-400'
            : 'bg-marigold-500/10 border-marigold-500 text-marigold-400'
        }`}>
          {order.status}
        </div>
      </header>

      {/* Progress timeline bar */}
      <div className="glass-panel border-slate-900 rounded-3xl p-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] px-4">
          {statuses.map((status, idx) => {
            const isCompleted = idx <= activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div key={status} className="flex flex-col items-center flex-1 relative">
                {/* Connector line */}
                {idx < statuses.length - 1 && (
                  <div className={`absolute top-4.5 left-1/2 w-full h-[3px] z-0 ${
                    idx < activeIndex ? 'bg-ceylon-500' : 'bg-slate-900'
                  }`}></div>
                )}

                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                  isActive 
                    ? 'bg-marigold-500 text-slate-950 glow-gold scale-110'
                    : isCompleted
                      ? 'bg-ceylon-500 text-white'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}>
                  {isCompleted && !isActive ? '✓' : idx + 1}
                </div>
                
                <span className={`text-[10px] font-bold mt-3 uppercase tracking-wider ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Interactive Simulated/Google Map */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border-slate-900 rounded-3xl p-6 relative overflow-hidden h-[450px] flex flex-col justify-between">
            
            {/* Google Map Div */}
            <div 
              ref={mapRef} 
              className={`absolute inset-0 w-full h-full z-0 ${useGoogleMap ? 'block' : 'hidden'}`}
            ></div>

            {/* Offline Fallback Simulated Map Grid */}
            {!useGoogleMap && (
              <>
                {/* Custom Map Background Image */}
                <img 
                  src="/colombo_map.png" 
                  alt="Live Tracking Map" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 z-0" 
                />

                {/* Custom Grid Map Simulation Overlay */}
                <div className="absolute inset-0 bg-slate-950 opacity-40 grid grid-cols-10 grid-rows-10 gap-0 p-2 z-0">
                  {Array(100).fill(0).map((_, i) => (
                    <div key={i} className="border border-slate-900/20"></div>
                  ))}
                </div>

                {/* Simulated streets / coordinates map canvas */}
                <svg className="absolute inset-0 w-full h-full z-0 opacity-30">
                  <line x1="10%" y1="10%" x2="90%" y2="90%" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                  <line x1="80%" y1="15%" x2="20%" y2="85%" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                  <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="#198754" strokeWidth="3" strokeDasharray="6" />
                </svg>

                {/* Store location marker */}
                <div className="absolute top-[25%] left-[20%] z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-green-700 flex items-center justify-center text-sm border border-slate-800 font-bold shadow-lg">
                    🏪
                  </div>
                  <span className="bg-slate-900/90 text-white font-extrabold text-[9px] px-2 py-0.5 rounded border border-slate-800 mt-1">
                    {storeNames[order.store]}
                  </span>
                </div>

                {/* Customer location marker */}
                <div className="absolute top-[75%] left-[75%] z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-xl bg-blue-700 flex items-center justify-center text-sm border border-slate-800 font-bold shadow-lg">
                    🏠
                  </div>
                  <span className="bg-slate-900/90 text-white font-extrabold text-[9px] px-2 py-0.5 rounded border border-slate-800 mt-1">
                    Deliver Destination
                  </span>
                </div>

                {/* Live moving Courier Marker */}
                {order.courier && (
                  <motion.div 
                    animate={{
                      top: order.status === 'Delivered' 
                        ? '75%' 
                        : order.status === 'On the Way' 
                          ? '50%'
                          : '25%',
                      left: order.status === 'Delivered' 
                        ? '75%' 
                        : order.status === 'On the Way' 
                          ? '47%'
                          : '20%'
                    }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                    className="absolute z-10 flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-marigold-500 flex items-center justify-center text-lg border border-slate-950 font-bold shadow-lg pulse-marker">
                      R
                    </div>
                    <span className="bg-slate-900/90 text-white font-extrabold text-[9px] px-2 py-0.5 rounded border border-slate-800 mt-1">
                      Rider: {order.courier.name}
                    </span>
                  </motion.div>
                )}
              </>
            )}

            {/* Map Header Panel */}
            <div className="z-10 bg-slate-900/90 border border-slate-850 p-4.5 rounded-2xl w-full sm:w-60">
              <div className="text-[10px] uppercase font-bold tracking-wider text-ceylon-500 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Rider Coordinates
              </div>
              <div className="text-white text-xs font-bold mt-2 truncate">
                Lat: {driverCoord.lat.toFixed(5)} <br />
                Lng: {driverCoord.lng.toFixed(5)}
              </div>
            </div>

            {/* Warn Overlay if API Key is missing */}
            {!useGoogleMap && (
              <div className="z-10 text-[10px] text-slate-500 font-semibold self-end bg-slate-950/80 px-3 py-1 rounded flex items-center gap-1 border border-slate-900">
                <AlertTriangle className="w-3.5 h-3.5 text-marigold-500" />
                <span>Simulated Offline Map (API Key Missing)</span>
              </div>
            )}
          </div>
        </div>

        {/* Courier Details & Order summary column */}
        <div className="space-y-6">
          {/* Courier profile */}
          {order.courier ? (
            <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base">Allocated Courier</h3>
              
              <div className="flex items-center gap-4 border-b border-slate-900 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-2xl border border-slate-800">
                  👨‍✈️
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm">{order.courier.name}</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-ceylon-500" />
                    Verified Courier Partner
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Contact Driver</span>
                  <a 
                    href={`tel:${order.courier.phone}`}
                    className="flex items-center gap-1 text-ceylon-500 font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" /> {order.courier.phone}
                  </a>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Courier Vehicle</span>
                  <span className="text-white font-bold capitalize">{order.courier.courierType || 'Bike Rider'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel border-slate-900 rounded-3xl p-6 text-center text-slate-500 text-xs">
              Waiting for supermarkets to verify stock or dispatch rider...
            </div>
          )}

          {/* Delivery destination summary */}
          <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Destination Details</h3>
            <div className="flex gap-3 text-xs">
              <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <div>
                <div className="text-white font-bold">Shipping Address</div>
                <div className="text-slate-400 mt-1 leading-relaxed">{order.deliveryAddress.text}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default OrderTracking;
