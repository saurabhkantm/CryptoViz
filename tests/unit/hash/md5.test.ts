import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/hash/md5'
import { CipherError } from '../../../lib/utils/errors'

describe('MD5 Hash Unit Tests', () => {
  it('passes standard test vectors (encrypt)', () => {
    for (const vector of TEST_VECTORS) {
      const result = encrypt(vector.input, vector.key)
      expect(result.output).toBe(vector.expected)
    }
  })

  it('throws on decrypt', () => {
    expect(() => decrypt('900150983cd24fb0d6963f7d28e17f72')).toThrowError(CipherError)
  })

  it('generates correct step count in instrumented mode', () => {
    const result = encrypt('abc', '', { instrument: true })
    // MD5 instrumented steps = 68
    expect(result.steps.length).toBe(68)
    expect(result.steps[0].label).toBe('Preprocessing - padding')
    expect(result.steps[1].label).toBe('Initialize working variables')
    expect(result.steps[66].label).toBe('Add to hash state')
    expect(result.steps[67].label).toBe('Final hash output')
  })
})
