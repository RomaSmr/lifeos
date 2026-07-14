// apps/web/app/notes/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Dumbbell, FileText, Plus, X, 
  Home, CalendarDays, Timer, BarChart3, Target, User,
  Pin, PinOff, LogOut, Menu, Search, Check, XCircle,
  ExternalLink, Edit2, Trash2, Save, ChevronRight,
  Heart, Flame, Apple, Coffee, FolderOpen, PlusCircle
} from 'lucide-react';
import Loader from '@/app/components/Loader';
import { Sidebar } from '@/app/components/Sidebar';
import { useAuth } from '@/app/hooks/useAuth';
import { useTheme } from '@/app/hooks/useTheme';

interface Book {
  id: string;
  title: string;
  author: string;
  link: string;
  page_number: number;
  comment: string;
  status: 'reading' | 'finished' | 'planned';
  created_at: string;
}

interface Folder {
  id: string;
  name: string;
  created_at: string;
}

interface RegularNote {
  id: string;
  folder_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const DAYS = [
  { id: 'monday', label: 'Понедельник', icon: '🌙' },
  { id: 'tuesday', label: 'Вторник', icon: '🔥' },
  { id: 'wednesday', label: 'Среда', icon: '💪' },
  { id: 'thursday', label: 'Четверг', icon: '⚡' },
  { id: 'friday', label: 'Пятница', icon: '🎯' },
  { id: 'saturday', label: 'Суббота', icon: '🏋️' },
  { id: 'sunday', label: 'Воскресенье', icon: '🧘' },
];

export default function NotesPage() {
  const { user, authChecked, logout } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'books' | 'workouts' | 'regular'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  
  // Модалка книги
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookLink, setBookLink] = useState('');
  const [bookPage, setBookPage] = useState('');
  const [bookComment, setBookComment] = useState('');
  const [bookStatus, setBookStatus] = useState<'reading' | 'finished' | 'planned'>('reading');

  // Модалка спорта
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [workoutMotivation, setWorkoutMotivation] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState('');
  const [workoutCalories, setWorkoutCalories] = useState('');
  const [workoutFoods, setWorkoutFoods] = useState('');

  // 🔥 ОБЫЧНЫЕ ЗАМЕТКИ
  const [folders, setFolders] = useState<Folder[]>([]);
  const [regularNotes, setRegularNotes] = useState<RegularNote[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<RegularNote | null>(null);

  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Загрузка данных
  useEffect(() => {
    if (authChecked && user) {
      fetchBooks();
      fetchFolders();
    }
  }, [authChecked, user]);

  useEffect(() => {
    if (selectedFolder) {
      fetchNotes(selectedFolder);
    } else {
      setRegularNotes([]);
    }
  }, [selectedFolder]);

  // CRUD книг
  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
    setLoading(false);
  };

  const saveBook = async () => {
    if (!bookTitle.trim()) {
      alert('Введите название книги');
      return;
    }

    try {
      const url = '/api/books';
      const method = editingBook ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBook?.id,
          title: bookTitle.trim(),
          author: bookAuthor.trim(),
          link: bookLink.trim(),
          page_number: parseInt(bookPage) || 0,
          comment: bookComment.trim(),
          status: bookStatus,
        }),
      });

      if (res.ok) {
        await fetchBooks();
        closeBookModal();
      }
    } catch (error) {
      alert('Ошибка сохранения');
    }
  };

  const deleteBook = async (id: string) => {
    if (!confirm('Удалить книгу?')) return;
    try {
      const res = await fetch(`/api/books?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBooks(books.filter(b => b.id !== id));
      }
    } catch (error) {
      alert('Ошибка удаления');
    }
  };

  const openBookModal = (book?: Book) => {
    if (book) {
      setEditingBook(book);
      setBookTitle(book.title);
      setBookAuthor(book.author || '');
      setBookLink(book.link || '');
      setBookPage(book.page_number?.toString() || '');
      setBookComment(book.comment || '');
      setBookStatus(book.status || 'reading');
    } else {
      setEditingBook(null);
      setBookTitle('');
      setBookAuthor('');
      setBookLink('');
      setBookPage('');
      setBookComment('');
      setBookStatus('reading');
    }
    setIsBookModalOpen(true);
  };

  const closeBookModal = () => {
    setIsBookModalOpen(false);
    setEditingBook(null);
  };

  // CRUD спорта
  const openWorkoutModal = (dayId: string) => {
    setSelectedDay(dayId);
    setWorkoutMotivation('');
    setWorkoutPlan('');
    setWorkoutCalories('');
    setWorkoutFoods('');
    setIsWorkoutModalOpen(true);
  };

  const saveWorkout = async () => {
    if (!selectedDay) return;

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_of_week: selectedDay,
          motivation: workoutMotivation.trim(),
          workout_plan: workoutPlan.trim(),
          nutrition_calories: parseInt(workoutCalories) || 0,
          nutrition_foods: workoutFoods.split(',').map(f => f.trim()).filter(f => f),
        }),
      });

      if (res.ok) {
        alert('✅ Тренировка сохранена!');
        setIsWorkoutModalOpen(false);
      } else {
        alert('❌ Ошибка сохранения');
      }
    } catch (error) {
      alert('❌ Ошибка соединения');
    }
  };

  // 🔥 CRUD ОБЫЧНЫХ ЗАМЕТОК
  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/note-folders');
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
        if (data.length > 0 && !selectedFolder) {
          setSelectedFolder(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchNotes = async (folderId: string) => {
    try {
      const res = await fetch(`/api/regular-notes?folderId=${folderId}`);
      if (res.ok) {
        const data = await res.json();
        setRegularNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const createFolder = async () => {
    if (!folderName.trim()) {
      alert('Введите название папки');
      return;
    }

    try {
      const res = await fetch('/api/note-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName.trim() }),
      });

      if (res.ok) {
        await fetchFolders();
        setFolderName('');
        setIsFolderModalOpen(false);
      }
    } catch (error) {
      alert('Ошибка создания папки');
    }
  };

  const createNote = async () => {
    if (!noteTitle.trim()) {
      alert('Введите название заметки');
      return;
    }

    try {
      const url = '/api/regular-notes';
      const method = editingNote ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingNote?.id,
          folder_id: selectedFolder,
          title: noteTitle.trim(),
          content: noteContent.trim(),
        }),
      });

      if (res.ok) {
        await fetchNotes(selectedFolder!);
        setIsNoteModalOpen(false);
        setNoteTitle('');
        setNoteContent('');
        setEditingNote(null);
      }
    } catch (error) {
      alert('Ошибка сохранения заметки');
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Удалить заметку?')) return;
    try {
      const res = await fetch(`/api/regular-notes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRegularNotes(regularNotes.filter(n => n.id !== id));
      }
    } catch (error) {
      alert('Ошибка удаления');
    }
  };

  const openNoteModal = (note?: RegularNote) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content || '');
    } else {
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
    }
    setIsNoteModalOpen(true);
  };

  // Боковая панель
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isSidebarPinned) setIsSidebarOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isSidebarPinned) {
      timeoutRef.current = setTimeout(() => setIsSidebarOpen(false), 300);
    }
  };

  const togglePin = () => {
    setIsSidebarPinned(!isSidebarPinned);
    if (!isSidebarPinned) setIsSidebarOpen(true);
  };

  const handleNavigate = (view: string) => {
    if (view === 'profile') router.push('/profile');
    else if (view === 'goals') router.push('/goals');
    else if (view === 'focus') router.push('/focus');
    else if (view === 'notes') router.push('/notes');
    else if (view === 'calendar') router.push('/dashboard?view=calendar');
    else if (view === 'analytics') router.push('/dashboard?view=analytics');
    else router.push('/dashboard');
  };

  if (!authChecked || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Loader text="Загрузка заметок..." size="large" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
      display: 'flex',
      position: 'relative',
      transition: 'background 0.3s ease',
    }}>
      {/* Боковая панель */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1000,
        }}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          isPinned={isSidebarPinned}
          onTogglePin={togglePin}
          onClose={() => setIsSidebarOpen(false)}
          isDarkMode={isDarkMode}
          activeView="notes"
          onNavigate={handleNavigate}
          onLogout={logout}
        />
      </div>

      {/* Основной контент */}
      <div style={{
        flex: 1,
        padding: '24px',
        marginLeft: isSidebarOpen ? '240px' : '0px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: isSidebarOpen ? 'calc(100% - 240px)' : '100%',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          marginTop: isSidebarOpen ? '0' : '48px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  padding: '8px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: isDarkMode ? 'white' : '#1a1a1a',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <FileText size={24} style={{ color: '#3b82f6' }} />
              Заметки
            </h1>
          </div>
        </div>

        {/* Вкладки */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '24px',
          background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          borderRadius: '12px',
          padding: '4px',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        }}>
          {[
            { id: 'books', label: '📚 Книги', icon: BookOpen },
            { id: 'workouts', label: '💪 Спорт', icon: Dumbbell },
            { id: 'regular', label: '📝 Обычные', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: activeTab === tab.id ? isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)' : 'transparent',
                  border: 'none',
                  color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                  fontSize: '13px',
                  fontWeight: activeTab === tab.id ? '500' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ===== ВКЛАДКА КНИГИ ===== */}
        {activeTab === 'books' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <span style={{
                fontSize: '13px',
                color: '#6b7280',
              }}>
                {books.length} книг
              </span>
              <button
                onClick={() => openBookModal()}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Plus size={16} />
                Добавить книгу
              </button>
            </div>

            {books.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280',
              }}>
                <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: '16px', fontWeight: '500' }}>Нет книг</p>
                <p style={{ fontSize: '13px' }}>Добавь книгу, чтобы отслеживать прогресс</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {books.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => openBookModal(book)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)';
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: book.status === 'finished' ? 'rgba(34,197,94,0.15)' : 
                                  book.status === 'reading' ? 'rgba(59,130,246,0.15)' : 
                                  'rgba(234,179,8,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0,
                    }}>
                      {book.status === 'finished' ? '✅' : 
                       book.status === 'reading' ? '📖' : 
                       '📅'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isDarkMode ? 'white' : '#1a1a1a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {book.title}
                      </div>
                      {book.author && (
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {book.author}
                        </div>
                      )}
                      {book.page_number > 0 && (
                        <div style={{
                          fontSize: '11px',
                          color: '#4b5563',
                          marginTop: '2px',
                        }}>
                          📄 Стр. {book.page_number}
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      padding: '2px 10px',
                      borderRadius: '100px',
                      background: book.status === 'finished' ? 'rgba(34,197,94,0.15)' : 
                                  book.status === 'reading' ? 'rgba(59,130,246,0.15)' : 
                                  'rgba(234,179,8,0.15)',
                      color: book.status === 'finished' ? '#22c55e' : 
                             book.status === 'reading' ? '#3b82f6' : 
                             '#eab308',
                      flexShrink: 0,
                    }}>
                      {book.status === 'finished' ? 'Прочитана' : 
                       book.status === 'reading' ? 'Читаю' : 
                       'Запланирована'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBook(book.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: '4px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#6b7280';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== ВКЛАДКА СПОРТ ===== */}
        {activeTab === 'workouts' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <span style={{
                fontSize: '13px',
                color: '#6b7280',
              }}>
                Тренировки по дням
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DAYS.map((day) => (
                <div
                  key={day.id}
                  onClick={() => openWorkoutModal(day.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: day.id === 'saturday' || day.id === 'sunday' 
                        ? 'rgba(239,68,68,0.1)' 
                        : 'rgba(59,130,246,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                    }}>
                      {day.icon}
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: isDarkMode ? 'white' : '#1a1a1a',
                    }}>
                      {day.label}
                    </span>
                  </div>
                  <ChevronRight size={16} style={{ color: '#6b7280' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ВКЛАДКА ОБЫЧНЫЕ ЗАМЕТКИ ===== */}
        {activeTab === 'regular' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <span style={{
                fontSize: '13px',
                color: '#6b7280',
              }}>
                Папки ({folders.length})
              </span>
              <button
                onClick={() => setIsFolderModalOpen(true)}
                style={{
                  padding: '6px 14px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Plus size={14} />
                Папка
              </button>
            </div>

            {/* Список папок */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '100px',
                    border: `1px solid ${selectedFolder === folder.id ? '#3b82f6' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    background: selectedFolder === folder.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: selectedFolder === folder.id ? '#3b82f6' : '#6b7280',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <FolderOpen size={14} />
                  {folder.name}
                </button>
              ))}
            </div>

            {/* Заметки в папке */}
            {selectedFolder && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280',
                  }}>
                    {regularNotes.length} заметок
                  </span>
                  <button
                    onClick={() => openNoteModal()}
                    style={{
                      padding: '4px 12px',
                      background: 'rgba(59,130,246,0.15)',
                      border: `1px solid rgba(59,130,246,0.2)`,
                      borderRadius: '6px',
                      color: '#3b82f6',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59,130,246,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(59,130,246,0.15)';
                    }}
                  >
                    <Plus size={12} />
                    Заметка
                  </button>
                </div>

                {regularNotes.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#6b7280',
                    fontSize: '13px',
                  }}>
                    Нет заметок в этой папке
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {regularNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => openNoteModal(note)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
                          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                          <FileText size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
                          <div style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: isDarkMode ? 'white' : '#1a1a1a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {note.title}
                          </div>
                          {note.content && (
                            <div style={{
                              fontSize: '11px',
                              color: '#6b7280',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                            }}>
                              {note.content}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#6b7280';
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== МОДАЛКА КНИГИ ===== */}
      {isBookModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
          }}
          onClick={closeBookModal}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: isDarkMode ? '#141414' : '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDarkMode ? 'white' : '#1a1a1a',
                margin: 0,
              }}>
                {editingBook ? 'Редактировать книгу' : 'Новая книга'}
              </h2>
              <button
                onClick={closeBookModal}
                style={{
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                  Название <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Введите название книги"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
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
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                  Автор
                </label>
                <input
                  type="text"
                  placeholder="Автор книги"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
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
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                  Ссылка на источник
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={bookLink}
                  onChange={(e) => setBookLink(e.target.value)}
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
                />
                {bookLink && (
                  <a
                    href={bookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '12px',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px',
                    }}
                  >
                    <ExternalLink size={12} />
                    Перейти по ссылке
                  </a>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                  Страница
                </label>
                <input
                  type="number"
                  placeholder="Номер страницы"
                  value={bookPage}
                  onChange={(e) => setBookPage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '10px',
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    fontSize: '14px',
                    outline: 'none',
                    minWidth: 0,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                  Статус
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                }}>
                  {[
                    { id: 'reading', label: '📖 Читаю' },
                    { id: 'finished', label: '✅ Прочитана' },
                    { id: 'planned', label: '📅 Запланирована' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setBookStatus(s.id as any)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: `2px solid ${bookStatus === s.id ? '#3b82f6' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                        background: bookStatus === s.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: bookStatus === s.id ? '#3b82f6' : '#6b7280',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                  Комментарий
                </label>
                <textarea
                  placeholder="Ваш комментарий к книге..."
                  value={bookComment}
                  onChange={(e) => setBookComment(e.target.value)}
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
                    minHeight: '60px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={closeBookModal}
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
                  onClick={saveBook}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(59,130,246,0.25)',
                  }}
                >
                  {editingBook ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== МОДАЛКА СПОРТА ===== */}
      {isWorkoutModalOpen && selectedDay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
          }}
          onClick={() => setIsWorkoutModalOpen(false)}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: isDarkMode ? '#141414' : '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDarkMode ? 'white' : '#1a1a1a',
                margin: 0,
              }}>
                {DAYS.find(d => d.id === selectedDay)?.label || selectedDay}
              </h2>
              <button
                onClick={() => setIsWorkoutModalOpen(false)}
                style={{
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'block',
                  marginBottom: '4px',
                }}>
                  <Heart size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Мотивационная речь
                </label>
                <textarea
                  placeholder="Напиши что-то, что мотивирует тебя в этот день..."
                  value={workoutMotivation}
                  onChange={(e) => setWorkoutMotivation(e.target.value)}
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
                    minHeight: '60px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'block',
                  marginBottom: '4px',
                }}>
                  <Dumbbell size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  План тренировки
                </label>
                <textarea
                  placeholder="Что будешь делать? Например: приседания, отжимания, бег..."
                  value={workoutPlan}
                  onChange={(e) => setWorkoutPlan(e.target.value)}
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
                    minHeight: '60px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
                <div>
                  <label style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    display: 'block',
                    marginBottom: '4px',
                  }}>
                    <Flame size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Калории (норма)
                  </label>
                  <input
                    type="number"
                    placeholder="2000"
                    value={workoutCalories}
                    onChange={(e) => setWorkoutCalories(e.target.value)}
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
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    display: 'block',
                    marginBottom: '4px',
                  }}>
                    <Apple size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Продукты (через запятую)
                  </label>
                  <input
                    type="text"
                    placeholder="Курица, рис, овощи"
                    value={workoutFoods}
                    onChange={(e) => setWorkoutFoods(e.target.value)}
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
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => setIsWorkoutModalOpen(false)}
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
                  onClick={saveWorkout}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'linear-gradient(135deg, #f97316, #ef4444)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(249,115,22,0.25)',
                  }}
                >
                  Сохранить тренировку
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== МОДАЛКА ПАПКИ ===== */}
      {isFolderModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
          }}
          onClick={() => setIsFolderModalOpen(false)}
        >
          <div
            style={{
              maxWidth: '400px',
              width: '100%',
              background: isDarkMode ? '#141414' : '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDarkMode ? 'white' : '#1a1a1a',
                margin: 0,
              }}>
                Новая папка
              </h2>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                style={{
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Название папки"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
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
                autoFocus
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => setIsFolderModalOpen(false)}
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
                  onClick={createFolder}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(59,130,246,0.25)',
                  }}
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Версия */}
      <div style={{
        marginTop: '40px',
        textAlign: 'center',
        fontSize: '10px',
        color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
        fontFamily: 'monospace',
        letterSpacing: '2px',
      }}>
        v1.0
      </div>

      {/* ===== МОДАЛКА ЗАМЕТКИ ===== */}
      {isNoteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
          }}
          onClick={() => {
            setIsNoteModalOpen(false);
            setEditingNote(null);
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: isDarkMode ? '#141414' : '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDarkMode ? 'white' : '#1a1a1a',
                margin: 0,
              }}>
                {editingNote ? 'Редактировать заметку' : 'Новая заметка'}
              </h2>
              <button
                onClick={() => {
                  setIsNoteModalOpen(false);
                  setEditingNote(null);
                }}
                style={{
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Название заметки"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
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
                autoFocus
              />

              <textarea
                placeholder="Содержание заметки..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
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
                  minHeight: '120px',
                  fontFamily: 'inherit',
                }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setIsNoteModalOpen(false);
                    setEditingNote(null);
                  }}
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
                  onClick={createNote}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(59,130,246,0.25)',
                  }}
                >
                  {editingNote ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}