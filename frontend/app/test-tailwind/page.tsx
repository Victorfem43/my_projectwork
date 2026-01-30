'use client';

export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white mb-8">Tailwind CSS Test Page</h1>
        
        {/* Test 1: Basic Colors */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Test 1: Card Component</h2>
          <p className="text-gray-300">If you see a glassmorphism card with rounded corners, the card class works.</p>
        </div>

        {/* Test 2: Gradient Background */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Test 2: Gradient Background</h2>
          <p className="text-white">If you see a blue-to-cyan gradient, Tailwind gradients work.</p>
        </div>

        {/* Test 3: Button */}
        <button className="btn-primary">
          Test 3: Primary Button - Should be blue gradient
        </button>

        {/* Test 4: Basic Tailwind Classes */}
        <div className="bg-red-500 text-white p-4 rounded-lg">
          <h2 className="text-xl font-bold">Test 4: Basic Tailwind</h2>
          <p>If this box is RED with white text, Tailwind is working!</p>
        </div>

        {/* Test 5: Custom Classes */}
        <div className="card-hover p-6">
          <h2 className="heading-2 text-white mb-4">Test 5: Custom Heading</h2>
          <p className="text-gray-400">If heading is large and styled, custom classes work.</p>
        </div>

        {/* Test 6: Input Field */}
        <input 
          type="text" 
          className="input-field" 
          placeholder="Test 6: Input Field - Should have glass effect"
        />

        {/* Test 7: Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-500/20 p-4 rounded text-white text-center">1</div>
          <div className="bg-green-500/20 p-4 rounded text-white text-center">2</div>
          <div className="bg-purple-500/20 p-4 rounded text-white text-center">3</div>
        </div>

        <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-200 font-bold">
            ⚠️ If you see unstyled content, Tailwind CSS is NOT working.
          </p>
          <p className="text-yellow-200 mt-2">
            Check browser console (F12) for errors and Network tab for CSS files.
          </p>
        </div>
      </div>
    </div>
  );
}
