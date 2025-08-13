@@ .. @@
 import React, { useState } from 'react';
-import { User } from '../types';
+import { User } from '../types';
+import { useSupabaseContext } from './SupabaseProvider';

 const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
@@ .. @@
 );


 interface LoginProps {
-    onLoginSuccess: (user: User) => void;
+    onLoginSuccess: (email: string, password: string) => Promise<boolean>;
     users: User[];
 }

@@ .. @@
     const [error, setError] = useState('');
     const [isLoading, setIsLoading] = useState(false);

-    const handleSubmit = (e: React.FormEvent) => {
+    const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();
         setError('');
         setIsLoading(true);

-        // Simulate API call
-        setTimeout(() => {
-            const user = users.find(u => u.email === email && u.password === password);
-            if (user) {
-                onLoginSuccess(user);
-            } else {
-                setError('Username atau kata sandi salah.');
-            }
-            setIsLoading(false);
-        }, 1000);
+        try {
+            const success = await onLoginSuccess(email, password);
+            if (!success) {
+                setError('Username atau kata sandi salah.');
+            }
+        } catch (err) {
+            setError('Terjadi kesalahan saat login.');
+        } finally {
+            setIsLoading(false);
+        }
     };