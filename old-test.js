// 古いテストファイル - レガシーコード
const assert = require('assert');

// 古いテスト関数
function runOldTests() {
  console.log('=== 古いテストスイート実行中 ===');
  
  // テスト1: 基本的な計算
  testBasicCalculation();
  
  // テスト2: 文字列処理
  testStringProcessing();
  
  // テスト3: 配列操作
  testArrayOperations();
  
  console.log('=== 全ての古いテストが完了 ===');
}

// 基本計算のテスト
function testBasicCalculation() {
  console.log('テスト: 基本計算');
  
  const result1 = add(2, 3);
  assert.strictEqual(result1, 5, '2 + 3 = 5');
  
  const result2 = multiply(4, 5);
  assert.strictEqual(result2, 20, '4 * 5 = 20');
  
  console.log('✅ 基本計算テスト完了');
}

// 文字列処理のテスト
function testStringProcessing() {
  console.log('テスト: 文字列処理');
  
  const result1 = reverseString('hello');
  assert.strictEqual(result1, 'olleh', 'hello -> olleh');
  
  const result2 = capitalizeFirst('world');
  assert.strictEqual(result2, 'World', 'world -> World');
  
  console.log('✅ 文字列処理テスト完了');
}

// 配列操作のテスト
function testArrayOperations() {
  console.log('テスト: 配列操作');
  
  const arr = [1, 2, 3, 4, 5];
  const sum = sumArray(arr);
  assert.strictEqual(sum, 15, '配列の合計値');
  
  const filtered = filterEven(arr);
  assert.deepStrictEqual(filtered, [2, 4], '偶数のフィルタリング');
  
  console.log('✅ 配列操作テスト完了');
}

// ヘルパー関数
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

function reverseString(str) {
  return str.split('').reverse().join('');
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sumArray(arr) {
  return arr.reduce((sum, num) => sum + num, 0);
}

function filterEven(arr) {
  return arr.filter(num => num % 2 === 0);
}

// メイン実行
if (require.main === module) {
  try {
    runOldTests();
    console.log('🎉 全てのテストが成功しました！');
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
    process.exit(1);
  }
}

module.exports = {
  runOldTests,
  add,
  multiply,
  reverseString,
  capitalizeFirst,
  sumArray,
  filterEven
};