import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  FileCheck, 
  Image as ImageIcon, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const PaymentView: React.FC = () => {
  const { 
    selectedPackage, 
    registrationDraft, 
    paymentSubmitted, 
    submitPaymentProof, 
    handleBackFromPayment 
  } = useApp();

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [txId, setTxId] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const UPI_ID = '8279641186@ybl';

  // Listen for browser back button to navigate cleanly back to packages page
  useEffect(() => {
    const handlePopState = () => {
      handleBackFromPayment();
    };
    window.history.pushState({ page: 'payment' }, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleBackFromPayment]);

  if (!selectedPackage || !registrationDraft) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <div className="text-center">
          <p className="text-slate-500 mb-4">No active payment draft found.</p>
          <button
            onClick={handleBackFromPayment}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700"
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size is larger than 10MB. Please upload a smaller image.');
        return;
      }
      setUploadError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Pre-generate sample receipt for quick testing if user doesn't have a real file
  const handleUseSampleReceipt = () => {
    setUploadError('');
    setScreenshotPreview('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    setTxId(`UPI${Date.now().toString().slice(-8)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotPreview) {
      setUploadError('Please select or upload your payment screenshot proof.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitPaymentProof(screenshotPreview, txId.trim() || undefined);
      setIsSubmitting(false);
    }, 600);
  };

  // UPI deep link
  const upiDeepLink = `upi://pay?pa=${UPI_ID}&pn=FutureSet&am=${selectedPackage.price}&cu=INR&tn=FutureSet_${selectedPackage.name}_Enrollment`;

  return (
    <div id="payment-page" className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        
        {/* Device/Browser Back Button trigger */}
        <div className="mb-6 flex items-center justify-between">
          <button
            id="btn-payment-back"
            onClick={handleBackFromPayment}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Packages</span>
          </button>
          
          <span className="text-xs font-bold text-slate-500">
            Step 2 of 2 • Official Payment
          </span>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xl">
          
          {/* Package Photo Banner */}
          {selectedPackage.imageUrl && (
            <div className="relative w-full h-28 overflow-hidden bg-slate-100">
              <img
                src={selectedPackage.imageUrl}
                alt={`${selectedPackage.name} Package`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent" />
              <div className="absolute inset-x-4 bottom-3 flex items-center justify-between z-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                    Enrolling In
                  </span>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">
                    {selectedPackage.name} Package
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-xl bg-white/95 border border-blue-200 text-right backdrop-blur-md shadow-sm">
                  <span className="text-xs font-black text-blue-700">
                    ₹{selectedPackage.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Top Payment Info */}
            <div className="text-center pb-6 border-b border-slate-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase mb-2">
                Payment Gateway
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Pay ₹{selectedPackage.price.toLocaleString('en-IN')} for {selectedPackage.name} Package
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Account registered for: <strong className="text-slate-800">{registrationDraft.name}</strong> ({registrationDraft.email})
              </p>
            </div>

          {/* Success Banner if submitted — EXACT text as mandated: */}
          {paymentSubmitted ? (
            <div 
              id="payment-success-notification" 
              className="mt-6 p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center animate-in fade-in zoom-in-95 duration-300 shadow-sm"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <FileCheck className="w-8 h-8" />
              </div>
              
              {/* EXACT required text */}
              <h3 className="text-lg sm:text-xl font-extrabold text-emerald-800 leading-snug">
                Your payment is successful. Please wait for id activation. 🙏
              </h3>

              <div className="mt-4 pt-4 border-t border-emerald-200 text-xs text-emerald-700 space-y-1">
                <p>Registration Name: <span className="font-bold text-slate-900">{registrationDraft.name}</span></p>
                <p>Registered Gmail: <span className="font-bold text-slate-900">{registrationDraft.email}</span></p>
                <p className="text-slate-500 text-[11px] mt-2">
                  Our admin team is verifying your payment screenshot. You can press the Back button anytime to return to the packages page.
                </p>
              </div>

              {/* Explicit Back button inside note to respect navigation flow */}
              <button
                id="btn-return-packages"
                onClick={handleBackFromPayment}
                className="mt-5 w-full py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Packages</span>
              </button>
            </div>
          ) : (
            /* Active Payment Steps: UPI ID, QR code, Screenshot upload, Submit */
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              
              {/* 1. UPI ID Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Official UPI ID
                </span>
                <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="font-mono text-base sm:text-lg font-black text-blue-700 tracking-wide select-all">
                    {UPI_ID}
                  </span>
                  <button
                    type="button"
                    id="btn-copy-upi"
                    onClick={copyToClipboard}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95 border border-blue-200"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy UPI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. QR Code Display */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Scan QR Code with any UPI App (GPay / PhonePe / Paytm)
                </span>

                <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
                  <QRCodeSVG
                    value={upiDeepLink}
                    size={190}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <span>Amount to Pay:</span>
                  <strong className="text-blue-700 text-sm">₹{selectedPackage.price.toLocaleString('en-IN')}</strong>
                </div>

                {/* Direct Pay UPI Link Button for mobile */}
                <a
                  href={upiDeepLink}
                  id="btn-open-upi-app"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span>Click to Pay Directly on UPI App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 3. Payment Screenshot Upload Option */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Payment Screenshot Upload <span className="text-blue-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseSampleReceipt}
                    className="text-[11px] text-blue-600 hover:underline font-bold"
                  >
                    Quick Test Receipt
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="payment-screenshot-input"
                />

                {screenshotPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-white p-3 flex items-center gap-4 shadow-sm">
                    <img
                      src={screenshotPreview}
                      alt="Payment Slip Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                        <Check className="w-4 h-4" />
                        <span>Screenshot Attached</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">Ready for verification</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-700 hover:bg-slate-200 border border-slate-300"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-white hover:bg-blue-50/40"
                  >
                    <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">
                      Click to upload payment screenshot
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supports JPG, PNG, WEBP (Max 10MB)
                    </p>
                  </div>
                )}

                {uploadError && (
                  <p className="text-rose-600 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>

              {/* Optional UTR / Reference ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  UPI Transaction ID / Ref No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 408279182741"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                />
              </div>

              {/* 4. Submit Button */}
              <div>
                <button
                  id="btn-submit-payment"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Payment...</span>
                  ) : (
                    <>
                      <span>Submit Payment Proof</span>
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-500 mt-3">
                  After submission, your ID will be verified and activated by our team.
                </p>
              </div>

            </form>
          )}

          </div>
        </div>
      </div>
    </div>
  );
};
