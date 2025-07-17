import Button from './Button';
import { Icons } from '../icons';
import type { PatcherInfo } from '../../types/api';
import './DownloadInstructionsModal.css';

interface DownloadInstructionsModalProps {
  isOpen: boolean;
  patcherInfo: PatcherInfo;
  onOkay: () => void;
}

export default function DownloadInstructionsModal({
  isOpen,
  patcherInfo,
  onOkay
}: DownloadInstructionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content download-instructions-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Icons.info size={24} />
            <h2>Download Instructions</h2>
          </div>
        </div>
        
        <div className="modal-body">
          <div className="instructions-content">
            <h3>Next Steps:</h3>
            <ol className="instructions-list">
              <li>The {patcherInfo.type} installer should now be downloading in your browser</li>
              <li>Once the download is complete, open the installer file and close your minecraft launcher if open</li>
              <li>Run the installer and select <strong>"Install client"</strong></li>
              <li>Complete the installation process</li>
              <li>Return to Netrix and attempt the modpack installation again</li>
            </ol>
            
            <div className="note-section">
              <div className="note-icon">
                <Icons.alert size={20} />
              </div>
              <div className="note-content">
                <p><strong>Note:</strong> Make sure to install {patcherInfo.type} for Minecraft version {patcherInfo.target} as the client installation.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <Button
            variant="primary"
            onClick={onOkay}
            className="okay-button"
          >
            Okay
          </Button>
        </div>
      </div>
    </div>
  );
}
