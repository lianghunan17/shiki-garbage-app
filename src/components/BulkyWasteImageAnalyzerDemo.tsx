import React, { useState } from 'react';
import BulkyWasteImageAnalyzer from './BulkyWasteImageAnalyzer';
import { AnalysisResult } from '../types';

interface BulkyWasteImageAnalyzerDemoProps {
  onItemIdentified?: (result: AnalysisResult) => void;
}

const BulkyWasteImageAnalyzerDemo: React.FC<BulkyWasteImageAnalyzerDemoProps> = ({ onItemIdentified }) => {
  const [demoResult, setDemoResult] = useState<AnalysisResult | null>(null);

  const handleItemIdentified = (result: AnalysisResult) => {
    setDemoResult(result);
    onItemIdentified?.(result);
  };

  return (
    <div style={{
      padding: '20px',
      border: '2px dashed #007bff',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa',
      margin: '20px 0'
    }}>
      <h3 style={{ color: '#007bff', marginBottom: '15px' }}>🧪 AI画像分析デモ</h3>
      
      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '6px',
        marginBottom: '15px'
      }}>
        <p style={{ margin: '0 0 10px 0', color: '#6c757d' }}>
          このデモでは、AI画像分析機能をテストできます。
        </p>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#6c757d' }}>
          <li>粗大ごみの画像をアップロード</li>
          <li>AIが自動で品目を識別</li>
          <li>ごみ分類を自動判定</li>
          <li>処分費用を自動計算</li>
        </ul>
      </div>

      <BulkyWasteImageAnalyzer onItemIdentified={handleItemIdentified} />

      {demoResult && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '6px'
        }}>
          <h4 style={{ color: '#155724', marginBottom: '10px' }}>✅ デモ結果</h4>
          <div style={{ color: '#155724' }}>
            <strong>識別品目:</strong> {demoResult.identifiedItem}<br/>
            <strong>信頼度:</strong> {demoResult.confidence.toFixed(1)}%<br/>
            <strong>処分費用:</strong> {demoResult.suggestedFee}円<br/>
            {demoResult.wasteCategory && (
              <>
                <strong>ごみ分類:</strong> <span style={{ color: '#fd7e14', fontWeight: 'bold' }}>{demoResult.wasteCategory}</span><br/>
              </>
            )}
            {demoResult.wasteCategoryConfidence && (
              <>
                <strong>分類信頼度:</strong> <span style={{ color: '#17a2b8' }}>{demoResult.wasteCategoryConfidence.toFixed(1)}%</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkyWasteImageAnalyzerDemo;