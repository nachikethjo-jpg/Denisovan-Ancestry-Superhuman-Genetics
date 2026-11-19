/**
 * Firestore Security Rules TDD Test Suite (Phase 0 - Dirty Dozen Verification)
 * Verifies all 12 adversarial payloads against the hardened ruleset.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated profile read',
    operation: 'get',
    path: '/users/alice',
    auth: null,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Cross-user PII read',
    operation: 'get',
    path: '/users/alice',
    auth: { uid: 'bob', email: 'bob@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'User collection enumeration',
    operation: 'list',
    path: '/users',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Unverified email write',
    operation: 'create',
    path: '/users/alice',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: false },
    payload: {
      uid: 'alice',
      displayName: 'Alice',
      email: 'alice@example.com',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow field injection on profile create',
    operation: 'create',
    path: '/users/alice',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: {
      uid: 'alice',
      displayName: 'Alice',
      email: 'alice@example.com',
      isAdmin: true,
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Identity spoofing on savedGenome create',
    operation: 'create',
    path: '/users/alice/savedGenomes/g1',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: {
      userId: 'bob',
      label: 'Spoofed',
      geneIds: ['epas1'],
      synergyIndex: 100,
      notes: '',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Orphaned savedGenome create without parent user document',
    operation: 'create',
    path: '/users/ghostUser/savedGenomes/g1',
    auth: { uid: 'ghostUser', email: 'ghost@example.com', email_verified: true },
    payload: {
      userId: 'ghostUser',
      label: 'Orphan',
      geneIds: ['epas1'],
      synergyIndex: 100,
      notes: '',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'ID poisoning with invalid path characters',
    operation: 'create',
    path: '/users/alice/savedGenomes/bad..id$poison',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: {
      userId: 'alice',
      label: 'Poisoned ID',
      geneIds: ['epas1'],
      synergyIndex: 100,
      notes: '',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client timestamp forgery',
    operation: 'create',
    path: '/users/alice/savedGenomes/g2',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: {
      userId: 'alice',
      label: 'Forged time',
      geneIds: ['epas1'],
      synergyIndex: 100,
      notes: '',
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Invalid geneIds allowlist bypass',
    operation: 'create',
    path: '/users/alice/savedGenomes/g3',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: {
      userId: 'alice',
      label: 'Invalid gene',
      geneIds: ['epas1', 'injected_gene'],
      synergyIndex: 100,
      notes: '',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Value poisoning on update (oversized label & out-of-range synergyIndex)',
    operation: 'update',
    path: '/users/alice/savedGenomes/g1',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: {
      label: 'X'.repeat(200),
      synergyIndex: 999,
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Immutable field mutation on update',
    operation: 'update',
    path: '/users/alice/savedGenomes/g1',
    auth: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    payload: {
      userId: 'bob',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
