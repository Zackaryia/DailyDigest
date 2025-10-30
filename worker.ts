export interface Env {
  USERS: any
  ARTICLES: any
  AI: any
  BRIEFINGS: any
  RESEND_API_KEY: string
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)
    // Basic CORS handling for API routes
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
        }
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, { status: 204, headers: corsHeaders })
    }
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Digest</title>
  <style>
    body { font-family: sans-serif; max-width: 500px; margin: 2rem auto; padding: 1rem; }
    h1 { color: #2d6cdf; }
    form { display: flex; flex-direction: column; gap: 1rem; }
    input, textarea, button { font-size: 1rem; padding: 0.5rem; }
    .success { color: green; margin-top: 1rem; }
    .api-section { margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1rem; }
    .api-form { display: none; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
    .api-form.active { display: flex; }
    .api-btn { margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <h1>Daily Digest</h1>
  <p>Get notified when new articles match your interests. Sign up below:</p>
  <form id="register-form">
    <label>Email: <input type="email" name="email" required></label>
    <label>Interests (comma-separated): <input type="text" name="interests" required placeholder="e.g. AI, Cloud, Security"></label>
    <label>Interest Explanations (comma-separated, in order): <input type="text" name="explanations" required placeholder="e.g. I want AI news, Cloud updates, Security alerts"></label>
    <button type="submit">Sign Up</button>
  </form>
  <div class="success" id="success" style="display:none;">Registration successful!</div>

  <div class="api-section">
    <button class="api-btn" onclick="toggleForm('new-article-form')">Submit New Article</button>
    <form id="new-article-form" class="api-form">
      <label>Title: <input type="text" name="title" required></label>
      <label>Content: <input type="text" name="content" required></label>
      <label>URL: <input type="url" name="url" required></label>
      <button type="submit">Submit</button>
      <div class="success" style="display:none;">Article submitted!</div>
    </form>

    <button class="api-btn" onclick="toggleForm('rss-form')">Ingest RSS Feed</button>
    <form id="rss-form" class="api-form">
      <label>Feed URL: <input type="url" name="feedUrl" required></label>
      <button type="submit">Ingest</button>
      <div class="success" style="display:none;">RSS ingested!</div>
    </form>

    <button class="api-btn" onclick="toggleForm('notify-form')">Send Digest Notification</button>
    <form id="notify-form" class="api-form">
      <label>Email (optional): <input type="email" name="email"></label>
      <button type="submit">Notify</button>
      <div class="success" style="display:none;">Notification sent!</div>
    </form>
  </div>

  <script>
    function toggleForm(id) {
      document.querySelectorAll('.api-form').forEach(f => f.classList.remove('active'));
      const form = document.getElementById(id);
      if (form) form.classList.toggle('active');
    }
    document.getElementById('register-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const email = form.email.value.trim();
      const interests = form.interests.value.split(',').map(s => s.trim());
      const explanations = form.explanations.value.split(',').map(s => s.trim());
      const interestsArr = interests.map((topic, i) => ({ topic, explanation: explanations[i] || '' }));
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interests: interestsArr })
      });
      document.getElementById('success').style.display = '';
      form.reset();
    };
    document.getElementById('new-article-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const title = form.title.value.trim();
      const content = form.content.value.trim();
      const url = form.url.value.trim();
      await fetch('/api/new-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, url })
      });
      form.querySelector('.success').style.display = '';
      form.reset();
    };
    document.getElementById('rss-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const feedUrl = form.feedUrl.value.trim();
      await fetch('/api/ingest-rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedUrl })
      });
      form.querySelector('.success').style.display = '';
      form.reset();
    };
    document.getElementById('notify-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const email = form.email.value.trim();
      await fetch('/api/notify-recent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email ? { email } : {})
      });
      form.querySelector('.success').style.display = '';
      form.reset();
    };
  </script>
</body>
</html>`, { headers: { 'content-type': 'text/html' } })
    }

    if (request.method === 'POST' && url.pathname === '/api/register') {
      const { email, interests } = await request.json()
      await env.USERS.put(email, JSON.stringify({ interests, email }))
      await doUserBriefing(email, env, corsHeaders)
      return new Response('registered', { headers: corsHeaders })
    }

    if (request.method === 'POST' && url.pathname === '/api/new-article') {
      const { title, content, url: articleUrl } = await request.json()
      await ingestArticle({ title, content, url: articleUrl }, env)
      return new Response('article processed')
    }

    if (request.method === 'POST' && url.pathname === '/api/ingest-rss') {
      const { feedUrl } = await request.json()
      const articles = await parseRSS(feedUrl)

      for (const article of articles) {
        await ingestArticle(article, env)
      }
      return new Response('rss processed')
    }

    if (request.method === 'POST' && url.pathname === '/api/notify-recent') {
      const { email } = await request.json().catch(() => ({}))
      const now = Date.now()
      const oneDayAgo = now - 24 * 60 * 60 * 1000
      const articles: any[] = []
      const list = await env.ARTICLES.list()
      for (const key of list.keys) {
        const data = await env.ARTICLES.get(key.name)
        if (!data) continue
        const article = JSON.parse(data)
        if (article.timestamp && article.timestamp >= oneDayAgo) {
          articles.push(article)
        }
      }
      if (!articles.length) return new Response('No recent articles')

      let userList: any;
      if (email) {
        userList = await env.USERS.get(email);
      } else {
        userList = await env.USERS.list()
      }

      for (const userKey of userList.keys) {
        const userData = await env.USERS.get(userKey.name)
        if (!userData) continue
        const user = JSON.parse(userData)
        let summary = `Daily Digest for ${user.email}\n\n`
        const relevantArticles: any[] = []
        for (const a of articles) {
          if (await aiMatch(user.interests, a, env)) relevantArticles.push(a)
        }
        summary += relevantArticles.map((a: any) => `• ${a.content}\n  ${a.url}`).join('\n\n')
        // Replace with actual notification/email logic as needed
        console.log(summary)
      }
      return new Response('Notifications sent')
    }

    // Cedar-OS compatible LLM API endpoints
    if (request.method === 'POST' && url.pathname === '/api/llm/call') {
      return await handleLLMCall(request, env, corsHeaders)
    }

    if (request.method === 'POST' && url.pathname === '/api/llm/stream') {
      return await handleLLMStream(request, env, corsHeaders)
    }

    if (request.method === 'POST' && url.pathname === '/api/llm/structured') {
      return await handleLLMStructured(request, env, corsHeaders)
    }

    // Send briefing email endpoint
    if (url.pathname === '/api/send-briefing-email' && request.method === 'POST') {
      try {
        const body = await request.json() as {
          email: string
          briefingData: any
        }

        const { email, briefingData } = body

        if (!email || !briefingData) {
          return new Response(JSON.stringify({ 
            error: 'Missing required parameters: email and briefingData' 
          }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          })
        }

        const emailSent = await sendBriefingEmail(env, email, briefingData)
        
        return new Response(JSON.stringify({
          success: emailSent,
          message: emailSent ? 'Email sent successfully' : 'Failed to send email'
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      } catch (error) {
        console.error('Send email endpoint error:', error)
        return new Response(JSON.stringify({ 
          error: 'Failed to send email',
          details: error instanceof Error ? error.message : 'Unknown error'
        }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        })
      }
    }

    // Get structured briefing endpoint
    if (request.method === 'GET' && url.pathname === '/api/briefing') {
      const url_obj = new URL(request.url)
      const email = url_obj.searchParams.get('email')
      
      if (!email) {
        return new Response(JSON.stringify({
          error: 'Email parameter is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      }
      
      return await doUserBriefing(email, env, corsHeaders)
    }

    // Get a specific briefing by key
if (request.method === 'GET' && url.pathname.startsWith('/api/get-briefing/')) {
  try {
    const key = url.pathname.split('/').pop()
    if (!key) {
      return new Response(JSON.stringify({ error: 'Missing briefing key' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      })
    }

    const briefing = await env.BRIEFINGS.get(key, { type: 'json' })
    
    if (!briefing) {
      return new Response(JSON.stringify({ error: 'Briefing not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      })
    }

    return new Response(JSON.stringify(briefing), { 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    })} catch (error) {
      console.error('Error retrieving briefing:', error)
      return new Response(JSON.stringify({ 
        error: 'Failed to retrieve briefing',
        details: error.message 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      })
    }
  
  }

    // Handle OPTIONS requests for Cedar-OS endpoints
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/llm/')) {
      return new Response(null, { status: 204, headers: corsHeaders })
    }
    return new Response('not found', { status: 404 })
  }
}


async function doUserBriefing(email: string, env: Env, corsHeaders: any) {
  if (!email) {
    return new Response(JSON.stringify({
      error: 'Email parameter is required'
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    })
  }

  // Get user data
  const userData = await env.USERS.get(email)
  if (!userData) {
    return new Response(JSON.stringify({
      error: 'User not found'
    }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    })
  }

  const user = JSON.parse(userData)
  if (!user.interests || user.interests.length === 0) {
    return new Response(JSON.stringify({
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      topics: []
    }), { 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    })
  }

  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000
  const articles: any[] = []
  const list = await env.ARTICLES.list()
  
  for (const key of list.keys) {
    const data = await env.ARTICLES.get(key.name)
    if (!data) continue
    const article = JSON.parse(data)
    if (article.timestamp && article.timestamp >= oneDayAgo) {
      articles.push(article)
    }
  }

  if (!articles.length) {
    return new Response(JSON.stringify({
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      topics: []
    }), { 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    })
  }
  
  console.log('Articles:', articles)
  const structuredBriefing = await generateUserBriefing(articles, user.interests, env)
  
  // Save the briefing to KV
  try {
    const briefingKey = `briefing:${email}:${new Date().toISOString()}`
    await env.BRIEFINGS.put(briefingKey, JSON.stringify({
      ...structuredBriefing,
      generatedAt: new Date().toISOString(),
      userId: email
    }), {
      expirationTtl: 60 * 60 * 24 * 7 // Keep briefings for 7 days
    })
    console.log(`Briefing saved to KV with key: ${briefingKey}`)
    
    // Send email notification with the briefing
    try {
      const emailSent = await sendBriefingEmail(env, email, structuredBriefing, briefingKey)
      if (emailSent) {
        console.log(`Briefing email sent to ${email}`)
      } else {
        console.warn(`Failed to send briefing email to ${email}`)
      }
    } catch (emailError) {
      console.error('Failed to send briefing email:', emailError)
      // Continue even if email fails - don't break the API response
    }
  } catch (error) {
    console.error('Failed to save briefing to KV:', error)
    // Continue even if KV save fails
  }
  
  return new Response(JSON.stringify(structuredBriefing), { 
    headers: { 'Content-Type': 'application/json', ...corsHeaders } 
  })
}

async function ingestArticle(article: { title: string, content: string, url: string }, env: Env) {
  const key = article.url
  if (await env.ARTICLES.get(key)) return
  const withTimestamp = { ...article, timestamp: Date.now() }
  await env.ARTICLES.put(key, JSON.stringify(withTimestamp))
  const list = await env.USERS.list()
  for (const userKey of list.keys) {
    const userData = await env.USERS.get(userKey.name)
    if (!userData) continue
    const user = JSON.parse(userData)
    const match = await aiMatch(user.interests, { title: article.title, content: article.content }, env)
    if (match) {
      console.log(`Notify ${user.email} about ${article.title} (${article.url})`)
      break
    }
  }
}

// Batch AI matching function - matches multiple articles against multiple topics with controlled concurrency
async function batchAiMatch(topics: string[], articles: { title: string, content: string }[], env: Env): Promise<{ [topicIndex: number]: number[] }> {
  const BATCH_SIZE = 20 // Limit concurrent requests to avoid "Too many subrequests" error
  const allRequests: { topicIndex: number, articleIndex: number, prompt: string }[] = []

  // Prepare all requests first
  for (let topicIndex = 0; topicIndex < topics.length; topicIndex++) {
    const topic = topics[topicIndex]
    
    for (let articleIndex = 0; articleIndex < articles.length; articleIndex++) {
      const article = articles[articleIndex]
      let content = article.content
      const content_max_length = 400
      content = content.length > content_max_length ? content.slice(0, content_max_length) + "..." : content

      const prompt = `You are determining if an article has a direct and specific connection to a given topic. Don't be overly strict in matching.

RULES:
- Only respond "YES" if the article DIRECTLY discusses or is SPECIFICALLY about the topic
- Do not consider vague or indirect connections
- Ignore passing mentions or minor references
- The article should be directly relevant to someone specifically interested in this topic

TOPIC: "${topic}"

ARTICLE:
Title: "${article.title}"
Content: ${content}

Does this article have a direct and specific connection to "${topic}"? The article must explicitly discuss or be primarily about this topic to warrant a "YES".

Respond with exactly "YES" or "NO" (without quotes).`

      allRequests.push({ topicIndex, articleIndex, prompt })
    }
  }

  const results: { [topicIndex: number]: number[] } = {}

  // Process requests in batches to avoid subrequest limits
  for (let i = 0; i < allRequests.length; i += BATCH_SIZE) {
    const batch = allRequests.slice(i, i + BATCH_SIZE)
    
    try {
      const batchPromises = batch.map(req => 
        env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          prompt: req.prompt,
          max_tokens: 10,
          temperature: 0.2
        })
      )

      const batchResponses = await Promise.all(batchPromises)

      // Process batch results
      for (let j = 0; j < batch.length; j++) {
        const { topicIndex, articleIndex } = batch[j]
        const aiResult = batchResponses[j]?.response || ''
        
        if (aiResult.trim().toLowerCase().startsWith('yes')) {
          if (!results[topicIndex]) {
            results[topicIndex] = []
          }
          results[topicIndex].push(articleIndex)
        }
      }
    } catch (error) {
      console.error(`Batch ${Math.floor(i/BATCH_SIZE) + 1} AI matching failed:`, error)
      // Continue with next batch instead of failing completely
    }
  }

  return results
}

async function aiMatch(interests: [{ topic: string, explanation: string }], article: { title: string, content: string }, env: Env) {
  const interestsList = interests.map(i => `Topic: "${i.topic}" (User wants: ${i.explanation})`).join('\n')
  
  let content = article.content

  const content_max_length = 1000 
  content = content.length > content_max_length ? content.slice(0, content_max_length) + "..." : content

  const prompt = `You are an AI assistant that determines if an article matches a user's interests.

TASK: Analyze if the given article is relevant to ANY of the user's interests.

ARTICLE TO ANALYZE:
Title: "${article.title}"
Content: \`\`\`
${content}
\`\`\`

USER'S INTERESTS:
${interestsList}

INSTRUCTIONS:
1. Read the article title and content carefully
2. Check if the article discusses topics that match the user's interests
3. Consider both exact matches and related/similar topics
4. The article only needs to match ONE of the user's interests to be relevant
5. Be generous in matching - if the article is tangentially related to an interest, consider it a match

RESPONSE FORMAT:
Respond with exactly "YES" if the article matches any interest, or "NO" if it doesn't match any interest.

Your response:`



  const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { prompt })
  console.log(prompt, response);
  const aiResult = (response.response || '').trim().toLowerCase()
  return aiResult.toLowerCase().startsWith('yes')
}

import { XMLParser } from "fast-xml-parser"
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", cdataPropName: "cdata" })

export async function parseRSS(feedUrl: string) {
  const res = await fetch(feedUrl, { headers: { 'User-Agent': 'DailyDigestBot/1.0' } })
  const xml = await res.text()
  const parsed = parser.parse(xml)

  let entries: any[] = []

  if (parsed.feed?.entry) {
    entries = Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry]
  }
  if (parsed.rss?.channel?.item) {
    entries = Array.isArray(parsed.rss.channel.item) ? parsed.rss.channel.item : [parsed.rss.channel.item]
  }

  return entries.map((item: any) => {
    // Helper function to extract text from various XML structures
    const extractText = (field: any): string => {
      if (!field) return ''
      if (typeof field === 'string') return field
      if (field.cdata) return field.cdata
      if (field.text) return field.text
      if (field['#text']) return field['#text']
      if (field._) return field._
      return String(field)
    }

    // Extract title
    const title = extractText(item.title) || 'n/a'
    
    // Extract URL with proper handling
    let url = item.link?.href || extractText(item.link) || 'n/a'
    if (url !== 'n/a' && !url.startsWith('http')) {
      try {
        const { origin } = new URL(feedUrl)
        url = url.startsWith('/') ? origin + url : origin + '/' + url
      } catch { 
        // Keep original URL if parsing fails
      }
    }
    
    // Extract content with fallback priority
    let content = extractText(item.content) || extractText(item.summary) || 
      extractText(item.description) || title || 'N/a'

    return {
      title: title.trim(),
      url: url.trim(),
      content: content.trim(),
    }
  })

  return []
}

// Cedar-OS Provider Implementation for Cloudflare Workers AI
// Implements the ProviderImplementation interface

// Handle basic LLM calls (callLLM)
async function handleLLMCall(request: Request, env: Env, corsHeaders: any) {
  try {
    const body = await request.json() as {
      prompt?: string
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
      model?: string
      [key: string]: unknown
    }

    const { prompt, systemPrompt, temperature = 0.7, maxTokens = 2048, model = '@cf/meta/llama-3.3-70b-instruct-fp8-fast', ...rest } = body

    if (!prompt) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameter: prompt' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      })
    }

    // Build messages array for Cloudflare AI
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt }
    ]

    const enhancedPrompt = buildPromptWithContext(messages)

    // Call Cloudflare Workers AI
    const aiRes = await env.AI.run(model, { 
      prompt: enhancedPrompt,
      max_tokens: maxTokens,
      temperature,
    })

    const content = (aiRes?.response || '').toString()

    // Return Cedar-OS compatible response
    return new Response(JSON.stringify({
      content,
      usage: {
        promptTokens: 0, // Cloudflare AI doesn't provide token counts
        completionTokens: 0,
        totalTokens: 0
      },
      metadata: {
        model,
        provider: 'cloudflare-workers-ai'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({
      error: 'LLM call failed',
      details: error.message || String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
}

// Handle structured LLM calls (callLLMStructured)
async function handleLLMStructured(request: Request, env: Env, corsHeaders: any) {
  try {
    const body = await request.json() as {
      prompt?: string
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
      model?: string
      schema?: any
      [key: string]: unknown
    }

    const { schema, prompt, systemPrompt, temperature = 0.7, maxTokens = 2048, model = '@cf/meta/llama-3.3-70b-instruct-fp8-fast', ...rest } = body

    if (!prompt) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameter: prompt' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      })
    }

    // For structured output, we'll add schema instructions to the system prompt
    const structuredSystemPrompt = `${systemPrompt || ''}\n\nIMPORTANT: Respond with valid JSON that matches this schema: ${JSON.stringify(schema)}`

    // Build messages array for Cloudflare AI
    const messages = [
      ...(structuredSystemPrompt ? [{ role: 'system', content: structuredSystemPrompt }] : []),
      { role: 'user', content: prompt }
    ]

    // Get briefing context for enhanced responses
    const enhancedPrompt = buildPromptWithContext(messages)

    // Call Cloudflare Workers AI
    const aiRes = await env.AI.run(model, { 
      prompt: enhancedPrompt,
      max_tokens: maxTokens,
      temperature,
      ...rest
    })

    const content = (aiRes?.response || '').toString()

    // Try to parse the response as JSON for structured output
    let parsedObject = null
    try {
      parsedObject = JSON.parse(content)
    } catch {
      // If parsing fails, return the content as-is
    }

    // Return Cedar-OS compatible response
    return new Response(JSON.stringify({
      content,
      usage: {
        promptTokens: 0, // Cloudflare AI doesn't provide token counts
        completionTokens: 0,
        totalTokens: 0
      },
      metadata: {
        model,
        provider: 'cloudflare-workers-ai'
      },
      object: parsedObject // Include parsed JSON if successful
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({
      error: 'Structured LLM call failed',
      details: error.message || String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
}

// Handle streaming LLM calls (streamLLM)
async function handleLLMStream(request: Request, env: Env, corsHeaders: any) {
  try {
    const body = await request.json() as {
      prompt?: string
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
      model?: string
      [key: string]: unknown
    }

    // For now, we'll simulate streaming by chunking the response
    // Cloudflare Workers AI doesn't support true streaming yet
    const response = await handleLLMCall(request, env, corsHeaders)
    const data = await response.json()

    if (!response.ok) {
      return response
    }

    // Create a streaming response using Server-Sent Events
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const encoder = new TextEncoder()

    // Simulate streaming by sending chunks
    const content = data.content || '';
    const chunkSize = 10; // Characters per chunk
    
    // Start streaming in the background
    (async () => {
      try {
        for (let i = 0; i < content.length; i += chunkSize) {
          const chunk = content.slice(i, i + chunkSize)
          const eventData = JSON.stringify({ type: 'chunk', content: chunk })
          await writer.write(encoder.encode(`data: ${eventData}\n\n`))
          
          // Small delay to simulate real streaming
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        
        // Send completion event
        const doneEvent = JSON.stringify({ type: 'done' })
        await writer.write(encoder.encode(`data: ${doneEvent}\n\n`))
        
        await writer.close()
      } catch (error) {
        const errorEvent = JSON.stringify({ type: 'error', error: error.message })
        await writer.write(encoder.encode(`data: ${errorEvent}\n\n`))
        await writer.close()
      }
    })()

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders
      }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({
      error: 'Streaming LLM call failed',
      details: error.message || String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
}

// Generate structured briefing for a specific user's interests using batch AI matching
async function generateUserBriefing(articles: any[], userInterests: any[], env: Env) {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Extract topics from user interests
  const topics = userInterests.map(interest => interest.topic)
  console.log('Generating briefing for topics:', topics)

  // Use batch AI matching for all topics and articles simultaneously
  const matchResults = await batchAiMatch(topics, articles, env)
  console.log('Batch match results:', matchResults)

  const briefingTopics: any[] = []

  // Process results for each topic
  for (let topicIndex = 0; topicIndex < topics.length; topicIndex++) {
    const topic = topics[topicIndex]
    const matchingArticleIndices = matchResults[topicIndex] || []
    
    if (matchingArticleIndices.length > 0) {
      const matchingArticles = matchingArticleIndices.map(articleIndex => ({
        title: articles[articleIndex].title,
        source: new URL(articles[articleIndex].url).hostname.replace('www.', ''),
        url: articles[articleIndex].url
      }))

      console.log(`Topic "${topic}" matched ${matchingArticles.length} articles`)

      // Generate summary of new developments for this topic
      const summary = await generateTopicSummary(topic, matchingArticles, articles, env)
      console.log('Summary:', summary)

      briefingTopics.push({
        title: topic,
        summary: summary,
        articles: matchingArticles
      })
    }
  }

  return {
    date: today,
    topics: briefingTopics
  }
}

// Generate a summary of new developments for a topic
async function generateTopicSummary(topic: string, matchingArticles: any[], allArticles: any[], env: Env) {
  const articlesText = matchingArticles.map(article => 
    `- ${article.title} (${article.source})`
  ).join('\n')

  const prompt = `You are creating a brief summary of new developments in "${topic}" based on recent articles.

ARTICLES:
${articlesText}

Create a 2-3 sentence summary focusing on:
- What's NEW or CHANGING in ${topic}
- Recent developments, trends, or updates
- Avoid generic descriptions - focus on what's happening NOW

Summary:`

  try {
    const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      prompt,
      max_tokens: 150,
      temperature: 0.3
    })
    
    return (response.response || '').trim()
  } catch (error) {
    console.error('Summary generation failed:', error)
    return `Recent developments in ${topic} based on ${matchingArticles.length} articles.`
  }
}


// Email template function for briefing notifications
function createBriefingEmailHTML(briefingData: any, briefingKey?: string): string {
  const { date, topics } = briefingData
  
  // Create Talk with AI button if briefing key is provided
  const talkWithAIButton = briefingKey ? `
    <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
      <h2 style="color: white; margin: 0 0 15px 0; font-size: 24px;">🤖 Talk with AI about your briefing</h2>
      <p style="color: rgba(255,255,255,0.9); margin: 0 0 20px 0; font-size: 16px;">
        Have questions about today's news? Chat with our AI assistant for deeper insights and analysis.
      </p>
      <a href="http://localhost:3000/briefing?id=${briefingKey}" 
         style="display: inline-block; background-color: #ffffff; color: #667eea; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
        💬 Start AI Chat
      </a>
    </div>
  ` : ''
  
  let topicsHTML = ''
  if (topics && topics.length > 0) {
    topicsHTML = topics.map((topic: any) => `
      <div style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <h2 style="color: #2d6cdf; margin-top: 0; margin-bottom: 15px; font-size: 20px;">${topic.title}</h2>
        <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">${topic.summary}</p>
        ${topic.articles && topic.articles.length > 0 ? `
          <div style="margin-top: 15px;">
            <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">Related Articles:</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${topic.articles.map((article: any) => `
                <li style="margin-bottom: 8px;">
                  <a href="${article.url}" style="color: #2d6cdf; text-decoration: none; font-weight: 500;">${article.title}</a>
                  <span style="color: #888; font-size: 14px; margin-left: 8px;">(${article.source})</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('')
  } else {
    topicsHTML = '<p style="color: #666; font-style: italic;">No new articles matching your interests were found today.</p>'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Digest - ${date}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2d6cdf;">
        <h1 style="color: #2d6cdf; margin: 0; font-size: 28px;">Daily Digest</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 16px;">${date}</p>
      </div>
      
      ${talkWithAIButton}
      
      <div style="margin-bottom: 30px;">
        <p style="color: #555; font-size: 16px;">Here's your personalized news briefing based on your interests:</p>
      </div>
      
      ${topicsHTML}
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="color: #888; font-size: 14px; margin: 0;">
          This briefing was automatically generated by Daily Digest.<br>
          <a href="#" style="color: #2d6cdf; text-decoration: none;">Manage your preferences</a> | 
          <a href="#" style="color: #2d6cdf; text-decoration: none;">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
  `
}

// Send briefing email using Resend API
async function sendBriefingEmail(env: Env, email: string, briefingData: any, briefingKey?: string): Promise<boolean> {
  try {
    // Debug: Check if API key exists
    if (!env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set in environment')
      return false
    }
    
    console.log('RESEND_API_KEY exists:', !!env.RESEND_API_KEY)
    console.log('API key starts with re_:', env.RESEND_API_KEY.startsWith('re_'))
    
    const emailHTML = createBriefingEmailHTML(briefingData, briefingKey)
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Daily Digest <dailydigest@zs.wtf>', // Use Resend's default domain for testing
        to: [email],
        subject: `Your Daily Digest - ${briefingData.date}`,
        html: emailHTML,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      return false
    }

    const result = await response.json()
    console.log('Email sent successfully:', result)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Helper function to build prompt with context
function buildPromptWithContext(messages: Array<{role: string, content: string}>): string {
  const systemPrompt = `You are a helpful AI assistant for the Daily Digest application. You help users understand and discuss news articles, current events, and provide insights on various topics.

Guidelines:
- Be informative and helpful
- Provide accurate information based on the context
- If discussing articles, reference the briefing context when relevant
- Be concise but thorough in explanations`

  let prompt = systemPrompt + '\n\nCONVERSATION:\n'
  
  for (const message of messages) {
    const role = message.role.toUpperCase()
    prompt += `${role}: ${message.content}\n`
  }
  
  prompt += 'ASSISTANT:'
  return prompt
}