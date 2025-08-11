#!/usr/bin/env node

// Grok AI Terminal CLI Entry Point
// Command-line interface for Grok AI integration

import { ConfigurationManager } from './config/ConfigurationManager';
import { GrokAPIClient } from './client/GrokAPIClient';
import { ConversationManager } from './conversation/ConversationManager';
import { Logger } from './utils/logger';

async function main() {
  const logger = Logger.getInstance();
  
  try {
    console.log('🎲 Initializing AI Dungeon Master - Grok Integration...\n');
    
    // Load and validate configuration
    const configManager = new ConfigurationManager();
    const config = await configManager.loadConfiguration();
    
    // Configure logger
    logger.configure({
      level: config.logging.level,
      enableConsole: config.logging.enableConsole,
      enableFile: config.logging.enableFile
    });
    
    logger.info('Configuration loaded successfully', {
      model: config.grok.model,
      persistenceEnabled: config.conversation.enablePersistence,
      dndEdition: config.dnd.edition
    });
    
    // Validate required configuration
    if (!config.grok.apiKey) {
      console.error('❌ Error: GROK_API_KEY environment variable is required');
      console.log('\nSetup Instructions:');
      console.log('1. Get your API key from https://x.ai/api');
      console.log('2. Set environment variable: export GROK_API_KEY=xai-your-key-here');
      console.log('3. Run the application again\n');
      process.exit(1);
    }
    
    console.log('✅ Configuration validated successfully');
    console.log(`📡 Using model: ${config.grok.model}`);
    console.log(`🎯 D&D Edition: ${config.dnd.edition}`);
    console.log(`💾 Persistence: ${config.conversation.enablePersistence ? 'Enabled' : 'Disabled'}`);
    
    // Initialize and test Grok API client
    console.log('\n🔌 Testing Grok API connection...');
    const grokClient = new GrokAPIClient({
      apiKey: config.grok.apiKey,
      baseURL: config.grok.baseURL,
      model: config.grok.model,
      temperature: config.grok.temperature,
      maxTokens: config.grok.maxTokens,
      timeout: config.grok.timeout,
      maxRetries: config.grok.maxRetries
    });
    
    const isConnected = await grokClient.testConnection();
    if (isConnected) {
      console.log('✅ Grok API connection successful');
      
      try {
        const models = await grokClient.getAvailableModels();
        console.log(`📋 Available models: ${models.data.map(m => m.id).join(', ')}`);
      } catch (error) {
        console.log('⚠️  Could not fetch available models (this is normal with test keys)');
      }
    } else {
      console.log('❌ Grok API connection failed (this is expected with test keys)');
    }
    
    // Initialize and test conversation manager
    console.log('\n💬 Testing conversation management...');
    const conversationManager = new ConversationManager({
      maxContextTokens: config.conversation.maxContextTokens,
      maxHistoryMessages: config.conversation.maxHistoryMessages,
      enablePersistence: config.conversation.enablePersistence,
      supabaseConfig: config.supabase
    });
    
    // Test conversation flow
    const session = await conversationManager.initializeSession(undefined, 'CLI Test Session');
    console.log(`✅ Conversation session created: ${session.id}`);
    
    // Add some test messages
    await conversationManager.addMessage('system', 'You are an expert D&D Dungeon Master assistant.');
    await conversationManager.addMessage('user', 'Hello, DM! I want to start a new campaign.');
    await conversationManager.addMessage('assistant', 'Welcome, adventurer! Let\'s create an epic D&D campaign together.');
    
    const stats = conversationManager.getStats();
    console.log(`📊 Session stats: ${stats.messageCount} messages, ${stats.totalTokens} tokens`);
    
    const context = conversationManager.getContext();
    console.log(`🧠 Context prepared: ${context.messages.length} messages for AI`);
    
    // TODO: Initialize terminal interface
    console.log('\n🚧 Terminal interface coming in next task...');
    console.log('Conversation management system complete! ✨\n');
    
  } catch (error) {
    logger.error('Failed to initialize Grok AI integration', error as Error);
    console.error('❌ Initialization failed:', (error as Error).message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye! Thanks for using AI Dungeon Master');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received termination signal, shutting down gracefully...');
  process.exit(0);
});

// Run main function if this file is executed directly
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});