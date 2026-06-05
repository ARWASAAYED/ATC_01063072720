import { venueAPI } from '../utils/api';

// Service for handling venue-related operations
const VenueService = {
  // Get all venues with optional filtering
  getVenues: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await venueAPI.getVenues(queryString ? `?${queryString}` : '');
      return response;
    } catch (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }
  },

  // Get a single venue by ID
  getVenueById: async (venueId) => {
    try {
      const response = await venueAPI.getVenue(venueId);
      return response;
    } catch (error) {
      console.error(`Error fetching venue with ID ${venueId}:`, error);
      throw error;
    }
  },

  // Get venues by location/city
  getVenuesByLocation: async (location) => {
    try {
      const response = await venueAPI.getVenues(`?city=${encodeURIComponent(location)}`);
      return response;
    } catch (error) {
      console.error(`Error fetching venues in location ${location}:`, error);
      throw error;
    }
  },

  // Get venues by capacity (minimum capacity)
  getVenuesByCapacity: async (minCapacity) => {
    try {
      const response = await venueAPI.getVenues(`?minCapacity=${minCapacity}`);
      return response;
    } catch (error) {
      console.error(`Error fetching venues with minimum capacity ${minCapacity}:`, error);
      throw error;
    }
  },
  deleteVenue: async (venueId) => {
    try {
      const response = await venueAPI.deleteVenue(venueId);
      return response;
    } catch (error) {
      console.error(`Error deleting venue with ID ${venueId}:`, error);
      throw error;
    }
  },
  updateVenue: async (venueId, updatedVenueData) => {
    try {
      const response = await venueAPI.updateVenue(venueId, updatedVenueData);
      return response;
    } catch (error) {
      console.error(`Error updating venue with ID ${venueId}:`, error);
      throw error;
    }
  }
};

export default VenueService;
