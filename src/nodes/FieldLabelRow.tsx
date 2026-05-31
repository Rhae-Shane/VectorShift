import { FiHelpCircle } from 'react-icons/fi';
import { Icon } from '../components/Icon';

export interface FieldLabelRowProps {
  label: string;
  required?: boolean;
  badge?: string;
  showHelp?: boolean;
}

export const FieldLabelRow = ({
  label,
  required,
  badge,
  showHelp,
}: FieldLabelRowProps) => (
  <div className="vs-field__label-row">
    <div className="vs-field__label-group">
      <span
        className={`vs-field__label ${required ? 'vs-field__label--required' : ''}`}
      >
        {label}
      </span>
      {showHelp ? (
        <span className="vs-field__help" aria-hidden="true" title="Help">
          <Icon icon={FiHelpCircle} size={14} />
        </span>
      ) : null}
    </div>
    {badge ? <span className="vs-field__badge">{badge}</span> : null}
  </div>
);
