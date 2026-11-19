/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Allowed gene IDs matching firebase-blueprint.json & firestore.rules
export const ALLOWED_GENE_IDS = new Set([
  'epas1',
  'fam178b',
  'lrp5',
  'dec2',
  'faahout',
  'actn3',
]);

// --- Structured Firestore Error Handling ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Startup Connection Validation ---
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// --- Data Models ---
export interface SavedGenomeRecord {
  id: string;
  userId: string;
  label: string;
  geneIds: string[];
  synergyIndex: number;
  notes: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface SavedTermRecord {
  id: string;
  userId: string;
  termKey: string;
  termLabel: string;
  category: string;
  createdAt: Timestamp | null;
}

// --- Defensive Payload Helpers (Synchronized with firebase-blueprint.json) ---
const VALID_ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const VALID_TERM_KEY_REGEX = /^[a-z0-9\-]+$/;

function sanitizeText(value: string, maxLength: number, fallback = ''): string {
  const trimmed = value.trim();
  const base = trimmed.length > 0 ? trimmed : fallback;
  return base.slice(0, maxLength);
}

function generateSafeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  const id = `${prefix}_${ts}_${rand}`;
  return id.slice(0, 128);
}

// --- Firestore Operations ---
export async function syncUserProfile(user: User): Promise<void> {
  if (!user.uid || !VALID_ID_REGEX.test(user.uid) || !user.email) {
    return;
  }
  const path = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  const safeDisplayName = sanitizeText(
    user.displayName || user.email.split('@')[0] || 'Researcher',
    100,
    'Researcher'
  );
  const safeEmail = sanitizeText(user.email, 254);

  try {
    const existingSnap = await getDoc(userRef);
    if (!existingSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: safeDisplayName,
        email: safeEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        displayName: safeDisplayName,
        email: safeEmail,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function createSavedGenome(
  userId: string,
  input: { label: string; geneIds: string[]; synergyIndex: number; notes: string }
): Promise<string> {
  const genomeId = generateSafeDocId('genome');
  const path = `users/${userId}/savedGenomes/${genomeId}`;

  const cleanGenes = Array.from(
    new Set(input.geneIds.filter((g) => ALLOWED_GENE_IDS.has(g)))
  ).slice(0, 6);

  if (cleanGenes.length === 0) {
    throw new Error('Select at least one gene before saving a spliced profile.');
  }

  const safeLabel = sanitizeText(input.label, 80, 'Custom Spliced Profile');
  const safeNotes = sanitizeText(input.notes, 400, '');
  const safeSynergy = Math.max(10, Math.min(100, Math.round(input.synergyIndex)));

  try {
    await setDoc(doc(db, 'users', userId, 'savedGenomes', genomeId), {
      userId,
      label: safeLabel,
      geneIds: cleanGenes,
      synergyIndex: safeSynergy,
      notes: safeNotes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return genomeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteSavedGenome(userId: string, genomeId: string): Promise<void> {
  if (!VALID_ID_REGEX.test(genomeId)) return;
  const path = `users/${userId}/savedGenomes/${genomeId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'savedGenomes', genomeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveGlossaryTerm(
  userId: string,
  input: { termKey: string; termLabel: string; category: string }
): Promise<void> {
  const cleanKey = input.termKey.toLowerCase().trim().slice(0, 64);
  if (!VALID_TERM_KEY_REGEX.test(cleanKey)) {
    throw new Error('Invalid glossary term identifier.');
  }
  const path = `users/${userId}/savedTerms/${cleanKey}`;
  try {
    await setDoc(doc(db, 'users', userId, 'savedTerms', cleanKey), {
      userId,
      termKey: cleanKey,
      termLabel: sanitizeText(input.termLabel, 80, cleanKey),
      category: sanitizeText(input.category, 60, 'Genomics'),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteGlossaryTerm(userId: string, termKey: string): Promise<void> {
  const cleanKey = termKey.toLowerCase().trim().slice(0, 64);
  if (!VALID_TERM_KEY_REGEX.test(cleanKey)) return;
  const path = `users/${userId}/savedTerms/${cleanKey}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'savedTerms', cleanKey));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeSavedGenomes(
  userId: string,
  onData: (genomes: SavedGenomeRecord[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = `users/${userId}/savedGenomes`;
  const q = query(collection(db, 'users', userId, 'savedGenomes'), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedGenomeRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: String(data.userId || userId),
          label: String(data.label || 'Untitled Profile'),
          geneIds: Array.isArray(data.geneIds) ? data.geneIds.map(String) : [],
          synergyIndex: typeof data.synergyIndex === 'number' ? data.synergyIndex : 100,
          notes: typeof data.notes === 'string' ? data.notes : '',
          createdAt: (data.createdAt as Timestamp) || null,
          updatedAt: (data.updatedAt as Timestamp) || null,
        };
      });
      items.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() ?? Date.now();
        const bTime = b.createdAt?.toMillis() ?? Date.now();
        return bTime - aTime;
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export function subscribeSavedTerms(
  userId: string,
  onData: (terms: SavedTermRecord[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = `users/${userId}/savedTerms`;
  const q = query(collection(db, 'users', userId, 'savedTerms'), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedTermRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: String(data.userId || userId),
          termKey: String(data.termKey || docSnap.id),
          termLabel: String(data.termLabel || docSnap.id),
          category: String(data.category || 'Genomics'),
          createdAt: (data.createdAt as Timestamp) || null,
        };
      });
      items.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() ?? Date.now();
        const bTime = b.createdAt?.toMillis() ?? Date.now();
        return bTime - aTime;
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}
