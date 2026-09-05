'use client';

import React, { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  Clock,
  ShieldCheck,
  AlertCircle,
  Building2,
  User,
  CheckCircle2,
  Mail,
  Phone,
  ArrowLeft,
  MessageSquare,
  HelpCircle,
  FileCheck2,
  Lock
} from 'lucide-react';

export default function PendingApprovalPage() {
  const [companyName, setCompanyName] = useState('PT Tokopedia Indonesia');
  const [nibNumber, setNibNumber] = useState('9120101928123');
  const [hrName, setHrName] = useState('Bambang Setyono');
  const [whatsapp, setWhatsapp] = useState('081298765432');

  useEffect(() => {
    // Read submitted details from localStorage if present
    const savedCompany = localStorage.getItem('pendingCompanyName');
    const savedNib = localStorage.getItem('pendingNibNumber');
    const savedHr = localStorage.getItem('pendingHrName');
    const savedWa = localStorage.getItem('pendingWhatsapp');

    if (savedCompany) setCompanyName(savedCompany);
      </main>

      <Footer />

    </div>
  );
}
