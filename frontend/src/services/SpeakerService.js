import { speakerAPI } from '../utils/api';

// Service for handling speaker-related operations
const SpeakerService = {
  // Get all speakers with optional filtering
  getSpeakers: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await speakerAPI.getSpeakers(queryString ? `?${queryString}` : '');
      return response;
    } catch (error) {
      console.error('Error fetching speakers:', error);
      throw error;
    }
  },

  // Get a single speaker by ID
  getSpeakerById: async (speakerId) => {
    try {
      const response = await speakerAPI.getSpeaker(speakerId);
      return response;
    } catch (error) {
      console.error(`Error fetching speaker with ID ${speakerId}:`, error);
      throw error;
    }
  },

  // Get speakers by expertise
  getSpeakersByExpertise: async (expertise) => {
    try {
      const response = await speakerAPI.getSpeakers(`?expertise=${encodeURIComponent(expertise)}`);
      return response;
    } catch (error) {
      console.error(`Error fetching speakers with expertise ${expertise}:`, error);
      throw error;
    }
  },
  
  // Get speakers by event
  getSpeakersByEvent: async (eventId) => {
    try {
      const response = await speakerAPI.getSpeakers(`?event=${eventId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching speakers for event ${eventId}:`, error);
      throw error;
    }
  }
};

export default SpeakerService;
