// src/stores/agentsStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { useRoomsStore } from './roomsStore';

// Available agent types with their properties
const AGENT_TYPES = {
  ECONOMIST: {
    title: 'Economist',
    description: 'Analyzes economic trends and indicators',
    icon: 'mdi-chart-line',
    color: '#60a5fa', // Blue
    expertise: ['macroeconomics', 'inflation', 'economic policy']
  },
  TRADER: {
    title: 'Trader',
    description: 'Executes trades and analyzes market movements',
    icon: 'mdi-currency-usd',
    color: '#34d399', // Green
    expertise: ['market timing', 'technical analysis', 'trade execution']
  },
  PORTFOLIO_MANAGER: {
    title: 'Portfolio Manager',
    description: 'Optimizes asset allocation and risk management',
    icon: 'mdi-briefcase-outline',
    color: '#a78bfa', // Purple
    expertise: ['asset allocation', 'risk management', 'portfolio construction']
  },
  RESEARCH_ANALYST: {
    title: 'Research Analyst',
    description: 'Conducts deep research on specific securities',
    icon: 'mdi-magnify',
    color: '#fbbf24', // Yellow
    expertise: ['financial analysis', 'company research', 'sector trends']
  },
  RISK_MANAGER: {
    title: 'Risk Manager',
    description: 'Monitors and mitigates various types of risks',
    icon: 'mdi-shield-outline',
    color: '#f87171', // Red
    expertise: ['risk assessment', 'compliance', 'scenario analysis']
  }
};

export const useAgentsStore = defineStore('agents', {
  state: () => ({
    agentTypes: AGENT_TYPES,
    conversationCounter: {},
    // Remove the global flag
    activeRoomIds: {}, // Now used to track simulation per room
    scheduledTimers: {},
    typingSpeedBase: 30,
    sessionId: uuidv4()
  }),

  actions: {
    addAgent(roomId, agentType) {
      const roomsStore = useRoomsStore();
      const room = roomsStore.getRoomById(roomId);

      if (!room) return null;

      // Verify agent type exists
      if (!this.agentTypes[agentType]) {
        console.error(`Agent type ${agentType} not found`);
        return null;
      }

      const agentTypeInfo = this.agentTypes[agentType];

      const newAgent = {
        id: uuidv4(),
        type: agentType,
        name: `${agentTypeInfo.title} ${room.agents.filter(a => a.type === agentType).length + 1}`,
        avatar: agentTypeInfo.icon,
        color: agentTypeInfo.color,
        expertise: [...agentTypeInfo.expertise],
        status: 'idle', // idle, thinking, speaking
        lastActive: null
      };

      room.agents.push(newAgent);
      roomsStore.updateRoom(roomId, { agents: room.agents });
      roomsStore.saveRooms();

      return newAgent.id;
    },

    removeAgent(roomId, agentId) {
      const roomsStore = useRoomsStore();
      const room = roomsStore.getRoomById(roomId);

      if (!room) return;

      room.agents = room.agents.filter(agent => agent.id !== agentId);
      roomsStore.updateRoom(roomId, { agents: room.agents });
      roomsStore.saveRooms();
    },

    startSimulation(roomId) {
      // Only mark this room as active
      this.activeRoomIds[roomId] = true;

      const roomsStore = useRoomsStore();
      const room = roomsStore.getRoomById(roomId);

      if (room) {
        const resetAgents = room.agents.map(agent => ({
          ...agent,
          status: 'idle'
        }));

        let updatedConversation = [];
        if (room.conversation && room.conversation.length > 0) {
          updatedConversation = room.conversation.map(message => ({
            ...message,
            isNew: false,
            sessionId: this.sessionId
          }));
        }

        roomsStore.updateRoom(roomId, {
          agents: resetAgents,
          conversation: updatedConversation
        });
        roomsStore.saveRooms();
      }

      // Start conversation after a short delay
      setTimeout(() => {
        this.simulateConversation(roomId);
      }, 500);
    },

    pauseSimulation(roomId) {
      // Clear timer only for the specified room
      if (this.scheduledTimers[roomId]) {
        clearTimeout(this.scheduledTimers[roomId]);
        this.scheduledTimers[roomId] = null;
      }
      this.activeRoomIds[roomId] = false;
    },

    clearRoomTimer(roomId) {
      if (this.scheduledTimers[roomId]) {
        clearTimeout(this.scheduledTimers[roomId]);
        this.scheduledTimers[roomId] = null;
      }
    },

    anyAgentActive(room) {
      return room.agents.some(agent =>
        agent.status === 'speaking' || agent.status === 'thinking'
      );
    },

    simulateConversation(roomId) {
      this.clearRoomTimer(roomId);

      // Use room-specific flag only
      if (!this.activeRoomIds[roomId]) {
        return;
      }

      const roomsStore = useRoomsStore();
      const room = roomsStore.getRoomById(roomId);

      if (!room || room.agents.length < 2) {
        this.activeRoomIds[roomId] = false;
        return;
      }

      if (this.anyAgentActive(room)) {
        this.scheduledTimers[roomId] = setTimeout(() => {
          this.simulateConversation(roomId);
        }, 1000);
        return;
      }

      if (!this.conversationCounter[roomId]) {
        this.conversationCounter[roomId] = 0;
      }

      const availableAgents = room.agents.filter(agent => agent.status === 'idle');
      if (availableAgents.length === 0) {
        this.scheduledTimers[roomId] = setTimeout(() => {
          this.simulateConversation(roomId);
        }, 1000);
        return;
      }

      const randomAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];

      // Update agent status to "thinking"
      const updatedAgentsThinking = room.agents.map(agent => {
        if (agent.id === randomAgent.id) {
          return {
            ...agent,
            status: 'thinking',
            lastActive: new Date().toISOString()
          };
        }
        return agent;
      });

      roomsStore.updateRoom(roomId, {
        agents: updatedAgentsThinking
      });
      roomsStore.saveRooms();

      // Generate a simulated message
      const message = this.generateMessage(randomAgent, room, this.conversationCounter[roomId]);
      const thinkingTime = 1000 + Math.random() * 2000;

      this.scheduledTimers[roomId] = setTimeout(() => {
        const updatedRoom = roomsStore.getRoomById(roomId);
        if (!updatedRoom) {
          this.activeRoomIds[roomId] = false;
          return;
        }

        const agentStillThinking = updatedRoom.agents.some(agent =>
          agent.id === randomAgent.id && agent.status === 'thinking'
        );
        if (!agentStillThinking) {
          this.scheduledTimers[roomId] = setTimeout(() => {
            this.simulateConversation(roomId);
          }, 1000);
          return;
        }

        if (!this.activeRoomIds[roomId]) {
          return;
        }

        // Now update agent status to "speaking" and add the message
        if (!updatedRoom.conversation) {
          roomsStore.updateRoom(roomId, { conversation: [] });
        }

        const newMessage = {
          id: uuidv4(),
          agentId: randomAgent.id,
          agentName: randomAgent.name,
          agentType: randomAgent.type,
          timestamp: new Date().toISOString(),
          content: message,
          isNew: true,
          sessionId: this.sessionId
        };

        const updatedConversation = [...(updatedRoom.conversation || []), newMessage];

        const updatedAgentsSpeaking = updatedRoom.agents.map(agent => {
          if (agent.id === randomAgent.id) {
            return {
              ...agent,
              status: 'speaking',
              lastActive: new Date().toISOString()
            };
          }
          return agent;
        });

        roomsStore.updateRoom(roomId, {
          agents: updatedAgentsSpeaking,
          conversation: updatedConversation
        });
        roomsStore.saveRooms();

        const charsPerMs = this.typingSpeedBase / 1000;
        const typingTime = Math.max(1500, message.length / charsPerMs);

        // Reset agent status after typing animation is complete
        this.scheduledTimers[roomId] = setTimeout(() => {
          if (!this.activeRoomIds[roomId]) {
            return;
          }

          const currentRoom = roomsStore.getRoomById(roomId);
          if (!currentRoom) {
            this.activeRoomIds[roomId] = false;
            return;
          }

          const resetAgents = currentRoom.agents.map(agent => {
            if (agent.id === randomAgent.id) {
              return { ...agent, status: 'idle' };
            }
            return agent;
          });

          roomsStore.updateRoom(roomId, { agents: resetAgents });
          roomsStore.saveRooms();

          this.conversationCounter[roomId]++;
          const pauseTime = 1000 + Math.random() * 1000;
          this.scheduledTimers[roomId] = setTimeout(() => {
            this.simulateConversation(roomId);
          }, pauseTime);
        }, typingTime);

      }, thinkingTime);
    },


    // Generate a simulated message based on agent type and conversation context
    generateMessage(agent, room, counter) {
      // Real implementation would connect to an LLM API
      // For now, just return simulated messages

      const expertise = agent.expertise;
      const randomExpertise = expertise[Math.floor(Math.random() * expertise.length)];

      // Some sample messages based on agent type
      const messageTemplates = {
        ECONOMIST: [
          "Based on recent inflation data, I expect the Fed to maintain higher rates longer than the market anticipates.",
          "The yield curve inversion is deepening, historically a strong recession indicator.",
          "Consumer sentiment is improving, which could lead to increased spending in the next quarter.",
          "The labor market remains resilient despite tightening monetary policy."
        ],
        TRADER: [
          "Technical indicators suggest a potential breakout for tech stocks this week.",
          "Volume is unusually low today, suggesting caution before the upcoming earnings.",
          "I'm seeing significant options activity in the energy sector.",
          "The market seems to be ignoring the positive earnings surprises this quarter."
        ],
        PORTFOLIO_MANAGER: [
          "I recommend increasing our allocation to defensive sectors given the current volatility.",
          "Our portfolio duration may be too long considering the interest rate outlook.",
          "We should consider hedging our foreign currency exposure more aggressively.",
          "The risk-reward profile for small caps looks attractive at current valuations."
        ],
        RESEARCH_ANALYST: [
          "My analysis of the latest earnings report shows stronger margins than expected.",
          "The company's new product line could be a significant growth driver not yet priced in.",
          "Regulatory headwinds in this sector are being overestimated by the market.",
          "Supply chain improvements should benefit Q3 earnings for manufacturing firms."
        ],
        RISK_MANAGER: [
          "Our exposure to the banking sector is approaching our internal risk limits.",
          "Geopolitical tensions are creating tail risks we need to hedge against.",
          "Liquidity in certain positions has deteriorated, suggesting we reduce position sizes.",
          "Stress tests indicate our portfolio would underperform in a stagflation scenario."
        ]
      };

      // Get templates for this agent type
      const templates = messageTemplates[agent.type] || [
        "I'm analyzing the latest market data.",
        "Interesting developments in the market today.",
        "We should consider adjusting our strategy."
      ];

      // Select a template based on the counter to avoid immediate repetition
      const templateIndex = counter % templates.length;

      return templates[templateIndex];
    },

    setSimulationSpeed(speed) {
      this.simulationSpeed = speed;
    },

    setTypingSpeed(speed) {
      // Set the typing speed - higher value means faster typing
      this.typingSpeedBase = speed;
    }
  }
});
