/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  auth,
  googleProvider,
  syncUserProfile,
  createSavedGenome,
  deleteSavedGenome,
  saveGlossaryTerm,
  deleteGlossaryTerm,
  subscribeSavedGenomes,
  subscribeSavedTerms,
  SavedGenomeRecord,
  SavedTermRecord,
} from '../firebase';

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  signingIn: boolean;
  authError: string | null;
  savedGenomes: SavedGenomeRecord[];
  savedTerms: SavedTermRecord[];
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  saveGenome: (input: {
    label: string;
    geneIds: string[];
    synergyIndex: number;
    notes: string;
  }) => Promise<string | null>;
  removeGenome: (genomeId: string) => Promise<void>;
  toggleBookmarkTerm: (input: {
    termKey: string;
    termLabel: string;
    category: string;
  }) => Promise<boolean>;
  isTermBookmarked: (termKey: string) => boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [savedGenomes, setSavedGenomes] = useState<SavedGenomeRecord[]>([]);
  const [savedTerms, setSavedTerms] = useState<SavedTermRecord[]>([]);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribeAuth = onAuthStateChanged(auth, async (nextUser) => {
      if (!active) return;
      setUser(nextUser);
      setAuthReady(true);
      setAuthError(null);

      if (nextUser) {
        try {
          await syncUserProfile(nextUser);
          if (active) setProfileReady(true);
        } catch (err) {
          if (active) {
            setProfileReady(false);
            setAuthError(
              err instanceof Error
                ? 'Unable to sync researcher profile right now.'
                : 'Profile sync error.'
            );
          }
        }
      } else {
        setProfileReady(false);
        setSavedGenomes([]);
        setSavedTerms([]);
      }
    });

    return () => {
      active = false;
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!authReady || !profileReady || !user) return;

    const unsubGenomes = subscribeSavedGenomes(
      user.uid,
      (genomes) => setSavedGenomes(genomes),
      (err) => setFatalError(err)
    );

    const unsubTerms = subscribeSavedTerms(
      user.uid,
      (terms) => setSavedTerms(terms),
      (err) => setFatalError(err)
    );

    return () => {
      unsubGenomes();
      unsubTerms();
    };
  }, [authReady, profileReady, user]);

  // Surface Firestore security/runtime errors to the ErrorBoundary cleanly
  if (fatalError) {
    throw fatalError;
  }

  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    setSigningIn(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message.includes('popup-closed-by-user')
          ? 'Sign-in window closed before completing.'
          : 'Google Sign-In could not be completed. Please allow popups and try again.';
      setAuthError(message);
      return null;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
  }, []);

  const saveGenome = useCallback(
    async (input: {
      label: string;
      geneIds: string[];
      synergyIndex: number;
      notes: string;
    }): Promise<string | null> => {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await signInWithGoogle();
        if (!currentUser) return null;
        await syncUserProfile(currentUser);
      }
      return await createSavedGenome(currentUser.uid, input);
    },
    [user, signInWithGoogle]
  );

  const removeGenome = useCallback(
    async (genomeId: string) => {
      if (!user) return;
      await deleteSavedGenome(user.uid, genomeId);
    },
    [user]
  );

  const isTermBookmarked = useCallback(
    (termKey: string) => savedTerms.some((t) => t.termKey === termKey),
    [savedTerms]
  );

  const toggleBookmarkTerm = useCallback(
    async (input: {
      termKey: string;
      termLabel: string;
      category: string;
    }): Promise<boolean> => {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await signInWithGoogle();
        if (!currentUser) return false;
        await syncUserProfile(currentUser);
      }
      const alreadySaved = savedTerms.some((t) => t.termKey === input.termKey);
      if (alreadySaved) {
        await deleteGlossaryTerm(currentUser.uid, input.termKey);
        return false;
      } else {
        await saveGlossaryTerm(currentUser.uid, input);
        return true;
      }
    },
    [user, savedTerms, signInWithGoogle]
  );

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        signingIn,
        authError,
        savedGenomes,
        savedTerms,
        signInWithGoogle,
        signOutUser,
        saveGenome,
        removeGenome,
        toggleBookmarkTerm,
        isTermBookmarked,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return ctx;
}

// --- Error Boundary for Firestore / Runtime Resilience ---
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class FirebaseErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        readable = parsed.error.includes('Quota exceeded')
          ? 'Daily Firestore free-tier quota exceeded. Quota resets tomorrow.'
          : `Data access error (${parsed.operationType || 'read'}): ${parsed.error}`;
      }
    } catch {
      // Plain error message
    }
    return { hasError: true, errorMessage: readable };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center p-6 text-stone-900">
          <div className="max-w-md w-full bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
            <p className="text-xs font-mono text-stone-500 mb-2">Application Recovery</p>
            <h1 className="font-serif text-2xl text-stone-900 mb-3">
              Unable to load synced research data
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              {this.state.errorMessage}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.reload();
              }}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
