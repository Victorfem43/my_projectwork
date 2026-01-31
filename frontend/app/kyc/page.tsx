'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Shield, CheckCircle, Clock, XCircle, ArrowLeft, FileUp } from 'lucide-react';

export default function KYCPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    idType: '',
    idNumber: '',
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data.user);
      setFormData({
        fullName: res.data.user.kycFullName || '',
        dateOfBirth: res.data.user.kycDateOfBirth
          ? new Date(res.data.user.kycDateOfBirth).toISOString().split('T')[0]
          : '',
        address: res.data.user.kycAddress || '',
        idType: res.data.user.kycIdType || '',
        idNumber: res.data.user.kycIdNumber || '',
      });
    } catch (error) {
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('dateOfBirth', formData.dateOfBirth);
      payload.append('address', formData.address);
      payload.append('idType', formData.idType);
      payload.append('idNumber', formData.idNumber);
      if (documentFile) {
        payload.append('document', documentFile);
      }

      await api.post('/users/kyc', payload);
      toast.success('KYC submitted successfully. We will review your verification shortly.');
      setDocumentFile(null);
      fetchUser();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      const errors = error.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        const errMap: Record<string, string> = {};
        errors.forEach((err: { param?: string; msg?: string }) => {
          if (err.param) errMap[err.param] = err.msg || 'Invalid';
        });
        setFormErrors(errMap);
        toast.error(errors[0]?.msg || 'Please fix the errors below');
      } else {
        toast.error(msg || 'Failed to submit KYC');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <Navbar />
          <div className="pt-24 pb-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isApproved = user?.kycStatus === 'approved';
  const isPending = user?.kycStatus === 'pending' && !!user?.kycSubmittedAt;
  const canSubmit = !isApproved;

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Settings
            </Link>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Identity Verification (KYC)</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Verify your identity to access full platform features
                </p>
              </div>
            </div>

            {/* Status card */}
            <div className="card p-6 mb-8">
              <div className="flex items-center gap-3 mb-2">
                {isApproved && <CheckCircle className="w-6 h-6 text-green-400" />}
                {isPending && <Clock className="w-6 h-6 text-yellow-400" />}
                {!isApproved && !isPending && <XCircle className="w-6 h-6 text-gray-400" />}
                <h2 className="text-xl font-bold text-white">
                  {isApproved && 'Verified'}
                  {isPending && 'Under Review'}
                  {!isApproved && !isPending && 'Not Verified'}
                </h2>
              </div>
              <p className="text-gray-400 text-sm">
                {isApproved && 'Your identity has been verified. You have full access to the platform.'}
                {isPending && (
                  <>Submitted on {new Date(user.kycSubmittedAt).toLocaleDateString()}. We will notify you once reviewed.</>
                )}
                {!isApproved && !isPending && 'Complete the form below to submit your verification.'}
              </p>
            </div>

            {/* KYC form - show when not approved */}
            {canSubmit && (
              <div className="card p-6 sm:p-8">
                <h2 className="text-lg font-bold text-white mb-6">Verification Details</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full legal name</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="As on your ID"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                    {formErrors.fullName && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of birth</label>
                    <input
                      type="date"
                      required
                      className="input-field"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                    {formErrors.dateOfBirth && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.dateOfBirth}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="Full residential address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    {formErrors.address && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.address}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">ID type</label>
                    <select
                      required
                      className="input-field"
                      value={formData.idType}
                      onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                    >
                      <option value="">Select ID type</option>
                      <option value="Passport">Passport</option>
                      <option value="National ID">National ID</option>
                      <option value="Driver's License">Driver&apos;s License</option>
                    </select>
                    {formErrors.idType && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.idType}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">ID number</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="ID or document number"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    />
                    {formErrors.idNumber && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.idNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ID document (optional)
                    </label>
                    <p className="text-gray-400 text-xs mb-2">
                      Upload a clear photo or PDF of your ID. Max 5MB. JPEG, PNG, GIF, WebP or PDF.
                    </p>
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <FileUp className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm truncate">
                        {documentFile ? documentFile.name : 'Choose file'}
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/jpeg,image/png,image/gif,image/webp,application/pdf"
                        className="hidden"
                        onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {documentFile && documentFile.size > 5 * 1024 * 1024 && (
                      <p className="text-red-400 text-sm mt-1">File must be 5MB or less</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || (!!documentFile && documentFile.size > 5 * 1024 * 1024)}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {submitting ? 'Submitting...' : isPending ? 'Resubmit verification' : 'Submit for verification'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
