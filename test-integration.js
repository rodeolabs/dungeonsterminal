// Simple test script to verify Grok API integration
import { GrokAPIClient } from './dist/grok/client/GrokAPIClient.js';

async function testGrokIntegration() {
  console.log('🧪 Testing Grok API Integration...');
  
  try {
    // Initialize Grok client
    const client = new GrokAPIClient({
      apiKey: process.env.GROK_API_KEY || '',
      model: 'grok-beta',
      temperature: 0.7,
      maxTokens: 100,
    });

    console.log('✅ Grok client initialized');

    // Test connection
    const isConnected = await client.testConnection();
    console.log(`🔗 Connection test: ${isConnected ? '✅ Connected' : '❌ Failed'}`);

    if (isConnected) {
      // Test a simple completion
      const request = client.createCompletionRequest([
        { role: 'system', content: 'You are a helpful D&D dungeon master.' },
        { role: 'user', content: 'I look around the tavern.' }
      ]);

      console.log('📤 Sending test message...');
      const response = await client.sendMessage(request);
      
      console.log('📥 Response received:');
      console.log(response.choices[0]?.message?.content || 'No response content');
      
      // Get usage stats
      const stats = await client.getUsageStats();
      console.log('📊 Usage stats:', stats);
      
      console.log('🎉 Integration test successful!');
    } else {
      console.log('❌ Cannot test completion - connection failed');
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
}

// Run the test
testGrokIntegration();