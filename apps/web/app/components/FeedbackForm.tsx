// apps/web/app/components/FeedbackForm.tsx

'use client';

import { useState } from 'react';
import { Camera, X } from 'lucide-react';

interface FeedbackFormProps {
  onClose: () => void;
  isDarkMode: boolean;
}

export function FeedbackForm({ onClose, isDarkMode }: FeedbackFormProps) {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert('Заполните название и описание проблемы');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('severity', severity);
      formData.append('description', description.trim());
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      const res = await fetch('/api/feedback', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('✅ Спасибо! Ваше сообщение отправлено.');
        onClose();
      } else {
        const error = await res.json();
        alert('❌ Ошибка: ' + (error.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      alert('❌ Ошибка соединения');
    }

    setLoading(false);
  };

  const severityLabels = {
    low: '🟢 Низкая',
    medium: '🟡 Средняя',
    high: '🔴 Высокая',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{
          fontSize: '12px',
          color: '#6b7280',
          display: 'block',
          marginBottom: '4px',
        }}>
          Название проблемы <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Кратко опишите проблему"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '10px',
            color: isDarkMode ? 'white' : '#1a1a1a',
            fontSize: '14px',
            outline: 'none',
          }}
          required
        />
      </div>

      <div>
        <label style={{
          fontSize: '12px',
          color: '#6b7280',
          display: 'block',
          marginBottom: '4px',
        }}>
          Критичность
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
        }}>
          {['low', 'medium', 'high'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: `2px solid ${severity === s ? '#3b82f6' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                background: severity === s ? 'rgba(59,130,246,0.1)' : 'transparent',
                cursor: 'pointer',
                fontSize: '11px',
                color: severity === s ? '#3b82f6' : '#6b7280',
              }}
            >
              {severityLabels[s as keyof typeof severityLabels]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{
          fontSize: '12px',
          color: '#6b7280',
          display: 'block',
          marginBottom: '4px',
        }}>
          Описание <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <textarea
          placeholder="Подробно опишите проблему или предложение"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '10px',
            color: isDarkMode ? 'white' : '#1a1a1a',
            fontSize: '14px',
            outline: 'none',
            resize: 'vertical',
            minHeight: '100px',
            fontFamily: 'inherit',
          }}
          required
        />
      </div>

      <div>
        <label style={{
          fontSize: '12px',
          color: '#6b7280',
          display: 'block',
          marginBottom: '4px',
        }}>
          Скриншот (опционально)
        </label>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <label
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px dashed ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#6b7280',
              fontSize: '12px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.color = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <Camera size={16} />
            Выбрать файл
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          {preview && (
            <div style={{
              position: 'relative',
              width: '64px',
              height: '64px',
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setScreenshot(null);
                  setPreview(null);
                }}
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: '10px',
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            borderRadius: '10px',
            color: '#6b7280',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px',
            background: loading
              ? '#374151'
              : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Отправка...' : 'Отправить'}
        </button>
      </div>
    </form>
  );
}