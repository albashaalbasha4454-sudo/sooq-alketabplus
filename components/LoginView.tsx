import React from 'react';
import { BookOpen, Search, ShieldCheck, Sparkles } from 'lucide-react';

type Props = { onLogin: () => Promise<void> };

const features = [
  { icon: BookOpen, title: 'مكتبة وكتالوج كتب', text: 'عرض الكتب والخدمات والطلبات من واجهة عربية واضحة.' },
  { icon: Search, title: 'بحث وتنظيم', text: 'مدخل موحد للوصول إلى الكتب والطلبات ولوحة الإدارة.' },
  { icon: ShieldCheck, title: 'إدارة آمنة', text: 'ت