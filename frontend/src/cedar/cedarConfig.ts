import { useCedarStore } from 'cedar-os'
import { dailyDigestProviderConfig, callDailyDigestAPI } from '../providers/dailyDigestProvider'

// Initialize Cedar-OS with Daily Digest provider
export const initializeCedarOS = async () => {
  const store = useCedarStore.getState()
  
  try {
    console.log('🔧 Configuring Cedar-OS with Daily Digest provider...')
    console.log('Provider config:', dailyDigestProviderConfig)
    
    // Configure the custom provider to use our Daily Digest API
    store.setProviderConfig(dailyDigestProviderConfig)
    
    console.log('🔗 Connecting to provider...')
    // Connect to the provider
    await store.connect()
    
    console.log('✅ Cedar-OS initialized with Daily Digest provider')
    
    return true
  } catch (error) {
    console.error('❌ Failed to initialize Cedar-OS:', error)
    console.log('Available store methods:', Object.keys(store))
    console.log('Store state:', store)
    return false
  }
}

// Test the connection directly with our API
export const testConnection = async () => {
  try {
    const response = await callDailyDigestAPI({
      prompt: 'Hello, this is a test message for Daily Digest.',
      temperature: 0.7,
      maxTokens: 50,
    })
    
    console.log('✅ Direct API test successful:', response)
    return response
  } catch (error) {
    console.error('❌ Direct API test failed:', error)
    throw error
  }
}

// Configure Cedar-OS for Daily Digest use case
export const configureDailyDigest = () => {
  console.log('📝 Daily Digest configuration applied')
  console.log('🔗 API endpoints configured for:', dailyDigestProviderConfig.config.baseURL)
}
