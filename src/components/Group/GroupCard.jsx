import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiUsers, FiCopy, FiSettings } from 'react-icons/fi';

export default function GroupCard({ group }) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`group-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="group-avatar">
        {group.name.charAt(0).toUpperCase()}
      </div>
      
      <div className="group-info">
        <h3>{group.name}</h3>
        <p>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</p>
      </div>
      
      {isHovered && (
        <div className="group-hover-content">
          <div className="invite-code">
            <span>Invite Code: {group.inviteCode}</span>
            <button 
              onClick={copyInviteCode}
              className="btn-copy"
              title="Copy to clipboard"
            >
              <FiCopy />
              {copied ? 'Copied!' : ''}
            </button>
          </div>
          
          <Link 
            to={`/group/${group.id}/bill`}
            className="btn-bill-split"
          >
            <FiDollarSign /> View Bill Split
          </Link>

          <Link 
            to={`/group/${group.id}/settings`}
            className="btn-settings"
          >
            <FiSettings /> Group Settings
          </Link>
        </div>
      )}
    </div>
  );
}