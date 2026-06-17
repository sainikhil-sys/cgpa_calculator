"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  college: string;
  rollNumber: string;
  branch: string;
  academicYear: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string, 
    password: string, 
    fullName: string, 
    collegeName: string, 
    rollNumber: string, 
    branch: string, 
    academicYear: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Educational email domains check (.edu, .edu.in, .ac.in)
export const isValidCollegeEmail = (email: string): boolean => {
  const emailLower = email.toLowerCase().trim();
  // Validates if it ends with .edu, .edu.in, or .ac.in
  return (
    emailLower.endsWith(".edu") ||
    emailLower.endsWith(".edu.in") ||
    emailLower.endsWith(".ac.in")
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to load profile from Firestore -> LocalStorage fallback -> Default
  const fetchProfile = async (uid: string, email: string): Promise<UserProfile> => {
    let profileData: Partial<UserProfile> = {};

    // 1. Try Firestore
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        profileData = docSnap.data() as UserProfile;
      }
    } catch (err) {
      console.warn("Firestore profile fetch failed, using fallback:", err);
    }

    // 2. Try LocalStorage
    if (!profileData.name) {
      try {
        const local = localStorage.getItem(`gf_profile_${uid}`);
        if (local) {
          profileData = JSON.parse(local);
        }
      } catch (err) {
        console.error("Local storage read failed:", err);
      }
    }

    // 3. Fallback to defaults (syncing with what the app had or default user info)
    const finalProfile: UserProfile = {
      uid,
      email,
      name: profileData.name || "Academic Hero",
      college: profileData.college || "National Institute of Technology",
      rollNumber: profileData.rollNumber || "20CSE1000",
      branch: profileData.branch || "Computer Science",
      academicYear: profileData.academicYear || "2023 - 2027",
      photoURL: profileData.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`
    };

    // Keep localStorage in sync
    try {
      localStorage.setItem(`gf_profile_${uid}`, JSON.stringify(finalProfile));
      // Also sync back to global student info so calculators can run immediately
      localStorage.setItem("gf_student_info", JSON.stringify({
        name: finalProfile.name,
        rollNumber: finalProfile.rollNumber,
        branch: finalProfile.branch,
        college: finalProfile.college,
        academicYear: finalProfile.academicYear
      }));
    } catch (e) {
      console.error(e);
    }

    return finalProfile;
  };

  // Helper to save profile to Firestore and LocalStorage
  const saveProfile = async (uid: string, finalProfile: UserProfile) => {
    // 1. Save to LocalStorage first (instant)
    try {
      localStorage.setItem(`gf_profile_${uid}`, JSON.stringify(finalProfile));
      localStorage.setItem("gf_student_info", JSON.stringify({
        name: finalProfile.name,
        rollNumber: finalProfile.rollNumber,
        branch: finalProfile.branch,
        college: finalProfile.college,
        academicYear: finalProfile.academicYear
      }));
    } catch (err) {
      console.error("Failed to write profile to local storage:", err);
    }

    // 2. Save to Firestore
    try {
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, finalProfile, { merge: true });
    } catch (err) {
      console.warn("Firestore profile save failed:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        // Enforce educational email check on Google Auth users who bypass UI input checks
        if (!isValidCollegeEmail(currentUser.email || "")) {
          // Log out immediately if email is not edu/ac
          await signOut(auth);
          setUser(null);
          setProfile(null);
          setLoading(false);
          // Dispatch a custom event to notify components of blocked email
          window.dispatchEvent(new CustomEvent("auth-blocked-email"));
          return;
        }

        setUser(currentUser);
        const userProfile = await fetchProfile(currentUser.uid, currentUser.email || "");
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isValidCollegeEmail(email)) {
      throw new Error("Please use a valid college email address (.edu, .edu.in, or .ac.in).");
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (
    email: string, 
    password: string, 
    fullName: string, 
    collegeName: string, 
    rollNumber: string, 
    branch: string, 
    academicYear: string
  ) => {
    if (!isValidCollegeEmail(email)) {
      throw new Error("Please use a valid college email address (.edu, .edu.in, or .ac.in).");
    }
    
    // Create user in Firebase auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Set display name in Firebase Auth profile
    await updateProfile(userCredential.user, {
      displayName: fullName,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`
    });

    // Save detailed metadata
    const newProfile: UserProfile = {
      uid,
      email,
      name: fullName,
      college: collegeName,
      rollNumber,
      branch,
      academicYear,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`
    };

    await saveProfile(uid, newProfile);
    setProfile(newProfile);
    setUser(userCredential.user);
  };

  const signInWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const currentUser = userCredential.user;

    if (!isValidCollegeEmail(currentUser.email || "")) {
      await signOut(auth);
      throw new Error("Please use a valid college email address (.edu, .edu.in, or .ac.in). standard Gmail is blocked.");
    }

    // Trigger profile fetch/initialize
    const userProfile = await fetchProfile(currentUser.uid, currentUser.email || "");
    
    // If name is default or profile doesn't have details, populate from google provider
    if (userProfile.name === "Academic Hero" && currentUser.displayName) {
      userProfile.name = currentUser.displayName;
    }
    if (currentUser.photoURL) {
      userProfile.photoURL = currentUser.photoURL;
    }
    
    await saveProfile(currentUser.uid, userProfile);
    setProfile(userProfile);
    setUser(currentUser);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    if (!isValidCollegeEmail(email)) {
      throw new Error("Please enter a valid college email address (.edu, .edu.in, or .ac.in).");
    }
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (!user || !profile) throw new Error("No user authenticated");
    
    const updatedProfile: UserProfile = {
      ...profile,
      ...details
    };

    // If name changed, update Firebase Auth profile too
    if (details.name) {
      await updateProfile(user, { displayName: details.name });
    }
    // If photoURL changed, update Firebase Auth profile too
    if (details.photoURL) {
      await updateProfile(user, { photoURL: details.photoURL });
    }

    await saveProfile(user.uid, updatedProfile);
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      logOut,
      resetPassword,
      updateProfileDetails
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
