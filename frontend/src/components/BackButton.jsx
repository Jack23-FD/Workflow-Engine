import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to, label = 'Back' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button className="btn btn-ghost btn-sm" onClick={handleClick} style={{ paddingLeft: 0 }}>
      <ArrowLeft size={16} />
      {label}
    </button>
  );
};

export default BackButton;
