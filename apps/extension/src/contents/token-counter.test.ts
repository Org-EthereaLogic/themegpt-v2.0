import { describe, expect, it } from 'vitest'
import { calculateTokenStats } from './token-counter'

describe('calculateTokenStats', () => {
    it('should correctly count tokens for user and assistant', () => {
        const messages = [
            { role: 'user', text: 'Hello world' },
            { role: 'assistant', text: 'Hi there' }
        ]

        const stats = calculateTokenStats(messages)
        
        // 'Hello world' is roughly 2 tokens
        // 'Hi there' is roughly 2 tokens
        // Check that counts are non-zero and sum up correctly
        expect(stats.user).toBeGreaterThan(0)
        expect(stats.assistant).toBeGreaterThan(0)
        expect(stats.total).toBe(stats.user + stats.assistant)
    })

    it('should handle empty or null text', () => {
        const messages = [
            { role: 'user', text: '' },
            { role: 'assistant', text: null }
        ]

        const stats = calculateTokenStats(messages)
        
        expect(stats.user).toBe(0)
        expect(stats.assistant).toBe(0)
        expect(stats.total).toBe(0)
    })

    it('should ignore tokens from unknown roles', () => {
        const messages = [
            { role: 'system', text: 'System message' }, // Assuming only user/assistant are counted
            { role: 'user', text: 'User message' }
        ]

        const stats = calculateTokenStats(messages)
        
        expect(stats.assistant).toBe(0)
        expect(stats.user).toBeGreaterThan(0)
        expect(stats.total).toBe(stats.user)
    })
})
