import {
  collection,
  doc,
  getDocs,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  Supplier,
  Customer,
  Item,
  Purchase,
  Sale,
  Delivery,
  ProcessingBatch,
  Laborer,
  LaborLog,
  PaymentVoucher,
  Expense,
  AuditLog,
  UserProfile
} from '../types';

// Connection validation
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    const testRef = doc(db, '_connection_test', 'status');
    await getDocFromServer(testRef);
    return true;
  } catch (error) {
    console.warn('Firestore connection check (may be offline/uninitialized):', error);
    return false;
  }
}

// Error Logger
function handleFirestoreErr(err: unknown, action: string, path: string) {
  console.error(`Firestore error during ${action} on path [${path}]:`, err);
}

// Subscribe helper with fallback
export function subscribeCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void,
  orderField: string = 'createdAt'
) {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, orderBy(orderField, 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        callback(items);
      },
      (error) => {
        handleFirestoreErr(error, 'onSnapshot', collectionName);
      }
    );
  } catch (err) {
    handleFirestoreErr(err, 'subscribeCollection', collectionName);
    return () => {};
  }
}

// Generic Firestore Save
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  docData: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docData.id);
    await setDoc(docRef, {
      ...docData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreErr(err, 'saveDocument', `${collectionName}/${docData.id}`);
    throw err;
  }
}

// Generic Firestore Delete
export async function removeDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreErr(err, 'removeDocument', `${collectionName}/${id}`);
    throw err;
  }
}
