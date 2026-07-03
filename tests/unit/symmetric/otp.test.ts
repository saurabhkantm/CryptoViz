import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/symmetric/otp'
import { CipherError } from '../../../lib/utils/errors'
import fc from 'fast-check'

describe('OTP Cipher Unit Tests', () => {
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
    const key = '12345'
    const result = encrypt(input, key, { instrument: true })
    // OTP budget: 1 per byte + 2 (setup + secrecy analysis)
    expect(result.steps.length).toBe(input.length + 2)
  })

  it('throws correct error when key is shorter than input', () => {
    expect(() => encrypt('HELLO', '123')).toThrowError(CipherError)
    expect(() => encrypt('HELLO', '123')).toThrow(/must be at least as long/)
  })

  it('property-based fuzzing: encrypt then decrypt returns original', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (input) => {
          // Generate key that is exactly the same length
          const keyBytes = new Uint8Array(input.length)
          for (let i = 0; i < input.length; i++) {
            keyBytes[i] = Math.floor(Math.random() * 256)
          }
          const keyHex = Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('')

          const enc = encrypt(input, keyHex)
          const dec = decrypt(enc.output, keyHex)
          expect(dec.output).toBe(input)
        }
      ),
      { numRuns: 500 }
    )
  })
})
