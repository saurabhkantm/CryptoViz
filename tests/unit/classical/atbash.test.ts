import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/classical/atbash'
import { CipherError } from '../../../lib/utils/errors'
import fc from 'fast-check'

describe('Atbash Cipher Unit Tests', () => {
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
    const result = encrypt(input, '', { instrument: true })
    // Atbash budget: 1 per char + 1 setup = input.length + 1
    expect(result.steps.length).toBe(input.length + 1)
    expect(result.steps[0].label).toBe('Alphabet mirror table')
  })

  it('is self-inverse', () => {
    const input = 'Atbash Cryptography'
    const enc = encrypt(input).output
    const dec = decrypt(enc).output
    expect(dec).toBe(input)
  })

  it('throws correct errors for invalid input', () => {
    expect(() => encrypt('')).toThrowError(CipherError)
  })

  it('property-based fuzzing: encrypt(encrypt(x)) === x', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (input) => {
          const enc = encrypt(input).output
          const doubleEnc = encrypt(enc).output
          expect(doubleEnc).toBe(input)
        }
      ),
      { numRuns: 100 }
    )
  })
})
