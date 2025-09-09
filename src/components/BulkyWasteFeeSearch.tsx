import React, { useState, useMemo } from 'react';
import { bulkyWasteData, searchByName, getCategories, filterByCategory, BulkyWasteItem } from '../data/bulkyWasteData';

interface BulkyWasteFeeSearchProps {
  className?: string;
}

const BulkyWasteFeeSearch: React.FC<BulkyWasteFeeSearchProps> = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchResults, setSearchResults] = useState<BulkyWasteItem[]>([]);
  const [showResults, setShowResults] = useState(false);

  const categories = useMemo(() => getCategories(), []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    let results = searchByName(searchTerm);
    
    if (selectedCategory) {
      results = results.filter(item => item.category === selectedCategory);
    }

    setSearchResults(results);
    setShowResults(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSearchResults([]);
    setShowResults(false);
  };

  const formatFee = (fee: number): string => {
    return `${fee.toLocaleString()}円`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        粗大ごみ処理手数料検索
      </h2>
      
      <div className="space-y-4 mb-6">
        {/* 検索入力欄 */}
        <div>
          <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
            品目名を入力してください
          </label>
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="例: 冷蔵庫、テレビ、ソファー"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* カテゴリー選択 */}
        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリー（任意）
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">すべてのカテゴリー</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* ボタン */}
        <div className="flex space-x-3">
          <button
            onClick={handleSearch}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            検索
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            クリア
          </button>
        </div>
      </div>

      {/* 検索結果 */}
      {showResults && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            検索結果 ({searchResults.length}件)
          </h3>
          
          {searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">該当する品目が見つかりませんでした。</p>
              <p className="text-gray-400 text-sm mt-2">
                別のキーワードで検索してみてください。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((item, index) => (
                <div
                  key={`${item.name}-${item.category}-${index}`}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-lg">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        カテゴリー: {item.category}
                      </p>
                      {item.note && (
                        <p className="text-sm text-blue-600 mt-1">
                          ※ {item.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatFee(item.fee)}
                      </div>
                      <div className="text-xs text-gray-500">
                        処理手数料
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 注意事項 */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">ご注意</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 粗大ごみの処理手数料は、素材やサイズによって表示料金と異なる場合があります。</li>
          <li>• 詳しくは志木市粗大ごみ等受付センター（048-473-5311）へお問い合わせください。</li>
          <li>• 料金は志木市の公式サイトの情報に基づいています。</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkyWasteFeeSearch;