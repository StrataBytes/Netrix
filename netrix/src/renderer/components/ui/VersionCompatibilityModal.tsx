import Button from './Button';
import { Icons } from '../icons';
import type { PatcherInfo } from '../../types/api';
import './VersionCompatibilityModal.css';

interface VersionCompatibilityModalProps {
  isOpen: boolean;
  patcherInfo: PatcherInfo;
  onDownload: () => void;
  onContinueWithout: () => void;
  onCancel: () => void;
}

export default function VersionCompatibilityModal({
  isOpen,
  patcherInfo,
  onDownload,
  onContinueWithout,
  onCancel
}: VersionCompatibilityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content version-compatibility-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Icons.alert size={24} />
            <h2>Version Compatibility Issue</h2>
          </div>
        </div>
        
        <div className="modal-body">
          <div className="version-info">
            <div className="version-detail">
              <strong>Required Version:</strong> {patcherInfo.target}
            </div>
            <div className="version-detail">
              <strong>Type:</strong> {patcherInfo.type}
            </div>
          </div>
          
          <div className="message-container">
            <p className="compatibility-message">
              {patcherInfo.message}
            </p>
          </div>
        </div>
        
        <div className="modal-footer">
          <Button
            variant="primary"
            onClick={onDownload}
            className="download-button"
          >
            Download {patcherInfo.type}
          </Button>
          
          <Button
            variant="danger"
            onClick={onContinueWithout}
            className="continue-button"
          >
            Continue without
          </Button>
          
          <Button
            variant="ghost"
            onClick={onCancel}
            className="cancel-button"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
