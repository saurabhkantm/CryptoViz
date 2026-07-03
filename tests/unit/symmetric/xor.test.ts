import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/symmetric/xor'
import { CipherError } from '../../../lib/utils/errors'
import fc from 'fast-check'

describe('XOR Cipher Unit Tests', () => {
  it('passes standard test vectors (encrypt/decrypt)', () => {
    for (const vector of TEST_VECTORS) {
      const encResult = encrypt(vector.input, vector.key)
      expect(encResult.output).toBe(vector.expected)

      const decResult = decrypt(vector.expected, vector.key)
      expect(decResult.output).toBe(vector.input)
    }
  })

  it('generates correct step count in instrumented mode', () => {
    const input = 'HELLO'
    const key = 'key'
    const result = encrypt(input, key, { instrument: true })
    // XOR budget: 1 per byte + 2 (setup + security analysis)
    expect(result.steps.length).toBe(input.length + 2)
  })

  it('throws correct errors for invalid input and empty keys', () => {
    expect(() => encrypt('', 'key')).toThrowError(CipherError)
    expect(() => encrypt('hello', '')).toThrowError(CipherError)
  })

  it('property-based fuzzing: encrypt then decrypt returns original', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (input, key) => {
          const enc = encrypt(input, key)
          const dec = decrypt(enc.output, key)
          expect(dec.output).toBe(input)
        }
      ),
      { numRuns: 500 }
    )
  })
})
