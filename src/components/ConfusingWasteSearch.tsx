import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { ConfusingWasteItem } from '../data/confusingWasteData';

const ConfusingWasteSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ConfusingWasteItem | null>(null);
  const [csvData, setCsvData] = useState<ConfusingWasteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CSVファイルを読み込む
  useEffect(() => {
    const loadCsvData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/confusing-waste-data.csv');
        if (!response.ok) {
          throw new Error('CSVファイルの読み込みに失敗しました');
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            // ヘッダー行をスキップして、データ行のみを処理
            const dataRows = results.data.slice(1);
            const data: ConfusingWasteItem[] = dataRows.map((row: any) => ({
              item: row[0] || '',
              handling: row[1] || '',
              reason: row[2] || ''
            }));
            setCsvData(data);
            setLoading(false);
            console.log(`迷惑ゴミデータを読み込みました: ${data.length}件`);
          },
          error: (error: any) => {
            console.error('CSV解析エラー:', error);
            setError('CSVファイルの解析に失敗しました');
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('ファイル読み込みエラー:', err);
        setError('CSVファイルの読み込みに失敗しました');
        setLoading(false);
      }
    };
    
    loadCsvData();
  }, []);

  // 検索結果をフィルタリング
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    return csvData.filter(item =>
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.handling.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, csvData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 検索は自動で行われるため、特別な処理は不要
  };

  const handleItemSelect = (item: ConfusingWasteItem) => {
    setSelectedItem(item);
  };

  const resetSearch = () => {
    setSearchTerm('');
    setSelectedItem(null);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        {/* 戻るボタン */}
        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#218838';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745';
            }}
          >
            ← 志木市ゴミ収集日程表に戻る
          </button>
        </div>
        
        <h2 style={{ 
          color: '#2c3e50', 
          marginBottom: '20px', 
          textAlign: 'center',
          fontSize: '24px'
        }}>
          🤔 判断に迷うごみの一覧表
        </h2>
        
        <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="品目名、取扱方法、理由で検索..."
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <button
              type="button"
              onClick={resetSearch}
              style={{
                padding: '12px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              クリア
            </button>
          </div>
        </form>

        {/* ローディング表示 */}
        {loading && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#6c757d',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            📄 CSVファイルを読み込み中...
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#dc3545',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            ❌ {error}
          </div>
        )}

        {/* 検索結果一覧 */}
        {!loading && !error && searchTerm && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#495057', marginBottom: '15px' }}>
              検索結果 ({filteredItems.length}件)
            </h3>
            
            {filteredItems.length > 0 ? (
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: 'white'
              }}>
                {filteredItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleItemSelect(item)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: index < filteredItems.length - 1 ? '1px solid #eee' : 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      backgroundColor: selectedItem === item ? '#e3f2fd' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedItem !== item) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedItem !== item) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                      {item.item}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6c757d',
                      marginTop: '4px'
                    }}>
                      {item.handling}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#6c757d',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px'
              }}>
                該当する品目が見つかりませんでした
              </div>
            )}
          </div>
        )}

        {/* 選択された品目の詳細表示 */}
        {selectedItem && (
          <div style={{
            backgroundColor: 'white',
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ 
              color: '#007bff', 
              marginBottom: '15px',
              fontSize: '20px'
            }}>
              📋 詳細情報
            </h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  color: '#495057',
                  marginBottom: '5px'
                }}>
                  品目:
                </label>
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}>
                  {selectedItem.item}
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  color: '#495057',
                  marginBottom: '5px'
                }}>
                  取扱:
                </label>
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: getHandlingColor(selectedItem.handling)
                }}>
                  {selectedItem.handling}
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  color: '#495057',
                  marginBottom: '5px'
                }}>
                  理由・受入条件:
                </label>
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}>
                  {selectedItem.reason}
                </div>
              </div>
            </div>
            
            {/* 戻るボタン */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a6268';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d';
                }}
              >
                ← 戻る
              </button>
            </div>
          </div>
        )}

        {/* 使用方法の説明 */}
        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#e8f4f8',
          border: '1px solid #bee5eb',
          borderRadius: '6px'
        }}>
          <h4 style={{ color: '#0c5460', marginBottom: '10px' }}>
            💡 使用方法
          </h4>
          <ul style={{ color: '#0c5460', margin: 0, paddingLeft: '20px' }}>
            <li>検索欄に品目名や取扱方法を入力してください</li>
            <li>検索結果から該当する品目をクリックすると詳細が表示されます</li>
            <li>📄 データは「迷惑ゴミOK.csv」ファイルから直接読み込まれます</li>
            <li>CSVファイルを更新すると、ページを再読み込みで最新データが反映されます</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// 取扱方法に応じた色を返す関数
const getHandlingColor = (handling: string): string => {
  if (handling.includes('燃やせるごみ')) return '#28a745';
  if (handling.includes('燃やせないごみ')) return '#dc3545';
  if (handling.includes('資源ごみ')) return '#007bff';
  if (handling.includes('容器包装プラスチック')) return '#17a2b8';
  if (handling.includes('粗大ごみ')) return '#fd7e14';
  if (handling.includes('収集しません')) return '#6c757d';
  return '#495057';
};

export default ConfusingWasteSearch;