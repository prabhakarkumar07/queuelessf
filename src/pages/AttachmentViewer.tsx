import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { attachmentApi } from '../lib/api';

interface Attachment {
  id: string;
  fileUrl: string;
  description?: string;
  createdAt: string;
}

export default function AttachmentViewer() {
  const { entityId, entityType } = useParams<{ entityId: string; entityType: string }>();
  const navigate = useNavigate();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId || !entityType) return;
    attachmentApi
      .getByEntity(entityId, entityType)
      .then(({ data }: { data: Attachment[] }) => setAttachments(data))
      .catch(() => toast.error('Failed to load attachments'))
      .finally(() => setLoading(false));
  }, [entityId, entityType]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center ql-app-bg">
        <div className="ql-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen ql-app-bg">
      <div className="ql-page">
        <div className="ql-header">
          <div>
            <p className="ql-kicker">Files</p>
            <h1 className="ql-title">Attachments</h1>
            <p className="ql-subtitle">Documents and images linked to {entityType}.</p>
          </div>
          <button onClick={() => navigate(-1)} className="ql-btn-secondary">Back</button>
        </div>

        {attachments.length === 0 ? (
          <div className="ql-empty">
            <div>
              <p className="font-bold text-stone-950">No attachments found</p>
              <p className="mt-1">There are no uploaded files for this item.</p>
            </div>
          </div>
        ) : (
          <section className="ql-panel">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="ql-row flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  {/\.(png|jpe?g|gif|webp)$/i.test(attachment.fileUrl) ? (
                    <img src={attachment.fileUrl} alt={attachment.description ?? 'Attachment'} className="h-12 w-12 rounded-md border border-stone-200 object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-xs font-black text-stone-500">FILE</div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-stone-950">{attachment.description ?? 'Attachment'}</p>
                    <p className="text-xs text-stone-500">{new Date(attachment.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="ql-btn-secondary py-1.5 text-xs">Open</a>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
