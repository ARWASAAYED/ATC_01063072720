import { eventAPI } from '../utils/api';

const EventService = {
  getEvents: async (params = {}) => {
    try {
      const response = await eventAPI.getEvents(params);
      console.log('getEvents response:', response);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch events');
      }
      return response;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  getEventById: async (eventId) => {
    try {
      const response = await eventAPI.getEvent(eventId);
      console.log('getEventById response:', response);
      if (!response.success) {
        throw new Error(response.message || `Failed to fetch event with ID ${eventId}`);
      }
      return response;
    } catch (error) {
      console.error(`Error fetching event with ID ${eventId}:`, error);
      throw error;
    }
  },

  getFeaturedEvents: async () => {
    try {
      const response = await eventAPI.getEvents({
        startDate: new Date().toISOString(),
        sort: 'startDate',
        limit: 6
      });
      console.log('getFeaturedEvents response:', response);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch featured events');
      }
      return response;
    } catch (error) {
      console.error('Error fetching featured events:', error);
      throw error;
    }
  },

  getEventsByCategory: async (category) => {
    try {
      const response = await eventAPI.getEvents({ category });
      console.log('getEventsByCategory response:', response);
      if (!response.success) {
        throw new Error(response.message || `Failed to fetch events in category ${category}`);
      }
      return response;
    } catch (error) {
      console.error(`Error fetching events in category ${category}:`, error);
      throw error;
    }
  },

  searchEvents: async (searchQuery) => {
    try {
      const response = await eventAPI.getEvents({ search: searchQuery });
      console.log('searchEvents response:', response);
      if (!response.success) {
        throw new Error(response.message || `Failed to search events with query "${searchQuery}"`);
      }
      return response;
    } catch (error) {
      console.error(`Error searching events with query "${searchQuery}":`, error);
      throw error;
    }
  }
};

export default EventService;