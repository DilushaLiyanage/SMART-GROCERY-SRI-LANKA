let isLoaded = false;
let isLoading = false;
let loadCallbacks = [];

export const loadGoogleMaps = (callback) => {
  if (isLoaded) {
    callback(true);
    return;
  }

  loadCallbacks.push(callback);

  if (isLoading) return;

  isLoading = true;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    console.warn('Google Maps API Key is missing. Falling back to simulated map.');
    // Trigger callbacks with false to fall back to simulated maps
    loadCallbacks.forEach(cb => cb(false));
    loadCallbacks = [];
    isLoading = false;
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    isLoaded = true;
    isLoading = false;
    loadCallbacks.forEach(cb => cb(true));
    loadCallbacks = [];
  };

  script.onerror = () => {
    console.error('Failed to load Google Maps script.');
    isLoading = false;
    loadCallbacks.forEach(cb => cb(false));
    loadCallbacks = [];
  };

  document.head.appendChild(script);
};
export default loadGoogleMaps;
