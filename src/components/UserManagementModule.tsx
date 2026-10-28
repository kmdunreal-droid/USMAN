import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Lock, CheckCircle, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const UserManagementModule: React.FC = () => {
  const { t } = useLanguage();
  const { activeRole, switchDemoRole } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" />
          <span>یوزر پرمیشنز و سیکورٹی رولز (User Roles & Access Control)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          مالک (Owner)، منشی (Accountant)، اور ورکر (Employee) کے الگ الگ اختیارات کی ترتیب
        </p>
      </div>

      {/* Role Selector Demo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => switchDemoRole('owner')}
          className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 ${
            activeRole === 'owner'
              ? 'bg-amber-500/10 border-amber-500 text-slate-100 shadow-xl'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-amber-400 text-lg">مالک (Owner / Malik)</h3>
            {activeRole === 'owner' && (
              <span className="text-xs font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                فعال رول
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300">
            مکمل اختیارات: تمام ریکارڈز دیکھنا، ایڈٹ/حذف کرنا، نفع و نقصان رپورٹس، یوزر پرمیشنز، ڈیٹا بیک اپ و ریسٹور۔
          </p>
        </div>

        <div
          onClick={() => switchDemoRole('munshi')}
          className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 ${
            activeRole === 'munshi'
              ? 'bg-blue-500/10 border-blue-500 text-slate-100 shadow-xl'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-blue-400 text-lg">منشی (Accountant)</h3>
            {activeRole === 'munshi' && (
              <span className="text-xs font-bold bg-blue-500 text-slate-950 px-2 py-0.5 rounded">
                فعال رول
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300">
            حساب کتاب اختیارات: گاڑی وزن پرچیاں، کٹائی ریکوری اندراج، پارٹی کھاتہ، کیش بک، ادائیگی و وصولی واؤچر۔
          </p>
        </div>

        <div
          onClick={() => switchDemoRole('employee')}
          className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 ${
            activeRole === 'employee'
              ? 'bg-emerald-500/10 border-emerald-500 text-slate-100 shadow-xl'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-emerald-400 text-lg">ورکر (Gatekeeper)</h3>
            {activeRole === 'employee' && (
              <span className="text-xs font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                فعال رول
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300">
            گیٹ انچارج اختیارات: صرف گاڑی کاٹا وزن اندراج، روانگی چالان اندراج اور موجودہ اسٹاک معلومات۔
          </p>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm">
          پرمیشن میٹرکس (Permissions Matrix)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3 text-right">ماڈیول / فیچر</th>
                <th className="p-3 text-right text-amber-400">مالک (Owner)</th>
                <th className="p-3 text-right text-blue-400">منشی (Munshi)</th>
                <th className="p-3 text-right text-emerald-400">ورکر (Employee)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="p-3 font-bold text-slate-100">وزن پرچی کاٹنا (Weighment)</td>
                <td className="p-3 text-emerald-400 font-bold">ہاں</td>
                <td className="p-3 text-emerald-400 font-bold">ہاں</td>
                <td className="p-3 text-emerald-400 font-bold">ہاں</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-100">سکریپ کٹائی و میٹل ریکوری</td>
                <td className="p-3 text-emerald-400 font-bold">ہاں</td>
                <td className="p-3 text-emerald-400 font-bold">ہاں</td>
                <td className="p-3 text-rose-400 font-bold">نہیں</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-100">پارٹی کھاتہ و کیش بک</td>
                <td className="p-3 text-emerald-400 font-bold">ہاں</td>
                <td className="p-3 text-emerald-400 font-bold">ہاں</td>
                <td className="p-3 text-rose-400 font-bold">نہیں</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-100">نفع و نقصان رپورٹ (P&L)</td>
                <td className="p-3 text-emerald-400 font-bold">ہاں</td>
                <td className="p-3 text-emerald-400 font-bold">ہاں</td>
                <td className="p-3 text-rose-400 font-bold">نہیں</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-100">ڈیٹا بیس بئک اپ و آڈٹ لاگز</td>
                <td className="p-3 text-emerald-400 font-bold">ہاں</td>
                <td className="p-3 text-rose-400 font-bold">نہیں</td>
                <td className="p-3 text-rose-400 font-bold">نہیں</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
