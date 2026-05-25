import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Navigation, X, Check, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadGoogleMaps } from '../utils/loadGoogleMaps';

const colomboAreas = [
  { name: 'Polhengoda Road', lat: 6.8972, lng: 79.8781 },
  { name: 'Colombo 03 - Kollupitiya', lat: 6.9142, lng: 79.8519 },
  { name: 'Colombo 04 - Bambalapitiya', lat: 6.8973, lng: 79.8558 },
  { name: 'Colombo 07 - Cinnamon Gardens', lat: 6.9189, lng: 79.8681 },
  { name: 'Colombo 05 - Havelock Town', lat: 6.8894, lng: 79.8647 },
  { name: 'Colombo 02 - Slave Island', lat: 6.9242, lng: 79.8545 }
];

export const LocationModal = ({ isOpen, onClose }) => {
  const { currentLocation, updateLocation } = useContext(AuthContext);
  const [addressText, setAddressText] = useState(currentLocation?.address || '');
  const [pinCoord, setPinCoord] = useState({
    lat: currentLocation?.latitude || 6.8972,
    lng: currentLocation?.longitude || 79.8781
  });

  const [useGoogleMap, setUseGoogleMap] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tempSuccess, setTempSuccess] = useState(false);

  const mapRef = useRef(null);
  const googleMapObj = useRef(null);
  const markerObj = useRef(null);
  const inputRef = useRef(null);
  const autocompleteObj = useRef(null);

  // Sync state if currentLocation changes when modal is open
  useEffect(() => {
    if (isOpen && currentLocation) {
      setAddressText(currentLocation.address);
      setPinCoord({ lat: currentLocation.latitude, lng: currentLocation.longitude });
    }
  }, [isOpen, currentLocation]);

  // Load Google Maps API
  useEffect(() => {
    if (isOpen) {
      loadGoogleMaps((isSuccess) => {
        if (isSuccess && window.google) {
          setMapsLoaded(true);
          setUseGoogleMap(true);
        } else {
          setUseGoogleMap(false);
        }
      });
    }
  }, [isOpen]);

  // Initialize/Update Google Map
  useEffect(() => {
    if (isOpen && useGoogleMap && mapsLoaded && mapRef.current) {
      const center = { lat: pinCoord.lat, lng: pinCoord.lng };

      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 15,
        styles: [
          // Light clean map styles matching the light theme
          { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
          { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
          { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
          { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
          { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
          { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
          { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }
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
          fillColor: '#06C167', // Ceylon Green
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#ffffff'
        }
      });

      googleMapObj.current = map;
      markerObj.current = marker;

      // Handle marker drag
      window.google.maps.event.addListener(marker, 'dragend', () => {
        const position = marker.getPosition();
        const lat = position.lat();
        const lng = position.lng();
        const coords = { lat, lng };
        setPinCoord(coords);
        reverseGeocode(coords);
      });

      // Handle map click
      map.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const coords = { lat, lng };
        marker.setPosition(coords);
        setPinCoord(coords);
        reverseGeocode(coords);
      });
    }
  }, [isOpen, useGoogleMap, mapsLoaded]);

  // Set up Google Places Autocomplete
  useEffect(() => {
    if (isOpen && useGoogleMap && mapsLoaded && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'lk' }, // restrict to Sri Lanka
        fields: ['formatted_address', 'geometry']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const coords = { lat, lng };
          setPinCoord(coords);
          
          if (place.formatted_address) {
            setAddressText(place.formatted_address);
          }

          if (googleMapObj.current && markerObj.current) {
            googleMapObj.current.panTo(coords);
            googleMapObj.current.setZoom(16);
            markerObj.current.setPosition(coords);
          }
        }
      });

      autocompleteObj.current = autocomplete;
    }
  }, [isOpen, useGoogleMap, mapsLoaded]);

  // Reverse Geocoding Helper
  const reverseGeocode = ({ lat, lng }) => {
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setAddressText(results[0].formatted_address);
        } else {
          fallbackOSMReverseGeocode(lat, lng);
        }
      });
    } else {
      fallbackOSMReverseGeocode(lat, lng);
    }
  };

  // OpenStreetMap Nominatim reverse geocode fallback
  const fallbackOSMReverseGeocode = (lat, lng) => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.display_name) {
          setAddressText(data.display_name);
        } else {
          setAddressText(`Pin at [${lat.toFixed(4)}, ${lng.toFixed(4)}], Colombo, Sri Lanka`);
        }
      })
      .catch(() => {
        setAddressText(`Pin at [${lat.toFixed(4)}, ${lng.toFixed(4)}], Colombo, Sri Lanka`);
      });
  };

  // Quick Select click handler
  const handleAreaSelect = (area) => {
    const coords = { lat: area.lat, lng: area.lng };
    setPinCoord(coords);
    setAddressText(area.name + ', Colombo, Sri Lanka');

    if (useGoogleMap && googleMapObj.current && markerObj.current) {
      googleMapObj.current.panTo(coords);
      googleMapObj.current.setZoom(15);
      markerObj.current.setPosition(coords);
    }
  };

  // Geolocation API - Fetch Current GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLoadingLocation(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const coords = { lat, lng };

        setPinCoord(coords);
        reverseGeocode(coords);

        if (useGoogleMap && googleMapObj.current && markerObj.current) {
          googleMapObj.current.panTo(coords);
          googleMapObj.current.setZoom(16);
          markerObj.current.setPosition(coords);
        }

        setLoadingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLoadingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg('Location permission denied. Please allow location access or type manually.');
        } else {
          setErrorMsg('Unable to retrieve location. Please search or select on the map.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Map click simulator for offline/no-key mode
  const handleMapClickSimulated = (e) => {
    if (useGoogleMap) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Map pixel coordinates to Colombo lat/lng boundaries
    const clickLat = 6.93 - (y / rect.height) * 0.05;
    const clickLng = 79.84 + (x / rect.width) * 0.04;
    const coords = { lat: clickLat, lng: clickLng };

    setPinCoord(coords);
    reverseGeocode(coords);
  };

  // Confirm Location & Close Modal
  const handleConfirmLocation = async () => {
    if (!addressText.trim()) {
      setErrorMsg('Please enter or select a delivery address.');
      return;
    }

    setTempSuccess(true);
    await updateLocation({
      latitude: pinCoord.lat,
      longitude: pinCoord.lng,
      address: addressText
    });

    setTimeout(() => {
      setTempSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, backgroundColor: '#000', cursor: 'pointer' }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#fff',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #EBEBEA',
              color: '#1A1A1A'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1A1A1A' }}>
                  Delivery Location
                </h3>
                <p style={{ fontSize: '12px', color: '#6E6E6B', margin: '4px 0 0' }}>
                  Set your shipping address for supermarket availability.
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: '#F3F3F1',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6E6E6B'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Input & Search section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#6E6E6B', display: 'flex', alignItems: 'center' }}>
                  <Search size={16} />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for an address or neighborhood..."
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 38px',
                    borderRadius: '12px',
                    border: '1.5px solid #EBEBEA',
                    backgroundColor: '#F3F3F1',
                    fontSize: '13px',
                    color: '#1A1A1A',
                    outline: 'none',
                    fontWeight: 500,
                  }}
                />
              </div>

              {/* Geolocation Button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={loadingLocation}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #06C167',
                  backgroundColor: '#E8F8EE',
                  color: '#06C167',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                {loadingLocation ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Detecting current location...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={16} style={{ fill: '#06C167' }} />
                    <span>Use Current Location (GPS)</span>
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: '#FFF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '11px',
                fontWeight: 500
              }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Map Area */}
            <div style={{ position: 'relative', height: '200px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #EBEBEA' }}>
              {/* Google Map element */}
              <div
                ref={mapRef}
                style={{ width: '100%', height: '100%', display: useGoogleMap ? 'block' : 'none' }}
              />

              {/* Simulated Map Fallback */}
              {!useGoogleMap && (
                <div
                  onClick={handleMapClickSimulated}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#FAFAF8',
                    position: 'relative',
                    cursor: 'crosshair',
                    overflow: 'hidden'
                  }}
                >
                  {/* Grid background */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(#C4C2BE 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    opacity: 0.3
                  }} />

                  {/* Simulated streets vector */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }}>
                    <line x1="0" y1="20%" x2="100%" y2="70%" stroke="#1A1A1A" strokeWidth="4" />
                    <line x1="30%" y1="0" x2="60%" y2="100%" stroke="#1A1A1A" strokeWidth="4" />
                    <line x1="0" y1="80%" x2="100%" y2="40%" stroke="#1A1A1A" strokeWidth="2" />
                  </svg>

                  {/* Preset supermarket labels */}
                  <div style={{ position: 'absolute', top: '35%', left: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', fontWeight: 'bold', color: '#6E6E6B' }}>
                    <span>🏪 Keells</span>
                  </div>
                  <div style={{ position: 'absolute', top: '65%', left: '60%', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', fontWeight: 'bold', color: '#6E6E6B' }}>
                    <span>🏪 Cargills</span>
                  </div>

                  {/* Simulated Marker */}
                  <div
                    style={{
                      position: 'absolute',
                      top: `${((6.93 - pinCoord.lat) / 0.05) * 100}%`,
                      left: `${((pinCoord.lng - 79.84) / 0.04) * 100}%`,
                      transform: 'translate(-50%, -100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <MapPin size={28} style={{ color: '#06C167', fill: '#E8F8EE' }} />
                  </div>

                  {/* Warn Banner inside Map */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #EBEBEA',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '10px',
                    color: '#6E6E6B',
                    fontWeight: 500,
                  }}>
                    <AlertTriangle size={12} style={{ color: '#C07722' }} />
                    <span>Using simulated offline Colombo vector map.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Neighborhood Quick Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6E6E6B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Colombo Areas
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {colomboAreas.map((area) => {
                  const isSelected =
                    Math.abs(pinCoord.lat - area.lat) < 0.001 &&
                    Math.abs(pinCoord.lng - area.lng) < 0.001;
                  return (
                    <button
                      key={area.name}
                      onClick={() => handleAreaSelect(area)}
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        border: isSelected ? '1.5px solid #06C167' : '1px solid #EBEBEA',
                        backgroundColor: isSelected ? '#E8F8EE' : '#fff',
                        color: isSelected ? '#0A5C38' : '#1A1A1A',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.15s',
                      }}
                      title={area.name}
                    >
                      {area.name.replace('Colombo ', 'C')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: '14px',
                  border: '1.5px solid #E0DDD8',
                  backgroundColor: '#fff',
                  color: '#1A1A1A',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLocation}
                disabled={tempSuccess}
                style={{
                  flex: 2,
                  padding: '12px 0',
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: '#1A1A1A',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'opacity 0.2s',
                }}
              >
                {tempSuccess ? (
                  <>
                    <Check size={16} />
                    <span>Location Locked!</span>
                  </>
                ) : (
                  <span>Confirm Location</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LocationModal;
