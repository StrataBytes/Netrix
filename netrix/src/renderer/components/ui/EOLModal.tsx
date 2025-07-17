import Button from './Button';
import { Icons } from '../icons';
import './EOLModal.css';

interface EOLModalProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
}

export default function EOLModal({
  isOpen,
  content,
  onClose
}: EOLModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content eol-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Icons.alert size={24} />
            <h2>End of Life Notice</h2>
          </div>
        </div>
        
        <div className="modal-body">
          <div className="eol-content">
            <div className="eol-icon">
              <Icons.alert size={48} />
            </div>
            
            <div className="eol-message">
              <p>{content}</p>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <Button
            variant="primary"
            onClick={onClose}
            className="eol-acknowledge-button"
          >
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
}
