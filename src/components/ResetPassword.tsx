import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { FiLock, FiArrowLeft } from 'react-icons/fi';

export function ResetPassword() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (!token) {
      setError('Geçersiz token');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        token,
        newPassword: formData.newPassword
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Şifre sıfırlama başarısız');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-500"
        >
          <FiArrowLeft /> Giriş'e Dön
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Şifre Sıfırlama</h2>
          <p className="text-gray-500">
            Lütfen yeni şifrenizi belirleyin
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {success ? (
          <div className="p-6 text-center">
            <div className="text-green-600 mb-4">
              ✓ Şifreniz başarıyla güncellendi
            </div>
            <p className="text-gray-600">
              Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiLock className="text-gray-400" />
                Yeni Şifre
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiLock className="text-gray-400" />
                Şifre Tekrar
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                'Şifreyi Güncelle'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 