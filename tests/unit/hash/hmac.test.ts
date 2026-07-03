import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/hash/hmac'
import { CipherError } from '../../../lib/utils/errors'

describe('HMAC-SHA256 Unit Tests', () => {
  it('passes standard test vectors', () => {
    for (const vector of TEST_VECTORS) {
      const result = encrypt(vector.input, vector.key)
      expect(result.output).toBe(vector.expected)
    }
  })

  it('throws on decrypt', () => {
    expect(() => decrypt('any', 'key')).toThrowError(CipherError)
  })

  it('generates correct step count in instrumented mode', () => {
    const result = encrypt('Hi There', '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', { instrument: true })
    expect(result.steps.length).toBe(5)
    expect(result.steps[0].label).toBe('Key Preparation')
    expect(result.steps[1].label).toBe("Inner Key (K' XOR ipad)")
    expect(result.steps[2].label).toBe('Inner SHA-256 Hash')
    expect(result.steps[3].label).toBe("Outer Key (K' XOR opad)")
    expect(result.steps[4].label).toBe('Outer SHA-256 Hash (Final HMAC)')
  })

  it('handles keys larger than 64 bytes correctly', () => {
    const longKey = 'a'.repeat(65)
    const result = encrypt('message', longKey)
    expect(result.output.length).toBe(64) // valid hex sha256 output is 64 chars
  })
})
