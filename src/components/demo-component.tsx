import React, { useState } from 'react';

interface DemoComponentProps {
  title?: string;
  description?: string;
}

const DemoComponent: React.FC<DemoComponentProps> = ({ 
  title = "デモコンポーネント", 
  description = "これはデモ用のコンポーネントです。" 
}) => {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  const handleToggle = () => {
    setIsActive(prev => !prev);
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      margin: '10px',
      backgroundColor: isActive ? '#f0f8ff' : '#f9f9f9'
    }}>
      <h3 style={{ color: '#333', marginBottom: '10px' }}>{title}</h3>
      <p style={{ color: '#666', marginBottom: '15px' }}>{description}</p>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>カウンター:</strong> {count}
        <button 
          onClick={handleIncrement}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          +1
        </button>
      </div>
      
      <div>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={isActive}
            onChange={handleToggle}
            style={{ marginRight: '8px' }}
          />
          アクティブモード
        </label>
      </div>
      
      {isActive && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724'
        }}>
          ✅ アクティブモードが有効です！
        </div>
      )}
    </div>
  );
};

export default DemoComponent;