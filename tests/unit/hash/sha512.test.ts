import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/hash/sha512'
import { CipherError } from '../../../lib/utils/errors'

describe('SHA-512 Hash Unit Tests', () => {
  it('passes standard test vectors (encrypt)', () => {
    for (const vector of TEST_VECTORS) {
      const result = encrypt(vector.input, vector.key)
      expect(result.output).toBe(vector.expected)
    }
  })

  it('throws on decrypt', () => {
    expect(() => decrypt('ddaf35a193617abacc417349ae20413112e6fa4e89a97e')).toThrowError(CipherError)
  })

  it('generates correct step count in instrumented mode', () => {
    const result = encrypt('abc', '', { instrument: true })
    // SHA-512 instrumented steps = 89
    expect(result.steps.length).toBe(89)
    expect(result.steps[0].label).toBe('Preprocessing - padding')
    expect(result.steps[1].label).toBe('Message schedule W[0..15]')
    expect(result.steps[6].label).toBe('Initialize working variables')
    expect(result.steps[87].label).toBe('Add to hash state')
    expect(result.steps[88].label).toBe('Final hash output')
  })
})
