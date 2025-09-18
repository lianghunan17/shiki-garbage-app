import React, { useState, useRef } from 'react';
import { bulkyWasteData } from '../data/bulkyWasteData';
import { classifyWasteByKeywords, wasteCategoryDescriptions } from '../data/wasteCategoryData';
import { WasteCategory } from '../types';

interface AnalysisResult {
  identifiedItem: string;
  confidence: number;
  suggestedFee: number;
  category: string;
  description: string;
  wasteCategory?: WasteCategory;
  wasteCategoryConfidence?: number;
}

interface BulkyWasteImageAnalyzerProps {
  onItemIdentified?: (result: AnalysisResult) => void;
}

const BulkyWasteImageAnalyzer: React.FC<BulkyWasteImageAnalyzerProps> = ({ onItemIdentified }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 画像ファイルをBase64に変換
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // data:image/jpeg;base64, の部分を除去してBase64文字列のみを取得
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Ollama Vision APIを使用して画像を分析（品目識別）
  const analyzeImageWithOllama = async (base64Image: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llava:7b',
          messages: [{
            role: 'user',
            content: `この画像に写っている物品を分析して、以下の粗大ごみ品目リストから最も適切なものを特定してください。\n\n利用可能な品目:\n${Object.keys(bulkyWasteData).join(', ')}\n\n画像を詳しく分析し、物品の種類、材質、サイズを考慮して、最も適切な品目名を1つだけ回答してください。回答は品目名のみでお願いします。`,
            images: [base64Image]
          }],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.message.content.trim();
    } catch (error) {
      console.error('Ollama API Error:', error);
      throw new Error('画像分析に失敗しました。Ollamaサーバーが起動していることを確認してください。');
    }
  };

  // Ollama Vision APIを使用してごみ分類を分析
  const analyzeWasteCategoryWithOllama = async (base64Image: string): Promise<{ category: WasteCategory; confidence: number }> => {
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llava:7b',
          messages: [{
            role: 'user',
            content: `この画像に写っている物品のごみ分類を判定してください。\n\n以下の5つの分類から最も適切なものを選択してください：\n1. 不燃ごみリサイクル資源\n2. 資源プラスチック\n3. 可燃ごみ\n4. 不燃ごみ\n5. 粗大ごみ\n\n物品の材質、サイズ、リサイクル可能性を考慮して判定してください。回答は分類名のみでお願いします。`,
            images: [base64Image]
          }],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const categoryText = result.message.content.trim();
      
      // 分類名を正規化
      const normalizedCategory = categoryText.replace(/[0-9.\s]/g, '').trim();
      
      // 有効な分類かチェック
      const validCategories: WasteCategory[] = [
        '不燃ごみリサイクル資源',
        '資源プラスチック', 
        '可燃ごみ',
        '不燃ごみ',
        '粗大ごみ'
      ];
      
      const matchedCategory = validCategories.find(cat => 
        normalizedCategory.includes(cat) || cat.includes(normalizedCategory)
      );
      
      return {
        category: matchedCategory || '粗大ごみ',
        confidence: matchedCategory ? 85 : 50
      };
    } catch (error) {
      console.error('Waste Category Analysis Error:', error);
      return {
        category: '粗大ごみ',
        confidence: 30
      };
    }
  };

  // 識別された品目名から料金情報を検索
  const findBestMatch = (identifiedText: string, wasteCategory?: WasteCategory, wasteCategoryConfidence?: number): AnalysisResult | null => {
    const lowerIdentified = identifiedText.toLowerCase();
    
    // 完全一致を最初に試行
    for (const [itemName, fee] of Object.entries(bulkyWasteData)) {
      if (itemName.toLowerCase() === lowerIdentified) {
        const estimatedWasteCategory = wasteCategory || classifyWasteByKeywords(itemName);
        return {
          identifiedItem: itemName,
          confidence: 100,
          suggestedFee: fee.fee,
          category: '家具・家電',
          description: `完全一致: ${itemName}`,
          wasteCategory: estimatedWasteCategory || undefined,
          wasteCategoryConfidence: wasteCategoryConfidence || (estimatedWasteCategory ? 80 : undefined)
        };
      }
    }

    // 部分一致を試行
    const partialMatches: Array<{ item: string; fee: number; score: number }> = [];
    
    for (const [itemName, fee] of Object.entries(bulkyWasteData)) {
      const lowerItemName = itemName.toLowerCase();
      
      // キーワードマッチング
      if (lowerItemName.includes(lowerIdentified) || lowerIdentified.includes(lowerItemName)) {
        const score = Math.max(
          lowerItemName.length - Math.abs(lowerItemName.length - lowerIdentified.length),
          lowerIdentified.length - Math.abs(lowerItemName.length - lowerIdentified.length)
        );
        partialMatches.push({ item: itemName, fee: fee.fee, score });
      }
    }

    // スコアでソートして最適なマッチを選択
    if (partialMatches.length > 0) {
      partialMatches.sort((a, b) => b.score - a.score);
      const bestMatch = partialMatches[0];
      const estimatedWasteCategory = wasteCategory || classifyWasteByKeywords(bestMatch.item);
      
      return {
        identifiedItem: bestMatch.item,
        confidence: Math.min(90, (bestMatch.score / Math.max(lowerIdentified.length, bestMatch.item.length)) * 100),
        suggestedFee: bestMatch.fee,
        category: '家具・家電',
        description: `部分一致: ${bestMatch.item}`,
        wasteCategory: estimatedWasteCategory || undefined,
        wasteCategoryConfidence: wasteCategoryConfidence || (estimatedWasteCategory ? 70 : undefined)
      };
    }

    return null;
  };

  // ファイル処理の共通ロジック
  const processFile = (file: File) => {
    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。');
      return;
    }

    // ファイルサイズチェック (10MB制限)
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズが大きすぎます。10MB以下の画像を選択してください。');
      return;
    }

    setSelectedImage(file);
    setError(null);
    setAnalysisResult(null);

    // プレビュー画像を生成
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 画像ファイル選択時の処理
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // ドラッグ&ドロップ処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  // 画像分析実行
  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('画像を選択してください。');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // 画像をBase64に変換
      const base64Image = await convertToBase64(selectedImage);
      
      // 品目識別とごみ分類を並行実行
      const [identifiedText, wasteCategoryResult] = await Promise.all([
        analyzeImageWithOllama(base64Image),
        analyzeWasteCategoryWithOllama(base64Image)
      ]);
      
      // 品目データから最適なマッチを検索（ごみ分類情報も含める）
      const result = findBestMatch(
        identifiedText, 
        wasteCategoryResult.category, 
        wasteCategoryResult.confidence
      );
      
      if (result) {
        setAnalysisResult(result);
        onItemIdentified?.(result);
      } else {
        // 品目が見つからない場合でも、ごみ分類情報は提供
        const fallbackResult: AnalysisResult = {
          identifiedItem: identifiedText,
          confidence: 50,
          suggestedFee: 0,
          category: '未分類',
          description: `識別された品目「${identifiedText}」は粗大ごみデータベースに見つかりませんでした。`,
          wasteCategory: wasteCategoryResult.category,
          wasteCategoryConfidence: wasteCategoryResult.confidence
        };
        setAnalysisResult(fallbackResult);
        onItemIdentified?.(fallbackResult);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '画像分析中にエラーが発生しました。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ファイル選択をリセット
  const resetSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bulky-waste-image-analyzer">
      <div className="analyzer-header">
        <h3>📸 粗大ごみ画像識別</h3>
        <p>写真をアップロードして、粗大ごみの品目と処分費用を自動で識別します</p>
      </div>

      {/* 画像選択エリア */}
      <div 
        className={`image-upload-area ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `3px dashed ${isDragOver ? '#007bff' : '#ddd'}`,
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center' as const,
          backgroundColor: isDragOver ? '#f8f9fa' : '#fafafa',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative' as const,
          marginBottom: '20px'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
          id="image-upload"
        />
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>画像をアップロード</h4>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
            ファイルをドラッグ&ドロップするか、ボタンをクリックして選択
          </p>
        </div>
        
        <label 
          htmlFor="image-upload" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold' as const,
            border: 'none',
            transition: 'background-color 0.3s ease',
            textDecoration: 'none'
          }}
          onMouseOver={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#0056b3';
          }}
          onMouseOut={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#007bff';
          }}
        >
          📁 ファイルを選択
        </label>
        
        {selectedImage && (
          <button 
            onClick={resetSelection} 
            style={{
              marginLeft: '10px',
              padding: '12px 24px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold' as const,
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#c82333';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#dc3545';
            }}
          >
            🗑️ リセット
          </button>
        )}
        
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#888' }}>
          対応形式: JPG, PNG, GIF | 最大サイズ: 10MB
        </div>
      </div>

      {/* 画像プレビュー */}
      {imagePreview && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '2px solid #e9ecef',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <img 
              src={imagePreview} 
              alt="選択された画像" 
              style={{ 
                maxWidth: '300px', 
                maxHeight: '300px', 
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }} 
            />
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            display: 'inline-block'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#495057' }}>
              <strong>📄 ファイル名:</strong> {selectedImage?.name}
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>
              <strong>📊 サイズ:</strong> {selectedImage ? (selectedImage.size / 1024 / 1024).toFixed(2) : 0} MB
            </p>
          </div>
        </div>
      )}

      {/* 分析ボタン */}
      {selectedImage && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button 
            onClick={analyzeImage} 
            disabled={isAnalyzing}
            style={{
              padding: '16px 32px',
              backgroundColor: isAnalyzing ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: 'bold' as const,
              transition: 'background-color 0.3s ease',
              minWidth: '200px'
            }}
            onMouseOver={(e) => {
              if (!isAnalyzing) {
                (e.target as HTMLElement).style.backgroundColor = '#218838';
              }
            }}
            onMouseOut={(e) => {
              if (!isAnalyzing) {
                (e.target as HTMLElement).style.backgroundColor = '#28a745';
              }
            }}
          >
            {isAnalyzing ? '🔍 分析中...' : '🤖 AI分析開始'}
          </button>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
      )}

      {/* 分析結果表示 */}
      {analysisResult && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#155724', fontSize: '18px' }}>🎯 分析結果</h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <strong style={{ color: '#495057' }}>識別品目:</strong> 
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>{analysisResult.identifiedItem}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <strong style={{ color: '#495057' }}>信頼度:</strong> 
              <span style={{ color: '#007bff', fontWeight: 'bold' }}>{analysisResult.confidence.toFixed(1)}%</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <strong style={{ color: '#495057' }}>処分費用:</strong> 
              <span style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '18px' }}>{analysisResult.suggestedFee}円</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <strong style={{ color: '#495057' }}>カテゴリ:</strong> 
              <span style={{ color: '#6f42c1' }}>{analysisResult.category}</span>
            </div>
            <div style={{
               padding: '8px 12px',
               backgroundColor: 'white',
               borderRadius: '6px',
               border: '1px solid #e9ecef'
             }}>
               <strong style={{ color: '#495057', display: 'block', marginBottom: '4px' }}>詳細:</strong> 
               <span style={{ color: '#6c757d' }}>{analysisResult.description}</span>
             </div>
             {analysisResult.wasteCategory && (
               <div style={{
                 display: 'flex',
                 justifyContent: 'space-between',
                 padding: '8px 12px',
                 backgroundColor: 'white',
                 borderRadius: '6px',
                 border: '1px solid #e9ecef'
               }}>
                 <strong style={{ color: '#495057' }}>ごみ分類:</strong> 
                 <span style={{ color: '#fd7e14', fontWeight: 'bold' }}>{analysisResult.wasteCategory}</span>
               </div>
             )}
             {analysisResult.wasteCategoryConfidence && (
               <div style={{
                 display: 'flex',
                 justifyContent: 'space-between',
                 padding: '8px 12px',
                 backgroundColor: 'white',
                 borderRadius: '6px',
                 border: '1px solid #e9ecef'
               }}>
                 <strong style={{ color: '#495057' }}>分類信頼度:</strong> 
                 <span style={{ color: '#17a2b8', fontWeight: 'bold' }}>{analysisResult.wasteCategoryConfidence.toFixed(1)}%</span>
               </div>
             )}
             {analysisResult.wasteCategory && (
               <div style={{
                 padding: '8px 12px',
                 backgroundColor: '#fff3cd',
                 borderRadius: '6px',
                 border: '1px solid #ffeaa7'
               }}>
                 <strong style={{ color: '#856404', display: 'block', marginBottom: '4px' }}>分類説明:</strong> 
                 <span style={{ color: '#856404', fontSize: '13px' }}>
                   {wasteCategoryDescriptions[analysisResult.wasteCategory]}
                 </span>
               </div>
             )}
           </div>
         </div>
       )}

      {/* 使用方法の説明 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginTop: '20px'
      }}>
        <h4 style={{ color: '#495057', marginBottom: '16px' }}>💡 使用方法</h4>
        <ol style={{ color: '#6c757d', lineHeight: '1.6' }}>
          <li>処分したい物品の写真を撮影またはファイルから選択</li>
          <li>「AI分析開始」ボタンをクリック</li>
          <li>AIが画像を分析し、品目とごみ分類を自動識別</li>
          <li>処分費用と分類方法を確認</li>
          <li>必要に応じてカレンダーに予定を追加</li>
        </ol>
        
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid #dee2e6',
          marginTop: '16px'
        }}>
          <h5 style={{ color: '#495057', marginBottom: '12px' }}>🗂️ 識別可能なごみ分類</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            <div style={{ padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '14px' }}>
              📦 <strong>粗大ごみ</strong>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#d1ecf1', borderRadius: '4px', fontSize: '14px' }}>
              🔧 <strong>不燃ごみ</strong>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#d4edda', borderRadius: '4px', fontSize: '14px' }}>
              🔥 <strong>可燃ごみ</strong>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#f8d7da', borderRadius: '4px', fontSize: '14px' }}>
              ♻️ <strong>資源プラスチック</strong>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#e2e3e5', borderRadius: '4px', fontSize: '14px' }}>
              🔄 <strong>不燃ごみリサイクル資源</strong>
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid #dee2e6',
          marginTop: '16px'
        }}>
          <h5 style={{ color: '#495057', marginBottom: '12px' }}>📋 システム要件</h5>
          <ul style={{ color: '#6c757d', margin: '0', lineHeight: '1.6' }}>
            <li>Ollamaサーバーが起動していること</li>
            <li>LLaVAモデル（llava:7b）がインストールされていること</li>
            <li>画像ファイル形式: JPG, PNG, GIF</li>
            <li>最大ファイルサイズ: 10MB</li>
          </ul>
        </div>
      </div>


    </div>
  );
};

export default BulkyWasteImageAnalyzer;