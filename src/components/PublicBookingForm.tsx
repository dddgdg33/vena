@@ .. @@
 import React, { useState, useMemo, useRef } from 'react';
 import { Client, Project, Package, AddOn, Transaction, Profile, Card, FinancialPocket, ClientStatus, PaymentStatus, TransactionType, PromoCode, Lead, LeadStatus, ContactChannel, ClientType } from '../types';
 import Modal from './Modal';
+import DatabaseService from '../services/database';

 interface PublicBookingFormProps {
@@ .. @@
     const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();
         setIsSubmitting(true);
         
-        const dpAmount = Number(formData.dp) || 0;
-        const selectedPackage = packages.find(p => p.id === formData.packageId);
-        if (!selectedPackage) {
-            alert('Silakan pilih paket.');
-            setIsSubmitting(false);
-            return;
-        }
-
-        const destinationCard = cards.find(c => c.id !== 'CARD_CASH') || cards[0];
-        if (!destinationCard) {
-            alert('Sistem pembayaran tidak dikonfigurasi. Hubungi vendor.');
-            setIsSubmitting(false);
-            return;
-        }
-        
-        let promoCodeAppliedId: string | undefined;
-        if (discountAmount > 0 && formData.promoCode) {
-            const promoCode = promoCodes.find(p => p.code === formData.promoCode.toUpperCase().trim());
-            if (promoCode) promoCodeAppliedId = promoCode.id;
-        }
-
-        let dpProofUrl = '';
-        if (paymentProof) {
-            try {
-                dpProofUrl = await new Promise((resolve, reject) => {
-                    const reader = new FileReader();
-                    reader.readAsDataURL(paymentProof);
-                    reader.onload = () => resolve(reader.result as string);
-                    reader.onerror = error => reject(error);
-                });
-            } catch (error) {
-                console.error("Error reading file:", error);
-                showNotification("Gagal memproses file bukti transfer.");
-                setIsSubmitting(false);
-                return;
+        try {
+            const dpAmount = Number(formData.dp) || 0;
+            const selectedPackage = packages.find(p => p.id === formData.packageId);
+            if (!selectedPackage) {
+                alert('Silakan pilih paket.');
+                return;
             }
-        }
 
-        const selectedAddOns = addOns.filter(addon => formData.selectedAddOnIds.includes(addon.id));
-        const remainingPayment = totalProject - dpAmount;
+            let dpProofUrl = '';
+            if (paymentProof) {
+                dpProofUrl = await new Promise((resolve, reject) => {
+                    const reader = new FileReader();
+                    reader.readAsDataURL(paymentProof);
+                    reader.onload = () => resolve(reader.result as string);
+                    reader.onerror = error => reject(error);
+                });
+            }
 
-        const newClientId = `CLI${Date.now()}`;
-        const newClient: Client = {
-            id: newClientId, name: formData.clientName, email: formData.email, phone: formData.phone, instagram: formData.instagram,
-            since: new Date().toISOString().split('T')[0], status: ClientStatus.ACTIVE, 
-            clientType: ClientType.DIRECT,
-            lastContact: new Date().toISOString(),
-            portalAccessId: crypto.randomUUID(),
-        };
+            const selectedAddOns = addOns.filter(addon => formData.selectedAddOnIds.includes(addon.id));
 
-        const newProject: Project = {
-            id: `PRJ${Date.now()}`, projectName: formData.projectName || `Acara ${formData.clientName}`, clientName: newClient.name, clientId: newClient.id,
-            projectType: formData.projectType, packageName: selectedPackage.name, packageId: selectedPackage.id, addOns: selectedAddOns,
-            date: formData.date, location: formData.location, progress: 0, status: 'Dikonfirmasi',
-            totalCost: totalProject, amountPaid: dpAmount,
-            paymentStatus: dpAmount > 0 ? (remainingPayment <= 0 ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR) : PaymentStatus.BELUM_BAYAR,
-            team: [], notes: `Referensi Pembayaran DP: ${formData.dpPaymentRef}`, promoCodeId: promoCodeAppliedId, discountAmount: discountAmount > 0 ? discountAmount : undefined,
-            dpProofUrl: dpProofUrl || undefined,
-        };
-        
-        const newLead: Lead = {
-            id: `LEAD-FORM-${Date.now()}`,
-            name: newClient.name,
-            contactChannel: ContactChannel.WEBSITE,
-            location: newProject.location,
-            status: LeadStatus.CONVERTED,
-            date: new Date().toISOString().split('T')[0],
-            notes: `Dikonversi secara otomatis dari formulir pemesanan publik. Proyek: ${newProject.projectName}. Klien ID: ${newClient.id}`
-        };
+            // Create client
+            const newClient = await DatabaseService.createClient({
+                name: formData.clientName,
+                email: formData.email,
+                phone: formData.phone,
+                instagram: formData.instagram || '',
+                since: new Date().toISOString().split('T')[0],
+                status: ClientStatus.ACTIVE,
+                clientType: ClientType.DIRECT,
+                lastContact: new Date().toISOString(),
+                portalAccessId: crypto.randomUUID(),
+            });
 
-        setClients(prev => [newClient, ...prev]);
-        setProjects(prev => [newProject, ...prev]);
-        setLeads(prev => [newLead, ...prev]);
+            // Create project
+            const newProject = await DatabaseService.createProject({
+                projectName: formData.projectName || `Acara ${formData.clientName}`,
+                clientName: newClient.name,
+                clientId: newClient.id,
+                projectType: formData.projectType,
+                packageName: selectedPackage.name,
+                packageId: selectedPackage.id,
+                addOns: selectedAddOns,
+                date: formData.date,
+                location: formData.location,
+                progress: 0,
+                status: 'Dikonfirmasi',
+                totalCost: totalProject,
+                amountPaid: dpAmount,
+                paymentStatus: dpAmount > 0 ? (totalProject - dpAmount <= 0 ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR) : PaymentStatus.BELUM_BAYAR,
+                team: [],
+                notes: `Referensi Pembayaran DP: ${formData.dpPaymentRef}`,
+                promoCodeId: discountAmount > 0 && formData.promoCode ? promoCodes.find(p => p.code === formData.promoCode.toUpperCase().trim())?.id : undefined,
+                discountAmount: discountAmount > 0 ? discountAmount : undefined,
+                dpProofUrl: dpProofUrl || undefined,
+            });
 
-        if (promoCodeAppliedId) {
-            setPromoCodes(prev => prev.map(p => p.id === promoCodeAppliedId ? { ...p, usageCount: p.usageCount + 1 } : p));
-        }
+            // Create lead record
+            await DatabaseService.createLead({
+                name: newClient.name,
+                contactChannel: ContactChannel.WEBSITE,
+                location: newProject.location,
+                status: LeadStatus.CONVERTED,
+                date: new Date().toISOString().split('T')[0],
+                notes: `Dikonversi secara otomatis dari formulir pemesanan publik. Proyek: ${newProject.projectName}. Klien ID: ${newClient.id}`
+            });
 
-        if (dpAmount > 0) {
-            const newTransaction: Transaction = {
-                id: `TRN-DP-${newProject.id}`, date: new Date().toISOString().split('T')[0], description: `DP Proyek ${newProject.projectName}`,
-                amount: dpAmount, type: TransactionType.INCOME, projectId: newProject.id, category: 'DP Proyek',
-                method: 'Transfer Bank', pocketId: 'POC005', cardId: destinationCard.id,
-            };
-            setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
-            setCards(prev => prev.map(c => c.id === destinationCard.id ? { ...c, balance: c.balance + dpAmount } : c));
-            setPockets(prev => prev.map(p => p.id === 'POC005' ? { ...p, amount: p.amount + dpAmount } : p));
-        }
+            // Create transaction if DP is paid
+            if (dpAmount > 0) {
+                await DatabaseService.createTransaction({
+                    date: new Date().toISOString().split('T')[0],
+                    description: `DP Proyek ${newProject.projectName}`,
+                    amount: dpAmount,
+                    type: TransactionType.INCOME,
+                    projectId: newProject.id,
+                    category: 'DP Proyek',
+                    method: 'Transfer Bank',
+                    pocketId: 'POC005',
+                    cardId: cards.find(c => c.id !== 'CARD_CASH')?.id || cards[0]?.id,
+                });
+            }
 
-        setIsSubmitting(false);
-        setIsSubmitted(true);
-        showNotification('Pemesanan baru dari klien diterima!');
+            setIsSubmitted(true);
+            showNotification('Pemesanan baru dari klien diterima!');
+        } catch (error) {
+            console.error('Error submitting booking:', error);
+            showNotification('Gagal mengirim pemesanan. Silakan coba lagi.');
+        } finally {
+            setIsSubmitting(false);
+        }
     };