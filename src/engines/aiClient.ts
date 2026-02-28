export interface AISettings {
  provider: 'openai' | 'anthropic'
  apiKey: string
  model: string
}

const DEFAULT_SETTINGS: AISettings = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
}

// Cache for AI responses to avoid redundant calls
const responseCache = new Map<string, string>()

export function getAISettings(): AISettings {
  try {
    const stored = localStorage.getItem('ai-settings')
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) as Partial<AISettings> } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveAISettings(settings: AISettings): void {
  localStorage.setItem('ai-settings', JSON.stringify(settings))
}

export async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const cacheKey = `${prompt}::${systemPrompt ?? ''}`
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey)!
  }

  const settings = getAISettings()
  if (!settings.apiKey) {
    throw new Error('Please configure your AI API key in Settings')
  }

  let response: string

  if (settings.provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: settings.model,
        max_tokens: 1024,
        system: systemPrompt ?? '',
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json() as {
      error?: { message?: string }
      content?: { text?: string }[]
    }
    if (!res.ok) throw new Error(data.error?.message ?? 'Anthropic API error')
    response = data.content?.[0]?.text ?? 'No response'
  } else {
    const messages: { role: string; content: string }[] = []
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
    messages.push({ role: 'user', content: prompt })

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages,
        max_tokens: 1024,
      }),
    })
    const data = await res.json() as {
      error?: { message?: string }
      choices?: { message?: { content?: string } }[]
    }
    if (!res.ok) throw new Error(data.error?.message ?? 'OpenAI API error')
    response = data.choices?.[0]?.message?.content ?? 'No response'
  }

  responseCache.set(cacheKey, response)
  return response
}

export function clearAICache(): void {
  responseCache.clear()
}
