import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminStatus(user);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAdminStatus = async (user) => {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (adminDoc.exists() && adminDoc.data().isAdmin && adminDoc.data().status === 'active') {
        setIsAdmin(true);
        // Update localStorage with admin status
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminData', JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: adminDoc.data().name
        }));
      } else {
        setIsAdmin(false);
        // Clear localStorage if not admin
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminData');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminData');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mb-4"></div>
          <p className="text-slate-400">Verifying system access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect to admin login
    return <Navigate to="/callitdns-mgmt-portal-x9k2m" replace />;
  }

  return children;
}