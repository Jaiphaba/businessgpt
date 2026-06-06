import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// SAVE PLAN
export const saveBusinessPlan = async (prompt, plan) => {
  const docRef = await addDoc(collection(db, "businessPlans"), {
    prompt,
    plan,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// GET PLANS
export const getBusinessPlans = async () => {
  const q = query(
    collection(db, "businessPlans"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// DELETE PLAN
export const deleteBusinessPlan = async (id) => {
  await deleteDoc(doc(db, "businessPlans", id));
};