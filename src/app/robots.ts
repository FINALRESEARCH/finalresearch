import type { MetadataRoute } from 'next'

/**
 * Portals are disallowed by prefix rather than by listing each client — a
 * robots.txt that enumerates live project codes would advertise exactly what
 * it's trying to hide.
 */
const PRIVATE_PATHS = ['/fr-', '/studio', '/api/portal/']

// Crawlers that ignore or reinterpret a bare Disallow, named explicitly.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'meta-externalagent',
  'Amazonbot',
  'cohere-ai',
  'Diffbot',
  'Timpibot',
  'omgili',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      // Client work is not training data — these get a blanket disallow.
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        disallow: '/',
      })),
    ],
  }
}
