
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  deleteUser,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  setDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { Goal, UserProfile } from '../types';
import { MOCK_GOAL } from '../constants';

// --- CONFIGURATION ---
// TODO: Replace with your real Firebase Config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "mock-key", 
  authDomain: "bonusee-app.firebaseapp.com",
  projectId: "bonusee-app",
  storageBucket: "bonusee-app.appspot.com",
  messagingSenderId: "00000000000",
  appId: "1:00000000000:web:00000000000000"
};

// Flag to toggle real firebase. 
// Since we don't have real keys in this preview environment, we default to false to use the Mock Service.
// Set this to TRUE when you deploy with real keys.
const USE_REAL_FIREBASE = false; 

let auth: any;
let db: any;

if (USE_REAL_FIREBASE) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// --- REAL FIREBASE SERVICE ---

const RealService = {
  subscribeToGoals: (uid: string, callback: (goals: Goal[]) => void) => {
    const q = query(collection(db, "users", uid, "goals"));
    return onSnapshot(q, (snapshot) => {
      const goals: Goal[] = [];
      snapshot.forEach((doc) => {
        goals.push({ id: doc.id, ...doc.data() } as Goal);
      });
      // Sort by creation for consistency
      goals.sort((a, b) => b.createdAt - a.createdAt);
      callback(goals);
    });
  },

  addGoal: async (uid: string, goal: Omit<Goal, 'id'>) => {
    await addDoc(collection(db, "users", uid, "goals"), { ...goal, userId: uid });
  },

  updateGoal: async (uid: string, goal: Goal) => {
    const goalRef = doc(db, "users", uid, "goals", goal.id);
    const { id, ...data } = goal;
    await updateDoc(goalRef, data);
  },

  deleteGoal: async (uid: string, goalId: string) => {
    await deleteDoc(doc(db, "users", uid, "goals", goalId));
  },

  batchUpdateGoals: async (uid: string, goals: Goal[]) => {
    // Firestore doesn't have a simple "replace all" for lists without batch writes.
    // For simplicity in this demo, we update individual docs if needed.
    for (const g of goals) {
        const goalRef = doc(db, "users", uid, "goals", g.id);
        const { id, ...data } = g;
        await setDoc(goalRef, data, { merge: true });
    }
  },

  deleteUserData: async (uid: string) => {
      const q = query(collection(db, "users", uid, "goals"));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
          batch.delete(doc.ref);
      });
      await batch.commit();
  }
};

// --- MOCK SERVICE (Local Storage + Fake Async) ---

const MockService = {
  subscribeToGoals: (uid: string, callback: (goals: Goal[]) => void) => {
    // Simulate network delay
    setTimeout(() => {
      const saved = localStorage.getItem(`bonusee-goals-${uid}`);
      const goals = saved ? JSON.parse(saved) : [];
      callback(goals);
    }, 500);
    return () => {}; // Unsubscribe no-op
  },

  saveGoals: (uid: string, goals: Goal[]) => {
    localStorage.setItem(`bonusee-goals-${uid}`, JSON.stringify(goals));
  },

  addGoal: async (uid: string, goal: Omit<Goal, 'id'>) => {
    const saved = localStorage.getItem(`bonusee-goals-${uid}`);
    const goals = saved ? JSON.parse(saved) : [];
    const newGoal = { ...goal, id: crypto.randomUUID(), userId: uid };
    const updated = [newGoal, ...goals];
    localStorage.setItem(`bonusee-goals-${uid}`, JSON.stringify(updated));
    return newGoal;
  },

  deleteUserData: (uid: string) => {
      localStorage.removeItem(`bonusee-goals-${uid}`);
      localStorage.removeItem('bonusee-user');
  }
};

// --- AUTH FUNCTIONS ---

const mapUser = (firebaseUser: any): UserProfile => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    isPremium: false // Default to free
  };
};

export const signInWithGoogle = async (): Promise<UserProfile | null> => {
  if (USE_REAL_FIREBASE) {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return mapUser(result.user);
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    // Mock Login
    const mockUser: UserProfile = {
      uid: 'mock-user-google',
      email: 'demo@bonusee.app',
      displayName: 'Demo User',
      photoURL: null,
      isPremium: false
    };
    localStorage.setItem('bonusee-user', JSON.stringify(mockUser));
    return mockUser;
  }
};

export const signInWithApple = async (): Promise<UserProfile | null> => {
  if (USE_REAL_FIREBASE) {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const result = await signInWithPopup(auth, provider);
      return mapUser(result.user);
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    // Mock Login
    const mockUser: UserProfile = {
      uid: 'mock-user-apple',
      email: 'user@icloud.com',
      displayName: 'Apple User',
      photoURL: null,
      isPremium: false
    };
    localStorage.setItem('bonusee-user', JSON.stringify(mockUser));
    return mockUser;
  }
};

export const registerUser = async (email: string, password: string, name: string): Promise<UserProfile> => {
  if (USE_REAL_FIREBASE) {
    // 1. Create User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Update Profile Name
    await updateProfile(user, { displayName: name });
    
    // 3. Send Verification Email (Security Best Practice)
    try {
      await sendEmailVerification(user);
      console.log("Verification email sent");
    } catch (e) {
      console.warn("Failed to send verification email", e);
    }

    return mapUser(user);
  } else {
    // Mock Registration
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newUser: UserProfile = {
      uid: 'mock-user-' + Date.now(),
      email: email,
      displayName: name,
      photoURL: null,
      isPremium: false
    };
    
    // In a real mock scenario, we'd store the password, but here we just store the session
    localStorage.setItem('bonusee-user', JSON.stringify(newUser));
    
    // Store "registered" users so login works for this specific email in mock mode
    const usersDB = JSON.parse(localStorage.getItem('bonusee-users-db') || '{}');
    usersDB[email] = { ...newUser, password }; // storing password in plain text ONLY for local mock dev
    localStorage.setItem('bonusee-users-db', JSON.stringify(usersDB));

    console.log(`[MOCK] Email sent to ${email}: "Welcome to Bonusee, ${name}! Please verify your account."`);
    
    return newUser;
  }
};

export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
  if (USE_REAL_FIREBASE) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapUser(userCredential.user);
  } else {
    // Mock Login
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const usersDB = JSON.parse(localStorage.getItem('bonusee-users-db') || '{}');
    const userRecord = usersDB[email];

    if (userRecord && userRecord.password === password) {
      const { password, ...userProfile } = userRecord;
      localStorage.setItem('bonusee-user', JSON.stringify(userProfile));
      return userProfile;
    } else {
       // If exact match not found in mock DB, throw error unless it's a specific test case
       throw new Error("Invalid email or password (Mock Mode: did you Sign Up first?)");
    }
  }
};

export const authStateListener = (callback: (user: UserProfile | null) => void) => {
  if (USE_REAL_FIREBASE) {
    return onAuthStateChanged(auth, (user: any) => {
      callback(user ? mapUser(user) : null);
    });
  } else {
    // Check local storage for mock session
    const saved = localStorage.getItem('bonusee-user');
    if (saved) callback(JSON.parse(saved));
    else callback(null);
    return () => {};
  }
};

export const logoutUser = async () => {
  if (USE_REAL_FIREBASE) {
    await signOut(auth);
  } else {
    localStorage.removeItem('bonusee-user');
    window.location.reload(); // Force reload to clear state in mock mode
  }
};

export const deleteUserAccount = async (uid: string) => {
    if (USE_REAL_FIREBASE) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No user logged in");
            
            // 1. Delete Data
            await RealService.deleteUserData(uid);
            
            // 2. Delete User (Authentication)
            await deleteUser(user);
        } catch (e) {
            console.error("Error deleting account:", e);
            throw e;
        }
    } else {
        // Mock Delete
        MockService.deleteUserData(uid);
        window.location.reload();
    }
};

// --- EXPORTED DB INTERFACE ---

export const dbService = {
  isReal: USE_REAL_FIREBASE,
  subscribe: (uid: string, cb: (g: Goal[]) => void) => 
    USE_REAL_FIREBASE ? RealService.subscribeToGoals(uid, cb) : MockService.subscribeToGoals(uid, cb),
    
  add: async (uid: string, goal: Omit<Goal, 'id'>) => {
    if(USE_REAL_FIREBASE) return RealService.addGoal(uid, goal);
    return MockService.addGoal(uid, goal);
  },
  
  update: async (uid: string, goal: Goal) => {
    if(USE_REAL_FIREBASE) return RealService.updateGoal(uid, goal);
    // Mock handles via local state save
  },

  delete: async (uid: string, id: string) => {
    if(USE_REAL_FIREBASE) return RealService.deleteGoal(uid, id);
  },
  
  saveLocal: (uid: string, goals: Goal[]) => {
     if (!USE_REAL_FIREBASE) MockService.saveGoals(uid, goals);
     else RealService.batchUpdateGoals(uid, goals);
  }
};
