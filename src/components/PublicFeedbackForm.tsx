@@ .. @@
 import React, { useState } from 'react';
 import { ClientFeedback, SatisfactionLevel } from '../types';
 import { StarIcon } from '../constants';
+import DatabaseService from '../services/database';

 interface PublicFeedbackFormProps {
@@ .. @@
     const handleSubmit = (e: React.FormEvent) => {
         e.preventDefault();
         if (formState.rating === 0) {
             alert('Mohon berikan peringkat bintang.');
             return;
         }
         setIsSubmitting(true);

-        const newFeedback: ClientFeedback = {
-            id: `FB-PUB-${Date.now()}`,
+        const feedbackData = {
             clientName: formState.clientName,
             rating: formState.rating,
             satisfaction: getSatisfactionFromRating(formState.rating),
             feedback: formState.feedback,
             date: new Date().toISOString(),
         };

-        setTimeout(() => {
-            setClientFeedback(prev => [newFeedback, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
+        DatabaseService.createClientFeedback(feedbackData).then(() => {
             setIsSubmitting(false);
             setIsSubmitted(true);
-        }, 1000);
+        }).catch((error) => {
+            console.error('Error submitting feedback:', error);
+            setIsSubmitting(false);
+            alert('Gagal mengirim masukan. Silakan coba lagi.');
+        });
     };