"use client";
import { initializeApp } from "firebase/app";
import { useState, useEffect, createContext } from "react";

import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  signOut,
} from "firebase/auth";
import { IUserContext } from "@/types/data";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
// };

// export const app = initializeApp(firebaseConfig);

export const UserContext = createContext({} as IUserContext);

export default function FirebaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const login = async () => {
    setLoading(true);
    const auth = getAuth();

    const userCred = await signInWithPopup(auth, new GoogleAuthProvider());
    setUser(userCred.user);
  };

  const logout = async () => {
    const auth = getAuth();

    await signOut(auth);
  };

  // useEffect(() => {
  //   // const auth = getAuth(app);
  //   // auth.onAuthStateChanged(async (user) => {
  //   //   setUser(user);
  //   //   setLoading(false);
  //   // });
  // }, []);

  // if (!user) {
  //   return <button onClick={login}>LOGIN</button>;
  // }

  // if (loading) {
  //   return <h1>Loading user</h1>;
  // }

  // if (user.email !== process.env.NEXT_PUBLIC_USER_EMAIL) {
  //   return (
  //     <>
  //       <h1>User not allowed</h1>
  //       <button onClick={logout}>LOGOUT</button>
  //     </>
  //   );
  // }

  return (
    <UserContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
