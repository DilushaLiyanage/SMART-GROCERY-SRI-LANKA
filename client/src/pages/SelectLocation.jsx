import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Navigation, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadGoogleMaps } from '../utils/loadGoogleMaps';

const colomboAreas = [
  { name: 'Colombo 03 - Kollupitiya', lat: 6.9142, lng: 79.8519 },
  { name: 'Colombo 04 - Bambalapitiya', lat: 6.8973, lng: 79.8558 },
  { name: 'Colombo 07 - Cinnamon Gardens', lat: 6.9189, lng: 79.8681 },
  { name: 'Colombo 05 - Havelock Town', lat: 6.8894, lng: 79.8647 },
  { name: 'Colombo 02 - Slave Island', lat: 6.9242, lng: 79.8545 }
];

export const SelectLocation = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedArea, setSelectedArea] = useState(colomboAreas[0]);
  const [addressText, setAddressText] = useState(user?.location?.address || 'Colombo 03, Sri Lanka');
  const [pinCoord, setPinCoord] = useState({ lat: 6.9142, lng: 79.8519 });
  const [success, setSuccess] = useState(false);

  // Google Maps Integration states
  const [useGoogleMap, setUseGoogleMap] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapObj = useRef(null);
  const markerObj = useRef(null);

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

  // Initialize Google Maps
  useEffect(() => {
    if (useGoogleMap && mapsLoaded && mapRef.current) {
      const center = { lat: pinCoord.lat, lng: pinCoord.lng };
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 14,
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

      const marker = new window.google.maps.Marker({
        position: center,
        map: map,
        draggable: true,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#198754',
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#020617'
        }
      });

      googleMapObj.current = map;
      markerObj.current = marker;

      // Handle marker drag
      window.google.maps.event.addListener(marker, 'dragend', () => {
        const position = marker.getPosition();
        const lat = position.lat();
        const lng = position.lng();
        setPinCoord({ lat, lng });
        setSelectedArea({ name: 'Custom Marker Placement', lat, lng });
        setAddressText(`Pin at [${lat.toFixed(4)}, ${lng.toFixed(4)}], Colombo, Sri Lanka`);
      });

      // Handle map click
      map.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.setPosition({ lat, lng });
        setPinCoord({ lat, lng });
        setSelectedArea({ name: 'Custom Map Click', lat, lng });
        setAddressText(`Pin at [${lat.toFixed(4)}, ${lng.toFixed(4)}], Colombo, Sri Lanka`);
      });
    }
  }, [useGoogleMap, mapsLoaded]);

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setPinCoord({ lat: area.lat, lng: area.lng });
    setAddressText(`${area.name}, Colombo, Sri Lanka`);

    if (useGoogleMap && googleMapObj.current && markerObj.current) {
      const center = { lat: area.lat, lng: area.lng };
      googleMapObj.current.panTo(center);
      markerObj.current.setPosition(center);
    }
  };

  const handleMapClickSimulated = (e) => {
    if (useGoogleMap) return; // Ignore if using real Google Maps
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickLat = 6.93 - (y / rect.height) * 0.05;
    const clickLng = 79.84 + (x / rect.width) * 0.04;
    
    setPinCoord({ lat: clickLat, lng: clickLng });
    setSelectedArea({ name: 'Custom Pinned Location', lat: clickLat, lng: clickLng });
    setAddressText(`Custom Pin [${clickLat.toFixed(4)}, ${clickLng.toFixed(4)}], Colombo, Sri Lanka`);
  };

  const handleConfirmLocation = () => {
    if (!addressText) return;
    
    if (user) {
      user.location = {
        latitude: pinCoord.lat,
        longitude: pinCoord.lng,
        address: addressText
      };
    }
    
    setSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-center gap-12 min-h-[calc(100vh-73px)]">
      
      {/* Instructions Column */}
      <div className="w-full lg:w-5/12 flex flex-col text-center lg:text-left">
        <span className="text-ceylon-500 font-extrabold text-xs tracking-wider uppercase mb-3">Location Dispatch Verification</span>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
          Where should we <br />
          <span className="text-gradient-ceylon">Deliver?</span>
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto lg:mx-0">
          Supermarket availability, stock limits, and travel ETAs are customized based on your selected delivery coordinate region.
        </p>

        {/* Areas selector buttons */}
        <div className="space-y-3">
          {colomboAreas.map((area) => (
            <button
              key={area.name}
              onClick={() => handleAreaSelect(area)}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                selectedArea.name === area.name
                  ? 'bg-ceylon-500/10 border-ceylon-500 text-white'
                  : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800'
              }`}
            >
              <span className="text-xs font-bold">{area.name}</span>
              <MapPin className={`w-4 h-4 ${selectedArea.name === area.name ? 'text-ceylon-500' : 'text-slate-600'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Map selector Column */}
      <div className="w-full lg:w-7/12 space-y-6">
        <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-6 relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-white text-base">
                {useGoogleMap ? 'Google Maps Delivery Selector' : 'Simulated Location Map'}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {useGoogleMap ? 'Drag the marker pin or click anywhere on Google Maps to lock address.' : 'Click directly on the map grid to place a custom shipping pin.'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl text-[10px] text-slate-400 font-semibold self-start sm:self-auto">
              <MapPin className="w-3.5 h-3.5 text-marigold-500" />
              <span>[{pinCoord.lat.toFixed(4)}, {pinCoord.lng.toFixed(4)}]</span>
            </div>
          </div>

          {/* Google Maps Container */}
          <div className="relative h-[300px] w-full rounded-2xl overflow-hidden border border-slate-900">
            {/* Google Map Div */}
            <div 
              ref={mapRef} 
              className={`w-full h-full ${useGoogleMap ? 'block' : 'hidden'}`}
            ></div>

            {/* Fallback Simulated Map Grid */}
            {!useGoogleMap && (
              <div 
                onClick={handleMapClickSimulated}
                className="w-full h-full bg-slate-950/90 relative overflow-hidden cursor-crosshair"
              >
                {/* Grid layout */}
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 p-2 opacity-50 z-0">
                  {Array(100).fill(0).map((_, i) => (
                    <div key={i} className="border border-slate-900/30"></div>
                  ))}
                </div>

                {/* Simulated streets vector */}
                <svg className="absolute inset-0 w-full h-full z-0 opacity-20 pointer-events-none">
                  <line x1="0" y1="10%" x2="100%" y2="80%" stroke="#64748b" strokeWidth="5" />
                  <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#64748b" strokeWidth="5" />
                </svg>

                {/* Preset labels */}
                <div className="absolute top-[20%] left-[25%] w-3 h-3 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center pointer-events-none"><span className="text-[8px] absolute -top-4 text-slate-500 font-bold">Keells</span></div>
                <div className="absolute top-[50%] left-[45%] w-3 h-3 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center pointer-events-none"><span className="text-[8px] absolute -top-4 text-slate-500 font-bold">Cargills</span></div>
                <div className="absolute top-[80%] left-[70%] w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center pointer-events-none"><span className="text-[8px] absolute -top-4 text-slate-500 font-bold">Laugfs</span></div>

                {/* Simulated Pin Marker */}
                <div 
                  style={{
                    top: `${((6.93 - pinCoord.lat) / 0.05) * 100}%`,
                    left: `${((pinCoord.lng - 79.84) / 0.04) * 100}%`
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-ceylon-500 flex items-center justify-center text-sm border border-slate-950 font-bold shadow-lg pulse-marker">
                    📍
                  </div>
                </div>
              </div>
            )}

            {/* Warn Overlay if API Key is missing */}
            {!useGoogleMap && (
              <div className="absolute bottom-3 left-3 right-3 bg-[#020617]/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 text-[10px] text-slate-400 font-semibold z-20 pointer-events-none">
                <AlertTriangle className="w-4 h-4 text-marigold-500 flex-shrink-0" />
                <span>VITE_GOOGLE_MAPS_API_KEY is not configured in env. Displaying offline simulated vector map.</span>
              </div>
            )}
          </div>

          {/* Delivery text input */}
          <div className="space-y-1.5">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Confirm Street Address</span>
            <div className="relative">
              <Navigation className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Colombo 03, Sri Lanka"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-900 focus:border-ceylon-500 rounded-xl text-xs font-semibold text-white outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleConfirmLocation}
            disabled={success}
            className="w-full py-4 bg-ceylon-500 hover:bg-ceylon-600 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-xl shadow-ceylon-500/20 hover:scale-[1.01]"
          >
            {success ? (
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Location Locked</span>
            ) : (
              <>
                <span>Enter Smart Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
export default SelectLocation;
