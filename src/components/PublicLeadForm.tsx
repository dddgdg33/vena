@@ .. @@
 import React, { useState, useMemo } from 'react';
 import { Lead, LeadStatus, ContactChannel, Profile } from '../types';
+import DatabaseService from '../services/database';

 interface PublicLeadFormProps {
@@ .. @@
     const handleSubmit = (e: React.FormEvent) => {
         e.preventDefault();
         setIsSubmitting(true);

-        const notes = `Jenis Acara: ${formState.eventType}\nTanggal Acara: ${new Date(formState.eventDate).toLocaleDateString('id-ID')}\nLokasi Acara: ${formState.eventLocation}`;

-        const newLead: Lead = {
-            id: `LEAD-FORM-${Date.now()}`,
+        const leadData = {
             name: formState.name,
-            contactChannel: ContactChannel.WEBSITE, // Since it's from a web form
+            contactChannel: ContactChannel.WEBSITE,
             location: formState.eventLocation,
-            status: LeadStatus.DISCUSSION, // Automatically placed in "Sedang Diskusi"
+            status: LeadStatus.DISCUSSION,
             date: new Date().toISOString().split('T')[0],
-            notes: notes
+            notes: `Jenis Acara: ${formState.eventType}\nTanggal Acara: ${new Date(formState.eventDate).toLocaleDateString('id-ID')}\nLokasi Acara: ${formState.eventLocation}`
         };
         
-        // Simulate API call
-        setTimeout(() => {
-            setLeads(prev => [newLead, ...prev]);
+        DatabaseService.createLead(leadData).then(() => {
             setIsSubmitting(false);
             setIsSubmitted(true);
-        }, 1000);
+        }).catch((error) => {
+            console.error('Error submitting lead:', error);
+            setIsSubmitting(false);
+            alert('Gagal mengirim informasi. Silakan coba lagi.');
+        });
     };