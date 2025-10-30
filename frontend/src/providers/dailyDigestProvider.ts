// Daily Digest API Configuration for Cedar-OS
export const DAILY_DIGEST_API = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://daily-digest-demo.zackaryia.workers.dev',
  endpoints: {
    call: '/api/llm/call',
    stream: '/api/llm/stream', 
    structured: '/api/llm/structured'
  }
}

// Helper function to call our Daily Digest API
export const callDailyDigestAPI = async (params: {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  model?: string
}) => {
  const response = await fetch(`${DAILY_DIGEST_API.baseURL}${DAILY_DIGEST_API.endpoints.call}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: params.prompt,
      systemPrompt: params.systemPrompt,
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens || 2048,
      model: params.model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    }),
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`)
  }

  const data = await response.json()
  return data.content || ''
}

// Provider configuration for Cedar-OS custom provider
export const dailyDigestProviderConfig = {
  provider: 'custom' as const,
  config: {
    baseURL: DAILY_DIGEST_API.baseURL,
    model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    apiKey: 'not-needed', // Required by Cedar-OS but not used
    
    // Required: callLLM function for Cedar-OS custom provider
    callLLM: async (params: any, context?: any) => {
      console.log('🔄 Making callLLM request to:', `${DAILY_DIGEST_API.baseURL}${DAILY_DIGEST_API.endpoints.call}`)
      console.log('📤 Request params:', params)
      console.log('📤 Context:', context)

      // Extract system messages from conversation history if available
      let systemPrompt = params.systemPrompt || ''
      
      // Try to get messages from Cedar store if not in params
      let messages = params.messages
      if (!messages && typeof window !== 'undefined') {
        try {
          // Import Cedar store dynamically to get current messages
          const { useCedarStore } = await import('cedar-os')
          messages = useCedarStore.getState().messages
          console.log('📥 Retrieved messages from Cedar store:', messages?.length || 0)
        } catch (error) {
          console.warn('Could not access Cedar store:', error)
        }
      }
      
      // If we have messages array, look for system messages and combine them
      if (messages && Array.isArray(messages)) {
        const systemMessages = messages
          .filter((msg: any) => msg.role === 'system')
          .map((msg: any) => msg.content)
          .join('\n\n')
        
        console.log('🔍 Found system messages:', {
          count: messages.filter((msg: any) => msg.role === 'system').length,
          totalMessages: messages.length,
          systemMessagesLength: systemMessages.length,
          firstSystemMessage: messages.find((msg: any) => msg.role === 'system')?.content?.substring(0, 100) + '...'
        })
        
        if (systemMessages) {
          systemPrompt = systemMessages + (systemPrompt ? '\n\n' + systemPrompt : '')
          console.log('✅ Combined system prompt length:', systemPrompt.length)
          
          // Truncate system prompt if it's too long (rough estimate: 1 token ≈ 4 characters)
          // Keep under ~15,000 tokens (60,000 characters) to leave room for user message and response
          const maxSystemPromptLength = 60000
          if (systemPrompt.length > maxSystemPromptLength) {
            console.warn('⚠️ System prompt too long, truncating from', systemPrompt.length, 'to', maxSystemPromptLength)
            systemPrompt = systemPrompt.substring(0, maxSystemPromptLength) + '\n\n[Context truncated due to length limits]'
          }
          
          console.log('📄 Final system prompt length:', systemPrompt.length)
          console.log('📄 System prompt preview:', systemPrompt.substring(0, 200) + '...')
        }
      } else {
        console.warn('⚠️ No messages array found in params or Cedar store')
      }
      
      const response = await fetch(`${DAILY_DIGEST_API.baseURL}${DAILY_DIGEST_API.endpoints.call}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: params.prompt,
          systemPrompt: systemPrompt,
          temperature: params.temperature || 0.7,
          maxTokens: params.maxTokens || 2048,
          model: params.model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        }),
      })

      console.log('📥 Response status:', response.status)
      console.log('📥 Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API call failed:', response.status, errorText)
        throw new Error(`API call failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ API response:', data)
      
      return {
        content: data.content || '',
        usage: data.usage || {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        metadata: data.metadata || {},
      }
    },

    // Optional: streamLLM function for streaming responses
    // streamLLM: (params: any, handler: any) => {
    //   console.log('🌊 Making streamLLM request to:', `${DAILY_DIGEST_API.baseURL}${DAILY_DIGEST_API.endpoints.stream}`)
    //   console.log('📤 Stream params:', params)
      
    //   const abortController = new AbortController()
      
    //   const completion = (async () => {
    //     try {
    //       const response = await fetch(`${DAILY_DIGEST_API.baseURL}${DAILY_DIGEST_API.endpoints.stream}`, {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //           prompt: params.prompt,
    //           systemPrompt: params.systemPrompt,
    //           temperature: params.temperature || 0.7,
    //           maxTokens: params.maxTokens || 2048,
    //           model: params.model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    //         }),
    //         signal: abortController.signal,
    //       })

    //       if (!response.ok) {
    //         throw new Error(`Streaming API call failed: ${response.status}`)
    //       }

    //       // Handle Server-Sent Events stream
    //       const reader = response.body?.getReader()
    //       const decoder = new TextDecoder()

    //       if (!reader) {
    //         throw new Error('No response body')
    //       }

    //       while (true) {
    //         const { done, value } = await reader.read()
            
    //         if (done) break
            
    //         const chunk = decoder.decode(value, { stream: true })
    //         const lines = chunk.split('\n')
            
    //         for (const line of lines) {
    //           if (line.startsWith('data: ')) {
    //             try {
    //               const eventData = JSON.parse(line.slice(6))
    //               await handler(eventData)
                  
    //               if (eventData.type === 'done') {
    //                 return
    //               }
    //             } catch {
    //               // Skip parsing errors
    //             }
    //           }
    //         }
    //       }
    //     } catch (error) {
    //       if (error instanceof Error && error.name !== 'AbortError') {
    //         await handler({ type: 'error', error })
    //       }
    //     }
    //   })()

    //   return {
    //     abort: () => abortController.abort(),
    //     completion,
    //   }
    // },
  },
}
