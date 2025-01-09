import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl text-center">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            404
          </h1>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Sayfa Bulunamadı
          </h2>
          
          <p className="text-gray-600">
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
          >
            <FiArrowLeft />
            Geri Dön
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            <FiHome />
            Ana Sayfa
          </button>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Bir sorun olduğunu düşünüyorsanız, lütfen bizimle iletişime geçin.
          </p>
        </div>
      </div>
    </div>
  );
} 