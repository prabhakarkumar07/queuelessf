import { useEffect, useState, useRef } from 'react';
import { useDashboard } from '../components/layout/DashboardLayout';
import { shopApi } from '../lib/api';
import { QRCodeSVG } from 'qrcode.react';

export default function QrPoster() {
  const { activeShop } = useDashboard();
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeShop?.id) return;
    setLoading(true);
    setError(false);
    
    // We expect the backend to return an SVG string.
    shopApi.getQrPoster(activeShop.id)
      .then((res) => {
        // If the backend returns raw SVG string or an object with it
        const content = typeof res.data === 'string' ? res.data : (res.data?.svg || res.data?.qrSvg);
        if (content) {
          setSvgContent(content);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [activeShop?.id]);

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;
    
    const printWindow = window.open('', '', 'width=800,height=900');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Poster</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: white; }
            .poster { text-align: center; max-width: 500px; padding: 40px; }
            h1 { font-size: 36px; margin-bottom: 10px; color: #0f172a; }
            p { font-size: 18px; color: #64748b; margin-bottom: 40px; }
            .qr-container { margin: 0 auto; display: flex; justify-content: center; }
            .qr-container svg { width: 300px; height: 300px; }
          </style>
        </head>
        <body>
          <div class="poster">
            ${printContents}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 250);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const publicUrl = `${window.location.origin}/s/${activeShop?.slug || activeShop?.id}`;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">QR Poster</h1>
          <p className="text-sm font-medium text-slate-500">Print this poster for walk-in customers to join your queue.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="ql-btn-primary flex items-center gap-2"
          disabled={loading}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Poster
        </button>
      </div>

      <div className="ql-panel overflow-hidden bg-slate-50 p-0">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="ql-spinner" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-16 sm:px-12">
            <div 
              ref={printRef}
              className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-100"
            >
              <h1 className="mb-2 text-2xl font-black text-slate-900">{activeShop?.name}</h1>
              <p className="mb-8 text-slate-500">Scan to join the live queue</p>
              
              <div className="qr-container flex justify-center">
                {error || !svgContent ? (
                  /* Fallback to client-side generation if API fails */
                  <QRCodeSVG 
                    value={publicUrl}
                    size={240}
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: svgContent }} />
                )}
              </div>
              
              <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Powered by QueueLess</p>
            </div>
            
            {error && (
              <p className="mt-6 text-sm text-amber-600">
                Note: Backend poster generator failed. Displaying fallback QR code instead.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
