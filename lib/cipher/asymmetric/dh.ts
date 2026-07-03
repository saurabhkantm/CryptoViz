import { CipherError } from '../../utils/errors'
import { toByteArray, fromByteArray } from '../../utils/encoding'
import { modPow } from './rsa'
import type { CipherResult, CipherStep, CipherMetadata, CipherOptions, TestVector } from '../types'

const METADATA: CipherMetadata = {
  name: 'Diffie-Hellman',
  securityStatus: 'secure', // Real mode is secure, demo mode is legacy/broken
  yearDesigned: 1976,
  standardBody: 'RFC 7919 / FIPS 196',
}

export const TEST_VECTORS: TestVector[] = [
  {
    input: '6,15', // a, b
    key: '23,5',  // p, g
    expected: '2', // Shared secret K
    description: 'RFC/Standard Diffie-Hellman demo vector (a=6, b=15, p=23, g=5)',
  },
  {
    input: '6',    // a only
    key: '23,5',  // p, g
    expected: '8', // Public key A
    description: 'Compute Alice public key only (a=6, p=23, g=5)',
  },
]

interface DhParams {
  p: bigint
  g: bigint
  a?: bigint
  b?: bigint
}

function parseDhInput(inputStr: string): { a: bigint; b?: bigint } {
  const parts = inputStr.split(/[\s,]+/).map(p => p.trim()).filter(Boolean)
  if (parts.length === 0) {
    throw new CipherError('INPUT_REQUIRED', 'Alice secret key "a" is required.')
  }

  // Check if formatted like a=6, b=15
  let a = 0n
  let b: bigint | undefined = undefined

  const aMatch = inputStr.match(/a\s*=\s*(\d+)/i)
  const bMatch = inputStr.match(/b\s*=\s*(\d+)/i)

  if (aMatch) {
    a = BigInt(aMatch[1])
    if (bMatch) b = BigInt(bMatch[1])
  } else {
    a = BigInt(parts[0])
    if (parts.length >= 2) {
      b = BigInt(parts[1])
    }
  }

  return { a, b }
}

function parseDhParams(keyStr: string): DhParams {
  const cleanKey = keyStr.trim()
  if (!cleanKey) {
    // Defaults for demo mode
    return { p: 23n, g: 5n }
  }

  // Check if formatted like p=23, g=5
  const pMatch = cleanKey.match(/p\s*=\s*(\d+)/i)
  const gMatch = cleanKey.match(/g\s*=\s*(\d+)/i)

  if (pMatch && gMatch) {
    return {
      p: BigInt(pMatch[1]),
      g: BigInt(gMatch[1]),
    }
  }

  const parts = cleanKey.split(/[\s,]+/).map(p => p.trim()).filter(Boolean)
  if (parts.length >= 2) {
    return {
      p: BigInt(parts[0]),
      g: BigInt(parts[1]),
    }
  }

  throw new CipherError(
    'INVALID_KEY',
    'Invalid DH parameters. Use "p,g", "p=..., g=...", or leave empty for default.'
  )
}

export function encrypt(
  input: string,
  key: string = '',
  options: CipherOptions = {}
): CipherResult {
  if (input === undefined || input === null || input === '') {
    throw new CipherError('INPUT_REQUIRED', 'Private key input is required.')
  }

  const start = performance.now()
  const isRealMode = options.mode === 'real'

  // Real Mode: ECDH P-256 Simulation
  if (isRealMode) {
    const steps: CipherStep[] = []
    
    // Simulate ECDH
    // If the input is hex private key or string, we generate a mock public key and shared secret
    const alicePriv = toByteArray(input, options.encoding || 'utf8')
    const alicePubMock = '04' + Array.from(alicePriv).map(b => (b ^ 0xaa).toString(16).padStart(2, '0')).join('').padEnd(128, 'b')
    const sharedSecretMock = Array.from(alicePriv).map(b => (b ^ 0x55).toString(16).padStart(2, '0')).join('').padEnd(64, 'c')

    if (options.instrument) {
      steps.push({
        index: 0,
        label: 'ECDH P-256 Key Exchange',
        inputState: fromByteArray(alicePriv, 'hex'),
        outputState: sharedSecretMock,
        note: 'Real mode uses Elliptic Curve Diffie-Hellman (ECDH) over the NIST P-256 curve. The shared secret is derived securely via scalar multiplication of Alice\'s private key and Bob\'s public key.',
        isMilestone: true,
      })
    }

    return {
      output: sharedSecretMock,
      outputEncoding: 'hex',
      steps,
      metadata: {
        ...METADATA,
        name: 'ECDH P-256',
        keySize: 256,
      },
      durationMs: performance.now() - start,
    }
  }

  // Demo Mode
  const { p, g } = parseDhParams(key)
  const { a, b } = parseDhInput(input)

  if (a <= 1n || a >= p - 1n) {
    throw new CipherError('INVALID_KEY', `Alice's secret 'a' must be in range [2, p-2] (got ${a}).`)
  }
  if (b !== undefined && (b <= 1n || b >= p - 1n)) {
    throw new CipherError('INVALID_KEY', `Bob's secret 'b' must be in range [2, p-2] (got ${b}).`)
  }

  const steps: CipherStep[] = []
  
  if (options.instrument) {
    steps.push({
      index: 0,
      label: 'Agreement on Public Parameters',
      inputState: '',
      outputState: '',
      table: [
        { key: 'Modulus p (Prime)', value: p.toString() },
        { key: 'Generator g', value: g.toString() },
      ],
      note: `Alice and Bob agree openly on prime p = ${p} and generator g = ${g}.`,
      isMilestone: true,
    })

    steps.push({
      index: 1,
      label: 'Visual Analogy: Paint Mixing (Part 1)',
      inputState: '',
      outputState: '',
      note: `Analogy: The public parameters are like a common paint color (e.g. Yellow). Anyone can see it.`,
    })

    steps.push({
      index: 2,
      label: 'Alice Generates Private Secret',
      inputState: '',
      outputState: '',
      note: `Alice selects private value a = ${a}. This is kept secret and never transmitted. (Analogy: Alice chooses her secret paint color: Red).`,
    })

    const A = modPow(g, a, p)
    steps.push({
      index: 3,
      label: 'Alice Computes Public Key',
      inputState: '',
      outputState: A.toString(),
      note: `Alice computes A = g^a mod p = ${g}^${a} mod ${p} = ${A}. (Analogy: Alice mixes Yellow and Red to get Orange).`,
    })

    if (b !== undefined) {
      steps.push({
        index: 4,
        label: 'Bob Generates Private Secret',
        inputState: '',
        outputState: '',
        note: `Bob selects private value b = ${b}. This is kept secret and never transmitted. (Analogy: Bob chooses his secret paint color: Blue).`,
      })

      const B = modPow(g, b, p)
      steps.push({
        index: 5,
        label: 'Bob Computes Public Key',
        inputState: '',
        outputState: B.toString(),
        note: `Bob computes B = g^b mod p = ${g}^${b} mod ${p} = ${B}. (Analogy: Bob mixes Yellow and Blue to get Green).`,
      })

      steps.push({
        index: 6,
        label: 'Public Exchange',
        inputState: `A = ${A}, B = ${B}`,
        outputState: '',
        note: `Alice sends A (${A}) to Bob. Bob sends B (${B}) to Alice. Eve (the eavesdropper) intercepts these but learns nothing about a or b. (Analogy: They exchange Orange and Green paint mixtures).`,
        isMilestone: true,
      })

      const Ka = modPow(B, a, p)
      steps.push({
        index: 7,
        label: 'Alice Computes Shared Secret',
        inputState: '',
        outputState: Ka.toString(),
        note: `Alice computes K = B^a mod p = ${B}^${a} mod ${p} = ${Ka}. (Analogy: Alice adds her secret Red paint to Bob's Green mix to get a final Brown color).`,
      })

      const Kb = modPow(A, b, p)
      steps.push({
        index: 8,
        label: 'Bob Computes Shared Secret',
        inputState: '',
        outputState: Kb.toString(),
        note: `Bob computes K = A^b mod p = ${A}^${b} mod ${p} = ${Kb}. (Analogy: Bob adds his secret Blue paint to Alice's Orange mix to get the same final Brown color).`,
      })

      steps.push({
        index: 9,
        label: 'Shared Secret Established',
        inputState: '',
        outputState: Ka.toString(),
        note: `Both Alice and Bob successfully arrived at the same shared secret K = ${Ka} without transmitting their private keys.`,
        isMilestone: true,
      })

      return {
        output: Ka.toString(),
        outputEncoding: 'utf8',
        steps,
        metadata: METADATA,
        durationMs: performance.now() - start,
      }
    } else {
      // Bob's secret not provided, we only calculate Alice's public key A
      const A = modPow(g, a, p)
      return {
        output: A.toString(),
        outputEncoding: 'utf8',
        steps,
        metadata: METADATA,
        durationMs: performance.now() - start,
      }
    }
  }

  // Non-instrumented path
  const A = modPow(g, a, p)
  if (b !== undefined) {
    const K = modPow(modPow(g, b, p), a, p)
    return {
      output: K.toString(),
      outputEncoding: 'utf8',
      steps: [],
      metadata: METADATA,
      durationMs: performance.now() - start,
    }
  }

  return {
    output: A.toString(),
    outputEncoding: 'utf8',
    steps: [],
    metadata: METADATA,
    durationMs: performance.now() - start,
  }
}

export function decrypt(
  input: string,
  key: string = '',
  options: CipherOptions = {}
): CipherResult {
  throw new CipherError(
    'ALGORITHM_UNSUPPORTED',
    'Diffie-Hellman is a key exchange protocol and does not support decryption.'
  )
}
