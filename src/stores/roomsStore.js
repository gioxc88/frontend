import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const useRoomsStore = defineStore('rooms', {
  state: () => ({
    rooms: []
  }),

  getters: {
    getRoomById: (state) => (id) => {
      return state.rooms.find(room => room.id === id);
    }
  },

  actions: {
    addRoom(roomData = {}) {
      const newRoom = {
        id: uuidv4(),
        title: roomData.title || 'New Investment Room',
        type: roomData.type || 'general',
        // Legacy position for compatibility
        position: roomData.position || { x: 100, y: 100 },
        size: roomData.size || { width: 600, height: 400 },
        agents: [],
        conversation: [],
        created: new Date().toISOString(),
        ...roomData
      };

      this.rooms.push(newRoom);
      return newRoom.id;
    },

    updateRoom(id, updates) {
      const roomIndex = this.rooms.findIndex(room => room.id === id);
      if (roomIndex !== -1) {
        this.rooms[roomIndex] = { ...this.rooms[roomIndex], ...updates };
      }
    },

    deleteRoom(id) {
      this.rooms = this.rooms.filter(room => room.id !== id);
    },

    // Legacy position methods - kept for compatibility
    updateRoomPosition(id, position) {
      const room = this.getRoomById(id);
      if (room) {
        room.position = position;
      }
    },

    updateRoomSize(id, size) {
      const room = this.getRoomById(id);
      if (room) {
        room.size = size;
      }
    },

    // Load rooms from localStorage on app initialization
    initRooms() {
      const savedRooms = localStorage.getItem('investmentRooms');
      if (savedRooms) {
        this.rooms = JSON.parse(savedRooms);
      } else {
        // Create a default room if none exist
        this.addRoom({
          title: 'Market Analysis Room',
          type: 'general'
        });
      }
    },

    // Save rooms to localStorage
    saveRooms() {
      localStorage.setItem('investmentRooms', JSON.stringify(this.rooms));
    }
  }
});
