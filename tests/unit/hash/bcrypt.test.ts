import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/hash/bcrypt'
import { CipherError } from '../../../lib/utils/errors'

describe('Bcrypt Hash Unit Tests', () => {
  it('passes standard test vectors (decrypt/verify)', () => {
    for (const vector of TEST_VECTORS) {
      const result = decrypt(vector.input, vector.key)
      expect(result.output).toBe(vector.expected)
    }
  })

  it('encrypts to valid bcrypt format and has correct steps in instrumented mode', () => {
    const result = encrypt('mySecurePassword', '', { instrument: true })
    expect(result.output.startsWith('$2a$') || result.output.startsWith('$2b$')).toBe(true)
    expect(result.steps.length).toBe(4)
    expect(result.steps[0].label).toBe('Salt and Cost Parsing')
    expect(result.steps[1].label).toBe('EksBlowfish Key Setup')
    expect(result.steps[2].label).toBe('Magic State Encryption')
    expect(result.steps[3].label).toBe('Encode Hash String')
  })

  it('throws on invalid cost factor', () => {
    expect(() => encrypt('pwd', '', { mode: '2' })).toThrowError(CipherError)
    expect(() => encrypt('pwd', '', { mode: '32' })).toThrowError(CipherError)
  })

  it('throws on missing key in decrypt', () => {
    expect(() => decrypt('pwd', '')).toThrowError(CipherError)
  })
})
