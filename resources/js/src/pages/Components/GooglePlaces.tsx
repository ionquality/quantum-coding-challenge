import { chownSync } from 'fs';
import React from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

const GooglePlacesComponent = () => (
  <div>
    <GooglePlacesAutocomplete
      apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
    />
  </div>
);

export default GooglePlacesComponent;