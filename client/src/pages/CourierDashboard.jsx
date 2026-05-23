import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Truck, Wallet, CheckCircle, HelpCircle, MapPin, Navigation, Navigation2 } from 'lucide-react';
import io from 'socket.io-client';
import { motion } from 'framer-motion';

const storeNames = {
  keells: 'Keells Super',
  cargills: 'Cargills Food City',
  spar: 'SPAR Sri Lanka',
  laugfs: 'Laugfs Super'
};

export const CourierDashboard = () => {
  const { user } = useContext(AuthContext);
  
  const [offers, setOffers] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [earnings, setEarnings] = useState(2400);
  const [loading, setLoading] = useState(true);
  const [gpsSimulating, setGpsSimulating] = useState(false);

  const loadRiderData = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      if (res.data.success) {
        // Separate between job offers (Pending/Confirmed with no courier assigned)
        // and active allocated delivery job
        const allOrders = res.data.data;
        const jobOffers = allOrders.filter(o => 
          (o.status === 'Confirmed' || o.status === 'Preparing') && !o.courier
        );
        const myJob = allOrders.find(o => 
          o.courier && o.courier.id && o.courier.id.toString() === user?._id?.toString() && o.status !== 'Delivered'
        );

        setOffers(jobOffers);
        setActiveJob(myJob || null);
        
        // Settle wallet balance
        if (user) {
          setEarnings(user.balance);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadRiderData();
    }
  }, [user]);

  const handleAcceptJob = async (orderId) => {
    try {
      const res = await axios.put(`${API_URL}/orders/${orderId}/accept`);
      if (res.data.success) {
        setActiveJob(res.data.data);
        loadRiderData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting job offer');
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      const res = await axios.put(`${API_URL}/orders/${activeJob.orderId}/status`, { status });
      if (res.data.success) {
        setActiveJob(res.data.data);
        if (status === 'Delivered') {
          setActiveJob(null);
          loadRiderData();
        }
      }
    } catch (err) {
      alert('Error updating delivery status');
    }
  };

  // GPS Simulation trigger
  const handleSimulateGPS = () => {
    if (!activeJob) return;
    setGpsSimulating(true);

    const socketUrl = 'http://localhost:5005';
    const socket = io(socketUrl);

    let step = 0;
    const totalSteps = 10;
    
    // Keells / Cargills coordinates start
    const startLat = 6.9142;
    const startLng = 79.8519;
    
    // User destination coords
    const endLat = activeJob.deliveryAddress.latitude || 6.9271;
    const endLng = activeJob.deliveryAddress.longitude || 79.8612;

    // Set status to On the Way
    axios.put(`${API_URL}/orders/${activeJob.orderId}/status`, { status: 'On the Way' })
      .then(res => {
        if (res.data.success) setActiveJob(res.data.data);
      });

    const interval = setInterval(() => {
      if (step <= totalSteps) {
        const ratio = step / totalSteps;
        const currentLat = startLat + (endLat - startLat) * ratio;
        const currentLng = startLng + (endLng - startLng) * ratio;

        socket.emit('courier:update_location', {
          courierId: user._id,
          orderId: activeJob.orderId,
          lat: currentLat,
          lng: currentLng
        });

        step++;
      } else {
        clearInterval(interval);
        setGpsSimulating(false);
        socket.disconnect();
        // Auto deliver
        axios.put(`${API_URL}/orders/${activeJob.orderId}/status`, { status: 'Delivered' })
          .then(() => {
            setActiveJob(null);
            loadRiderData();
          });
      }
    }, 2000);
  };

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      <Sidebar role="Courier" />

      <div className="flex-1 px-8 py-8 space-y-10 overflow-y-auto max-w-6xl">
        <header className="flex justify-between items-center">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-ceylon-500 font-sans">Courier Portal</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">Rider Console</h2>
            <p className="text-xs text-slate-500 mt-1">Accept delivery jobs and manage earnings.</p>
          </div>
          <button 
            onClick={loadRiderData}
            className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            Refresh List
          </button>
        </header>

        {/* Courier Earnings & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel border-slate-900 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Daily Earnings</div>
              <div className="text-2xl font-black text-white mt-2">Rs. {earnings.toLocaleString()}</div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-ceylon-500/10 flex items-center justify-center text-ceylon-500">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="glass-panel border-slate-900 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Completed Runs</div>
              <div className="text-2xl font-black text-white mt-2">12 Deliveries</div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="glass-panel border-slate-900 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rating Score</div>
              <div className="text-2xl font-black text-white mt-2">⭐ 4.90</div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-marigold-500/10 flex items-center justify-center text-marigold-500">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dispatch Console (Active delivery) */}
        {activeJob ? (
          <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-marigold-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <div>
                <h3 className="font-extrabold text-white text-base">Active Transit Offer</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Order {activeJob.orderId}</span>
              </div>
              <div className="bg-marigold-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded">
                Status: {activeJob.status}
              </div>
            </div>

            {/* Address paths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3 text-xs">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs flex-shrink-0">🛫</div>
                  <div>
                    <div className="font-bold text-slate-300">Store Pickup Location</div>
                    <div className="text-slate-400 mt-1.5 leading-relaxed">{storeNames[activeJob.store]}</div>
                  </div>
                </div>

                <div className="flex gap-3 text-xs">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs flex-shrink-0">🛬</div>
                  <div>
                    <div className="font-bold text-slate-300">Deliver Destination</div>
                    <div className="text-slate-400 mt-1.5 leading-relaxed">{activeJob.deliveryAddress.text}</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col justify-center gap-3">
                {activeJob.status === 'Preparing' && (
                  <button
                    onClick={() => handleUpdateStatus('Picked Up')}
                    className="py-3 bg-ceylon-500 hover:bg-ceylon-600 text-white font-extrabold text-xs rounded-xl transition-all"
                  >
                    Confirm Store Item Pickup
                  </button>
                )}

                {activeJob.status === 'Picked Up' && (
                  <button
                    onClick={handleSimulateGPS}
                    disabled={gpsSimulating}
                    className="py-3 bg-marigold-500 hover:bg-marigold-600 text-slate-950 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Navigation2 className="w-4 h-4 animate-bounce" />
                    {gpsSimulating ? 'Streaming Live GPS...' : 'Simulate Ride (GPS Drive)'}
                  </button>
                )}

                {activeJob.status === 'On the Way' && (
                  <button
                    onClick={() => handleUpdateStatus('Delivered')}
                    className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all"
                  >
                    Confirm Delivered (Handover)
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel border-slate-900 rounded-3xl p-8 text-center text-slate-500 text-xs">
            No active job. Browse available job requests below.
          </div>
        )}

        {/* Available Job Offers */}
        <section className="space-y-6">
          <h3 className="font-bold text-white text-lg">Job Offers Marketplace</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.length === 0 ? (
              <div className="col-span-2 glass-panel border-slate-900 rounded-3xl p-10 text-center text-slate-500 text-xs">
                No incoming delivery requests at the moment.
              </div>
            ) : (
              offers.map((offer) => (
                <div 
                  key={offer.orderId}
                  className="glass-panel border-slate-900 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-800 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white text-sm">Order {offer.orderId}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{storeNames[offer.store]}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Payout</div>
                      <div className="font-extrabold text-white text-sm mt-0.5">Rs. {(offer.deliveryFee * 0.8).toLocaleString()}</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-4 border-t border-slate-900 pt-3 leading-relaxed">
                    Destination: {offer.deliveryAddress.text}
                  </p>

                  <button
                    onClick={() => handleAcceptJob(offer.orderId)}
                    className="w-full mt-5 py-2.5 bg-slate-900 hover:bg-ceylon-500/10 border border-slate-800 hover:border-ceylon-500/30 text-slate-300 hover:text-ceylon-400 text-xs font-bold rounded-xl transition-all"
                  >
                    Accept Run Offer
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
export default CourierDashboard;
