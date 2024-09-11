import { createUserWithEmailAndPassword, getAuth, getRedirectResult, GoogleAuthProvider, signInWithPopup, signInWithRedirect, UserCredential } from "firebase/auth";
import firebaseApp, { auth } from "../../../config/firebase/firebase.config";
import { FirebaseError } from "firebase/app";

export async function RegisterUserWithEmailAndPassword(values: any) {
 // functions
 // Write to backend. 

 // Authenticate with Firebase

 // If Firebase Authentication fails, remove user from backend db. 
 try {
  await createUserWithEmailAndPassword(auth, values.email, values.password)
 } catch (error) {
  console.log(error)
 }
 return { 
  message: "Hello"
 }
}


export async function continueWithGoogle() {
 const provider = new GoogleAuthProvider();

 try {
  await signInWithPopup(auth, provider);
 } catch (error) {
  console.error('Error during Google sign-in:', error);
 }
}

export const signOut = async () => {
 try {
  await auth.signOut();
 } catch (error) {
  console.error("Error signing out:", (error as FirebaseError).message);
 }
};