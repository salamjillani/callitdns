import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export const addDomain = async (userId, domainName) => {
  const domainData = {
    name: domainName.toLowerCase().trim(),
    userId,
    createdAt: serverTimestamp(),
    lastScanned: null,
    status: "active",
  };

  const docRef = await addDoc(collection(db, "domains"), domainData);

  return {
    id: docRef.id,
    ...domainData,
    createdAt: new Date().toISOString(),
  };
};

export const getUserDomains = async (userId) => {
  const q = query(
    collection(db, "domains"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt:
      doc.data().createdAt?.toDate?.()?.toISOString() ||
      new Date().toISOString(),
  }));
};

export const deleteDomain = async (domainId) => {
  await deleteDoc(doc(db, "domains", domainId));
};
