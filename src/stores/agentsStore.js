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
    simulationSpeed: 1, // Messages per minute multiplier
    isSimulationRunning: false
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
      if (this.isSimulationRunning) return;

      this.isSimulationRunning = true;
      this.simulateConversation(roomId);
    },

    pauseSimulation() {
      this.isSimulationRunning = false;
    },

    // Simulate conversation between agents
    simulateConversation(roomId) {
      if (!this.isSimulationRunning) return;

      const roomsStore = useRoomsStore();
      const room = roomsStore.getRoomById(roomId);

      if (!room || room.agents.length < 2) return;

      // Ensure conversation counter exists for this room
      if (!this.conversationCounter[roomId]) {
        this.conversationCounter[roomId] = 0;
      }

      // Select a random agent to speak next
      const availableAgents = room.agents.filter(agent => agent.status !== 'speaking');
      if (availableAgents.length === 0) return;

      const randomAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];

      // Generate a simulated message
      const message = this.generateMessage(randomAgent, room, this.conversationCounter[roomId]);

      // Add message to room conversation
      if (!room.conversation) room.conversation = [];

      room.conversation.push({
        id: uuidv4(),
        agentId: randomAgent.id,
        agentName: randomAgent.name,
        agentType: randomAgent.type,
        timestamp: new Date().toISOString(),
        content: message
      });

      // Update agent status
      const updatedAgents = room.agents.map(agent => {
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
        agents: updatedAgents,
        conversation: room.conversation
      });
      roomsStore.saveRooms();

      // Reset agent status after a delay
      setTimeout(() => {
        const currentRoom = roomsStore.getRoomById(roomId);
        if (!currentRoom) return;

        const resetAgents = currentRoom.agents.map(agent => {
          if (agent.id === randomAgent.id) {
            return {
              ...agent,
              status: 'idle'
            };
          }
          return agent;
        });

        roomsStore.updateRoom(roomId, { agents: resetAgents });
        roomsStore.saveRooms();

        // Continue conversation
        this.conversationCounter[roomId]++;

        // Schedule next message with some randomness in timing
        const baseDelay = 60000 / this.simulationSpeed; // Base delay in ms
        const randomFactor = 0.5 + Math.random(); // Random factor between 0.5 and 1.5
        const nextDelay = baseDelay * randomFactor;

        setTimeout(() => this.simulateConversation(roomId), nextDelay);
      }, 3000);
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
    }
  }
});
