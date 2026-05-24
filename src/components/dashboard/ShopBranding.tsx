import { useRef, useState, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { ImageIcon, Upload, Trash2, ExternalLink } from 'lucide-react';
import { mediaApi } from '../../lib/api';
import type { Shop } from '../../types';

interface Props {
  shop: Shop;
  onUpdate: (shop: Shop) => void;
}

/**
 * ShopBranding — logo upload/remove card.
 * Used inside shop settings to manage the shop's visual identity.
 */
export default function ShopBranding({ shop, onUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await mediaApi.uploadShopLogo(shop.id, file);
      onUpdate({ ...shop, logoUrl: data.url });
      setPreview(null);
      toast.success('Shop logo updated');
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await mediaApi.removeShopLogo(shop.id);
      onUpdate({ ...shop, logoUrl: null });
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Shop logo removed');
    } catch {
      toast.error('Failed to remove logo');
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview ?? shop.logoUrl;
  const publicUrl = shop.slug ? `/shop/${shop.slug}` : null;

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3">
        <h2 className="text-[14px] font-semibold text-slate-900">Shop Branding</h2>
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-700"
          >
            <ExternalLink size={12} />
            Public page
          </a>
        )}
      </div>

      <div className="p-5">
        {/* Shop URL slug */}
        {shop.slug && (
          <div className="mb-4 rounded-md bg-slate-50 border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Public URL</p>
            <p className="text-[13px] font-mono text-slate-800">
              {window.location.origin}/shop/
              <span className="font-bold text-slate-900">{shop.slug}</span>
            </p>
          </div>
        )}

        {/* Logo upload */}
        <div className="flex items-start gap-5">
          {/* Drop zone / preview */}
          <button
            type="button"
            id="logo-pick-btn"
            onClick={() => fileRef.current?.click()}
            className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:bg-slate-100"
          >
            {displayUrl ? (
              <img src={displayUrl} alt="Shop logo" className="h-full w-full object-contain p-1" />
            ) : (
              <ImageIcon size={28} className="text-slate-300" />
            )}
          </button>

          <input
            ref={fileRef}
            type="file"
            id="logo-file-input"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />

          <div className="flex flex-col gap-2 pt-1">
            <p className="text-[13px] font-medium text-slate-900">Shop logo</p>
            <p className="text-[12px] text-slate-500">
              Recommended: square image (1:1 ratio), min 400×400 px
            </p>
            <p className="text-[11px] text-slate-400">JPEG, PNG or WebP · max 5 MB</p>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <Upload size={12} />
                {preview ? 'Choose different' : 'Upload logo'}
              </button>

              {preview && (
                <button
                  type="button"
                  id="logo-save-btn"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50"
                >
                  {uploading ? 'Saving…' : 'Save logo'}
                </button>
              )}

              {shop.logoUrl && !preview && (
                <button
                  type="button"
                  id="logo-remove-btn"
                  onClick={handleRemove}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
