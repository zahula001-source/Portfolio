'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, Mail, Phone, MapPin, ExternalLink, Upload,
  Trash2, Plus, Lock, Unlock, ImageIcon, Video,
  Save, ChevronDown, Briefcase, Award, Eye, Settings,
  Play, FolderOpen, Edit3, Tag, MessageCircle, QrCode,
  Menu, Link as LinkIcon
} from 'lucide-react';

interface PortfolioInfo {
  id: string; name: string; title: string; tagline: string; bio: string;
  email: string; phone: string; location: string; behanceUrl: string;
  profileImage: string; profilePosX: number; profilePosY: number; profileScale: number;
  cutoutImage: string; featherAmount: number;
  cutoutScale: number; cutoutPosY: number;
  zaloLink: string; zaloIcon: string; zaloQr: string; adminPassword: string;
}
interface Experience { id: string; role: string; company: string; location: string; startDate: string; endDate: string; type: string; order: number; }
interface Category { id: string; name: string; slug: string; description: string; icon: string; type: string; order: number; items: MediaItem[]; }
interface MediaItem { id: string; title: string; description: string; type: string; url: string; thumbnail: string; categoryId: string | null; order: number; createdAt: string; }
interface ClientItem { id: string; name: string; logo: string; link: string; order: number; }

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const [info, setInfo] = useState<PortfolioInfo | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);

  const [editingInfo, setEditingInfo] = useState(false);
  const [editInfo, setEditInfo] = useState<Partial<PortfolioInfo>>({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: '📁', type: 'mixed', description: '' });
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [newExp, setNewExp] = useState({ role: '', company: '', location: '', startDate: '', endDate: '', type: 'Full Time' });
  const [uploading, setUploading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCutout, setUploadingCutout] = useState(false);
  const [uploadCategoryId, setUploadCategoryId] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', logo: '', link: '' });

  // Embed link modal
  const [showEmbedLink, setShowEmbedLink] = useState(false);
  const [embedCategoryId, setEmbedCategoryId] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedTitle, setEmbedTitle] = useState('');

  // Modals
  const [mediaModal, setMediaModal] = useState<{ type: string; url: string; thumbnail: string; title: string; items: { type: string; url: string; thumbnail: string; title: string }[]; index: number } | null>(null);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const [embedPlayClicked, setEmbedPlayClicked] = useState(false);

  // Fix old/broken YouTube embed URLs (nocookie, origin param, etc.)
  const fixEmbedUrl = (url: string) => {
    if (!url) return url;
    // Replace youtube-nocookie.com with youtube.com
    let fixed = url.replace('youtube-nocookie.com', 'youtube.com');
    // Remove origin parameter (causes Lỗi 153)
    fixed = fixed.replace(/[?&]origin=[^&]*/g, '');
    // Ensure URL starts with ? not & after cleanup
    fixed = fixed.replace(/\?&/, '?').replace(/\?$/, '');
    return fixed;
  };

  const openMediaModal = (item: { type: string; url: string; thumbnail?: string; title?: string }, allItems: { type: string; url: string; thumbnail: string; title: string }[]) => {
    const idx = allItems.findIndex(i => i.url === item.url && i.type === item.type);
    setEmbedLoaded(false);
    setEmbedPlayClicked(false);
    setMediaModal({ type: item.type, url: fixEmbedUrl(item.url), thumbnail: item.thumbnail || '', title: item.title || '', items: allItems.map(i => ({ ...i, url: fixEmbedUrl(i.url) })), index: idx >= 0 ? idx : 0 });
  };
  const [showQr, setShowQr] = useState(false);
  const [featherSlider, setFeatherSlider] = useState(30);
  const [cutoutScaleVal, setCutoutScaleVal] = useState(100);
  const [cutoutPosYVal, setCutoutPosYVal] = useState(0);
  const [profilePosXVal, setProfilePosXVal] = useState(50);
  const [profilePosYVal, setProfilePosYVal] = useState(50);
  const [profileScaleVal, setProfileScaleVal] = useState(100);
  const [footerClicks, setFooterClicks] = useState(0);
  const footerClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const cutoutInputRef = useRef<HTMLInputElement>(null);
  const clientLogoInputRef = useRef<HTMLInputElement>(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [infoRes, expRes, catRes, clientRes] = await Promise.all([
        fetch('/api/portfolio'), fetch('/api/portfolio/experience'),
        fetch('/api/category'), fetch('/api/portfolio/client'),
      ]);
      const [infoData, expData, catData, clientData] = await Promise.all([
        infoRes.json(), expRes.json(), catRes.json(), clientRes.json(),
      ]);
      setInfo(infoData); setEditInfo(infoData);
      setExperiences(expData); setCategories(catData); setClients(clientData);
      setFeatherSlider(infoData?.featherAmount ?? 30);
      setCutoutScaleVal(infoData?.cutoutScale ?? 100);
      setCutoutPosYVal(infoData?.cutoutPosY ?? 0);
      setProfilePosXVal(infoData?.profilePosX ?? 50);
      setProfilePosYVal(infoData?.profilePosY ?? 50);
      setProfileScaleVal(infoData?.profileScale ?? 100);
    } catch (e) { console.error('Fetch error:', e); }
  }, []);

  const dataLoadedRef = useRef(false);
  useEffect(() => {
    if (!dataLoadedRef.current) { dataLoadedRef.current = true; // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAllData(); }
  }, [fetchAllData]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!mediaModal) return;
      if (e.key === 'ArrowLeft' && mediaModal.index > 0) {
        setEmbedLoaded(false); setEmbedPlayClicked(false);
        const i = mediaModal.index - 1; const item = mediaModal.items[i];
        setMediaModal({ ...mediaModal, type: item.type, url: item.url, thumbnail: item.thumbnail, title: item.title, index: i });
      } else if (e.key === 'ArrowRight' && mediaModal.index < mediaModal.items.length - 1) {
        setEmbedLoaded(false); setEmbedPlayClicked(false);
        const i = mediaModal.index + 1; const item = mediaModal.items[i];
        setMediaModal({ ...mediaModal, type: item.type, url: item.url, thumbnail: item.thumbnail, title: item.title, index: i });
      } else if (e.key === 'Escape') {
        setMediaModal(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mediaModal]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (res.ok) { setIsAdmin(true); setShowLogin(false); setPassword(''); setLoginError(''); }
      else { setLoginError('Mật khẩu không đúng!'); }
    } catch { setLoginError('Lỗi xác thực'); }
  };

  const saveInfo = async () => {
    await fetch('/api/portfolio', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editInfo, featherAmount: featherSlider, cutoutScale: cutoutScaleVal, cutoutPosY: cutoutPosYVal, profilePosX: profilePosXVal, profilePosY: profilePosYVal, profileScale: profileScaleVal }) });
    setEditingInfo(false); fetchAllData();
  };

  // Slider changes update local state only - user must press Save to persist
  const updateFeather = (val: number) => setFeatherSlider(val);
  const updateCutoutScale = (val: number) => setCutoutScaleVal(val);
  const updateCutoutPosY = (val: number) => setCutoutPosYVal(val);
  const updateProfilePosX = (val: number) => setProfilePosXVal(val);
  const updateProfilePosY = (val: number) => setProfilePosYVal(val);
  const updateProfileScale = (val: number) => setProfileScaleVal(val);

  // Explicit save all admin settings
  const [saving, setSaving] = useState(false);
  const saveAllSettings = async () => {
    if (!info) return;
    setSaving(true);
    try {
      await fetch('/api/portfolio', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        featherAmount: featherSlider,
        cutoutScale: cutoutScaleVal,
        cutoutPosY: cutoutPosYVal,
        profilePosX: profilePosXVal,
        profilePosY: profilePosYVal,
        profileScale: profileScaleVal,
      }) });
      await fetchAllData();
    } catch (e) { console.error('Save error:', e); }
    setSaving(false);
  };
  const handleFooterClick = () => {
    const newCount = footerClicks + 1;
    setFooterClicks(newCount);
    if (footerClickTimer.current) clearTimeout(footerClickTimer.current);
    if (newCount >= 5) {
      setFooterClicks(0);
      if (isAdmin) { setIsAdmin(false); } else { setShowLogin(true); }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      footerClickTimer.current = setTimeout(() => setFooterClicks(0), 2000);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingProfile(true);
    const formData = new FormData(); formData.append('file', file);
    await fetch('/api/portfolio/profile-image', { method: 'POST', body: formData });
    setUploadingProfile(false); fetchAllData();
    if (profileInputRef.current) profileInputRef.current.value = '';
  };

  const handleCutoutUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingCutout(true);
    const formData = new FormData(); formData.append('file', file);
    await fetch('/api/portfolio/cutout-image', { method: 'POST', body: formData });
    setUploadingCutout(false); fetchAllData();
    if (cutoutInputRef.current) cutoutInputRef.current.value = '';
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData(); formData.append('file', file); formData.append('title', file.name);
      if (uploadCategoryId) formData.append('categoryId', uploadCategoryId);
      await fetch('/api/media/upload', { method: 'POST', body: formData });
    }
    setUploading(false); setUploadCategoryId(null); fetchAllData();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openUploadForCategory = (catId: string) => { setUploadCategoryId(catId); setTimeout(() => fileInputRef.current?.click(), 100); };

  const addCategory = async () => {
    const slug = newCategory.slug || generateSlug(newCategory.name);
    await fetch('/api/category', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newCategory, slug, order: categories.length }) });
    setShowAddCategory(false); setNewCategory({ name: '', slug: '', icon: '📁', type: 'mixed', description: '' }); fetchAllData();
  };
  const deleteCategory = async (id: string) => { await fetch('/api/category', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchAllData(); };
  const deleteMedia = async (id: string) => { await fetch('/api/media/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchAllData(); };

  // Add embed link (YouTube/TikTok)
  const openEmbedForCategory = (catId: string) => {
    setEmbedCategoryId(catId);
    setEmbedUrl('');
    setEmbedTitle('');
    setShowEmbedLink(true);
  };
  const addEmbedLink = async () => {
    if (!embedUrl.trim()) return;
    await fetch('/api/media/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: embedUrl.trim(), title: embedTitle.trim() || undefined, categoryId: embedCategoryId }),
    });
    setShowEmbedLink(false);
    setEmbedUrl('');
    setEmbedTitle('');
    fetchAllData();
  };
  const addExperience = async () => {
    await fetch('/api/portfolio/experience', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newExp, order: experiences.length }) });
    setShowAddExperience(false); setNewExp({ role: '', company: '', location: '', startDate: '', endDate: '', type: 'Full Time' }); fetchAllData();
  };
  const deleteExperience = async (id: string) => { await fetch('/api/portfolio/experience', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchAllData(); };

  const addClient = async () => {
    await fetch('/api/portfolio/client', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newClient, order: clients.length }) });
    setShowAddClient(false); setNewClient({ name: '', logo: '', link: '' }); fetchAllData();
  };
  const deleteClient = async (id: string) => { await fetch('/api/portfolio/client', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchAllData(); };
  const handleClientLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
    const data = await res.json(); setNewClient(prev => ({ ...prev, logo: data.url }));
  };

  const removeCutout = async () => {
    await fetch('/api/portfolio', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cutoutImage: '' }) });
    fetchAllData();
  };

  const countByType = (cat: Category, type: string) => cat.items.filter(i => i.type === type).length;

  return (
    <div ref={mainRef} className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMediaUpload} />
      <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
      <input ref={cutoutInputRef} type="file" accept="image/*" className="hidden" onChange={handleCutoutUpload} />
      <input ref={clientLogoInputRef} type="file" accept="image/*" className="hidden" onChange={handleClientLogoUpload} />

      {/* ========== MEDIA/VIDEO MODAL ========== */}
      {mediaModal && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center" onClick={() => setMediaModal(null)}>
          {/* Close button */}
          <button onClick={() => setMediaModal(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <X size={20} className="text-white" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white/10 rounded-full text-white/60 text-xs font-medium">
            {mediaModal.index + 1} / {mediaModal.items.length}
          </div>

          {/* Prev button */}
          {mediaModal.index > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setEmbedLoaded(false); setEmbedPlayClicked(false); const i = mediaModal.index - 1; const item = mediaModal.items[i]; setMediaModal({ ...mediaModal, type: item.type, url: item.url, thumbnail: item.thumbnail, title: item.title, index: i }); }} className="absolute left-2 sm:left-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          )}

          {/* Next button */}
          {mediaModal.index < mediaModal.items.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setEmbedLoaded(false); setEmbedPlayClicked(false); const i = mediaModal.index + 1; const item = mediaModal.items[i]; setMediaModal({ ...mediaModal, type: item.type, url: item.url, thumbnail: item.thumbnail, title: item.title, index: i }); }} className="absolute right-2 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          )}

          {/* Content area with swipe */}
          <div className="max-w-5xl w-full max-h-[90vh] flex items-center justify-center p-4 sm:p-8"
            onClick={e => e.stopPropagation()}
            onTouchStart={(e) => { (e.currentTarget as HTMLDivElement).dataset.touchStartX = String(e.touches[0].clientX); }}
            onTouchEnd={(e) => {
              const startX = Number((e.currentTarget as HTMLDivElement).dataset.touchStartX || 0);
              const diff = e.changedTouches[0].clientX - startX;
              if (Math.abs(diff) > 60) {
                setEmbedLoaded(false);
                setEmbedPlayClicked(false);
                if (diff < 0 && mediaModal.index < mediaModal.items.length - 1) {
                  const i = mediaModal.index + 1; const item = mediaModal.items[i];
                  setMediaModal({ ...mediaModal, type: item.type, url: item.url, thumbnail: item.thumbnail, title: item.title, index: i });
                } else if (diff > 0 && mediaModal.index > 0) {
                  const i = mediaModal.index - 1; const item = mediaModal.items[i];
                  setMediaModal({ ...mediaModal, type: item.type, url: item.url, thumbnail: item.thumbnail, title: item.title, index: i });
                }
              }
            }}
          >
            {mediaModal.type === 'embed' ? (
              <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black/50 shadow-2xl relative">
                {/* Click-to-play: show thumbnail first, load iframe only on click */}
                {!embedPlayClicked ? (
                  <div
                    className="absolute inset-0 z-[2] cursor-pointer"
                    onClick={() => setEmbedPlayClicked(true)}
                  >
                    {mediaModal.thumbnail ? (
                      <img src={mediaModal.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/60">
                        <LinkIcon size={48} className="text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600/90 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-600/30">
                        <Play size={32} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Thumbnail while iframe is loading */}
                    {mediaModal.thumbnail && !embedLoaded && (
                      <div className="absolute inset-0 z-[1]">
                        <img src={mediaModal.thumbnail} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      </div>
                    )}
                    <iframe
                      key={mediaModal.url + '&autoplay=1'}
                      src={mediaModal.url + '&autoplay=1'}
                      className="w-full h-full"
                      style={{ opacity: embedLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      frameBorder="0"
                      referrerPolicy="strict-origin-when-cross-origin"
                      onLoad={() => setEmbedLoaded(true)}
                    />
                  </>
                )}
              </div>
            ) : mediaModal.type === 'video' ? (
              <video key={mediaModal.url} src={mediaModal.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-2xl" />
            ) : (
              <img key={mediaModal.url} src={mediaModal.url} alt={mediaModal.title} className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
            )}
          </div>

          {/* Title */}
          {mediaModal.title && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/60 rounded-xl text-white/80 text-sm max-w-md truncate">
              {mediaModal.title}
            </div>
          )}
        </div>
      )}

      {/* ========== QR MODAL ========== */}
      {showQr && info?.zaloQr && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQr(false)}>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 text-center max-w-sm" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQr(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
              <X size={20} className="text-white" />
            </button>
            <img src={info.zaloQr} alt="Zalo QR" className="w-64 h-64 mx-auto rounded-xl mb-4" />
            <p className="text-white/60 text-sm">Quét mã Zalo để kết bạn</p>
            <a href={info.zaloQr} download="zalo-qr.jpg" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm hover:bg-green-500/20">
              Tải QR về
            </a>
          </div>
        </div>
      )}

      {/* ========== LOGIN MODAL ========== */}
      {showLogin && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-2">Chế độ Admin</h3>
            <p className="text-white/50 text-sm mb-6">Nhập mật khẩu để quản lý</p>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Mật khẩu..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 mb-3" />
            {loginError && <p className="text-red-400 text-sm mb-3">{loginError}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowLogin(false); setPassword(''); setLoginError(''); }} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70">Hủy</button>
              <button onClick={handleLogin} className="flex-1 px-4 py-2.5 bg-green-500 text-black font-semibold rounded-xl hover:bg-green-400">Đăng nhập</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== EMBED LINK MODAL ========== */}
      {showEmbedLink && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon size={18} className="text-purple-400" />
              <h3 className="text-lg font-bold">Thêm Video Link</h3>
            </div>
            <p className="text-white/50 text-sm mb-5">Dán link YouTube hoặc TikTok vào bên dưới</p>
            <input value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} placeholder="https://youtube.com/watch?v=... hoặc https://tiktok.com/..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 mb-3 text-sm" />
            <input value={embedTitle} onChange={e => setEmbedTitle(e.target.value)} placeholder="Tên video (tuỳ chọn)" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 mb-4 text-sm" />
            {/* Preview hint */}
            {embedUrl && (
              <div className="mb-4 p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                {embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be') ? (
                  <p className="text-purple-400 text-xs flex items-center gap-1.5"><Video size={12} /> YouTube video sẽ được nhúng</p>
                ) : embedUrl.includes('tiktok.com') ? (
                  <p className="text-[#00f2ea] text-xs flex items-center gap-1.5"><Video size={12} /> TikTok video sẽ được nhúng</p>
                ) : (
                  <p className="text-white/40 text-xs">Hỗ trợ link YouTube và TikTok</p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowEmbedLink(false); setEmbedUrl(''); setEmbedTitle(''); }} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70">Hủy</button>
              <button onClick={addEmbedLink} disabled={!embedUrl.trim()} className="flex-1 px-4 py-2.5 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-400 disabled:opacity-40">Thêm Link</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== HERO ========== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        {/* GIANT NAME with water-reflection shadow (downward) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <h1
            className="text-[18vw] sm:text-[14vw] font-black tracking-wider whitespace-nowrap"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1px rgba(255,255,255,0.06)',
              textShadow: '0 0 80px rgba(74,222,128,0.08), 0 20px 60px rgba(0,0,0,0.8), 0 40px 100px rgba(74,222,128,0.05)',
            }}
          >
            {info?.name || 'PHAM VAN MINH'}
          </h1>
          {/* Water reflection - inverted faded copy below */}
          <div
            className="absolute top-1/2 left-0 right-0 flex items-center justify-center"
            style={{
              transform: 'scaleY(-1)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, transparent 60%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, transparent 60%)',
            }}
          >
            <h1
              className="text-[18vw] sm:text-[14vw] font-black tracking-wider whitespace-nowrap"
              style={{
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.03)',
              }}
            >
              {info?.name || 'PHAM VAN MINH'}
            </h1>
          </div>
        </div>

        {/* Central content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-20 pb-10">
          {/* Container for circle + cutout overlay */}
          <div className="relative mb-6">
            {/* Circular text + Profile circle - base layer */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 z-[1]">
              <svg viewBox="0 0 400 400" className="w-full h-full animate-[spin_30s_linear_infinite]">
                <defs><path id="cp" d="M 200,200 m -165,0 a 165,165 0 1,1 330,0 a 165,165 0 1,1 -330,0" /></defs>
                <text fill="#4ade80" fontSize="16" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="4">
                  <textPath href="#cp">CREATIVE SOCIAL MEDIA • DESIGN &amp; EDITER VIDEO • VIDEO AI • BDS • BEAUTY • XÂY KÊNH • DAILY VLOG • STORY •{' '}</textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden border-2 border-green-500/20 bg-green-500/5">
                  {info?.profileImage ? (
                    <img src={info.profileImage} alt={info.name} className="w-full h-full object-cover" style={{ objectPosition: `${profilePosXVal}% ${profilePosYVal}%`, transform: `scale(${profileScaleVal / 100})` }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-green-400/60 text-4xl font-bold">M</div>
                  )}
                  {isAdmin && (
                    <button onClick={() => profileInputRef.current?.click()} disabled={uploadingProfile} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-1">
                      <Upload size={20} className="text-green-400" /><span className="text-green-400 text-[10px]">Ảnh tròn</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cutout image ON TOP of circle, BELOW text - overlay layer */}
            {info?.cutoutImage && (
              <div className="absolute top-0 left-1/2 z-[2] pointer-events-none" style={{ filter: `drop-shadow(0 10px 30px rgba(0,0,0,0.5))`, transform: `translateX(-50%) translateY(${cutoutPosYVal}px)` }}>
                <div className="relative" style={{ transform: `scale(${cutoutScaleVal / 100})`, transformOrigin: 'bottom center' }}>
                  <img src={info.cutoutImage} alt="" className="h-[350px] sm:h-[450px] lg:h-[520px] w-auto object-contain object-bottom pointer-events-auto" />
                  {/* Feather gradient at bottom */}
                  <div
                    className="absolute bottom-0 left-0 right-0 pointer-events-none"
                    style={{
                      height: `${featherSlider}%`,
                      background: `linear-gradient(to top, #0a0a0a 0%, transparent 100%)`,
                    }}
                  />
                  {isAdmin && (
                    <button onClick={removeCutout} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-red-500/30 transition-all pointer-events-auto">
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Text layer - highest z, never covered by cutout */}
          <div className="relative z-[3]">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2">{info?.name || 'PHAM VĂN MINH'}</h2>
            <p className="text-green-400 text-sm sm:text-base font-medium tracking-wide mb-3">{info?.title}</p>
            <p className="text-white/40 text-xs sm:text-sm max-w-md mx-auto">{info?.tagline}</p>
          </div>

          <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="mt-8 flex flex-col items-center gap-1 text-white/20 hover:text-green-400 transition-colors">
            <span className="text-[10px] tracking-widest uppercase">Vuốt xuống</span>
            <ChevronDown size={18} className="animate-bounce" />
          </button>
        </div>

        {/* Menu button only - no Admin button visible */}
        <div className="fixed top-4 left-4 z-50">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="fixed top-14 left-4 z-50 bg-[#111]/95 backdrop-blur-md border border-white/10 rounded-2xl py-3 min-w-[180px]">
            {[{ id: 'about', label: 'Giới thiệu' }, { id: 'experience', label: 'Kinh nghiệm' }, { id: 'portfolio', label: 'Portfolio' }, { id: 'clients', label: 'Khách hàng' }, { id: 'contact', label: 'Liên hệ' }].map(item => (
              <button key={item.id} onClick={() => { setMenuOpen(false); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full text-left px-5 py-2.5 text-sm text-white/60 hover:text-green-400 hover:bg-white/5">{item.label}</button>
            ))}
          </nav>
        )}
      </section>

      {/* ABOUT */}
      <section id="about" className="fade-section py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass glass-hover luxury-border rounded-3xl p-6 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 glass-sm rounded-lg flex items-center justify-center"><Award size={16} className="text-green-400" /></div>
              <h3 className="text-xs font-bold tracking-[0.2em] text-green-400 uppercase">Creative DNA</h3>
              {isAdmin && <button onClick={() => { setEditingInfo(!editingInfo); setEditInfo(info || {}); }} className="ml-auto p-1.5 hover:bg-white/5 rounded-lg"><Edit3 size={14} className="text-white/40" /></button>}
            </div>
            {editingInfo ? (
              <div className="space-y-4">
                <input value={editInfo.tagline || ''} onChange={e => setEditInfo({ ...editInfo, tagline: e.target.value })} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50" placeholder="Tagline" />
                <textarea value={editInfo.bio || ''} onChange={e => setEditInfo({ ...editInfo, bio: e.target.value })} rows={3} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50 resize-none" placeholder="Bio" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={editInfo.name || ''} onChange={e => setEditInfo({ ...editInfo, name: e.target.value })} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500/50" placeholder="Tên" />
                  <input value={editInfo.email || ''} onChange={e => setEditInfo({ ...editInfo, email: e.target.value })} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500/50" placeholder="Email" />
                  <input value={editInfo.phone || ''} onChange={e => setEditInfo({ ...editInfo, phone: e.target.value })} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500/50" placeholder="Phone" />
                  <input value={editInfo.location || ''} onChange={e => setEditInfo({ ...editInfo, location: e.target.value })} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500/50" placeholder="Location" />
                  <input value={editInfo.zaloLink || ''} onChange={e => setEditInfo({ ...editInfo, zaloLink: e.target.value })} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500/50" placeholder="Link Zalo" />
                  <input value={editInfo.behanceUrl || ''} onChange={e => setEditInfo({ ...editInfo, behanceUrl: e.target.value })} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500/50" placeholder="Behance URL" />
                </div>
                <button onClick={saveInfo} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400"><Save size={14} /> Lưu</button>
              </div>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-bold text-white mb-4">{info?.tagline}</p>
                <p className="text-white/60 leading-relaxed text-sm sm:text-base">{info?.bio}</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="fade-section py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass glass-hover luxury-border rounded-3xl p-6 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 glass-sm rounded-lg flex items-center justify-center"><Briefcase size={16} className="text-green-400" /></div>
              <h3 className="text-xs font-bold tracking-[0.2em] text-green-400 uppercase">Experience</h3>
              {isAdmin && <button onClick={() => setShowAddExperience(true)} className="ml-auto p-1.5 hover:bg-white/5 rounded-lg"><Plus size={14} className="text-green-400" /></button>}
            </div>
            <div className="space-y-6">
              {experiences.map(exp => (
                <div key={exp.id} className="relative pl-6 border-l border-white/10 group">
                  <div className="absolute left-0 top-1.5 w-2 h-2 -translate-x-[5px] rounded-full bg-green-400" />
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                    <div><h4 className="font-bold text-white text-sm">{exp.role}</h4><p className="text-green-400 text-sm">{exp.company}</p><p className="text-white/40 text-xs mt-1">{exp.location}</p></div>
                    <div className="text-right shrink-0"><p className="text-white/50 text-xs">{exp.startDate} — {exp.endDate}</p><span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-green-500/10 text-green-400 rounded-full border border-green-500/20">{exp.type}</span></div>
                  </div>
                  {isAdmin && <button onClick={() => deleteExperience(exp.id)} className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded"><Trash2 size={12} className="text-red-400" /></button>}
                </div>
              ))}
            </div>
            {isAdmin && showAddExperience && (
              <div className="mt-6 p-4 glass-sm rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={newExp.role} onChange={e => setNewExp({ ...newExp, role: e.target.value })} placeholder="Vị trí" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                  <input value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} placeholder="Công ty" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                  <input value={newExp.location} onChange={e => setNewExp({ ...newExp, location: e.target.value })} placeholder="Địa điểm" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                  <input value={newExp.startDate} onChange={e => setNewExp({ ...newExp, startDate: e.target.value })} placeholder="Bắt đầu" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                  <input value={newExp.endDate} onChange={e => setNewExp({ ...newExp, endDate: e.target.value })} placeholder="Kết thúc" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                  <input value={newExp.type} onChange={e => setNewExp({ ...newExp, type: e.target.value })} placeholder="Loại" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddExperience(false)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60">Hủy</button>
                  <button onClick={addExperience} className="px-4 py-2 bg-green-500 text-black font-semibold rounded-lg text-sm hover:bg-green-400">Thêm</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PORTFOLIO - categorized */}
      <section id="portfolio" className="fade-section py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 glass-sm rounded-lg flex items-center justify-center"><Eye size={16} className="text-green-400" /></div>
            <h3 className="text-xs font-bold tracking-[0.2em] text-green-400 uppercase">Portfolio & Sản phẩm</h3>
            {isAdmin && <button onClick={() => setShowAddCategory(true)} className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs font-medium hover:bg-green-500/20"><Plus size={14} /> Tạo danh mục</button>}
          </div>

          {isAdmin && showAddCategory && (
            <div className="mb-8 p-5 glass-sm rounded-2xl space-y-3">
              <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2"><Tag size={14} /> Tạo danh mục mới</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value, slug: generateSlug(e.target.value) })} placeholder="Tên danh mục (VD: Video Vlogs)" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                <input value={newCategory.icon} onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })} placeholder="Icon emoji" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                <select value={newCategory.type} onChange={e => setNewCategory({ ...newCategory, type: e.target.value })} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50">
                  <option value="video" className="bg-[#1a1a1a]">Video</option>
                  <option value="image" className="bg-[#1a1a1a]">Ảnh</option>
                  <option value="mixed" className="bg-[#1a1a1a]">Hỗn hợp</option>
                </select>
              </div>
              <input value={newCategory.description} onChange={e => setNewCategory({ ...newCategory, description: e.target.value })} placeholder="Mô tả (tuỳ chọn)" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50" />
              <div className="flex gap-2">
                <button onClick={() => { setShowAddCategory(false); setNewCategory({ name: '', slug: '', icon: '📁', type: 'mixed', description: '' }); }} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60">Hủy</button>
                <button onClick={addCategory} className="px-4 py-2 bg-green-500 text-black font-semibold rounded-lg text-sm hover:bg-green-400">Tạo</button>
              </div>
            </div>
          )}

          {categories.length > 0 ? (
            <div className="space-y-10">
              {categories.map(cat => (
                <div key={cat.id} className="glass glass-hover luxury-border rounded-3xl p-5 sm:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">{cat.icon || '📁'}</span>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white">{cat.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        {countByType(cat, 'video') > 0 && <span className="flex items-center gap-1 text-xs text-blue-400"><Video size={12} />{countByType(cat, 'video')} video</span>}
                        {countByType(cat, 'embed') > 0 && <span className="flex items-center gap-1 text-xs text-purple-400"><LinkIcon size={12} />{countByType(cat, 'embed')} link</span>}
                        {countByType(cat, 'image') > 0 && <span className="flex items-center gap-1 text-xs text-green-400"><ImageIcon size={12} />{countByType(cat, 'image')} ảnh</span>}
                        {cat.items.length === 0 && <span className="text-xs text-white/20">Chưa có file</span>}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => openUploadForCategory(cat.id)} disabled={uploading} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs hover:bg-green-500/20 disabled:opacity-50"><Upload size={12} /> Upload</button>
                        <button onClick={() => openEmbedForCategory(cat.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-xs hover:bg-purple-500/20"><LinkIcon size={12} /> Link</button>
                        <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} className="text-red-400/50" /></button>
                      </div>
                    )}
                  </div>
                  {cat.description && <p className="text-white/40 text-sm mb-4">{cat.description}</p>}
                  {cat.items.length > 0 ? (
                    <div className={`grid gap-3 ${cat.items.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
                      {cat.items.map(item => (
                        <div key={item.id} className="group relative glass-sm glass-hover rounded-xl overflow-hidden cursor-pointer" onClick={() => openMediaModal(item, cat.items.map(i => ({ type: i.type, url: i.url, thumbnail: i.thumbnail || '', title: i.title || '' })))}>
                          {item.type === 'embed' ? (
                            <div className="relative aspect-video overflow-hidden bg-black/40">
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-purple-500/10">
                                  <LinkIcon size={24} className="text-purple-400/50" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                                <div className="w-10 h-10 bg-red-600/90 rounded-full flex items-center justify-center"><Play size={18} className="text-white ml-0.5" /></div>
                              </div>
                              {item.description && item.description.includes('youtube') && (
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-600/80 rounded text-[8px] text-white font-bold">YouTube</div>
                              )}
                              {item.description && item.description.includes('tiktok') && (
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#00f2ea]/80 rounded text-[8px] text-black font-bold">TikTok</div>
                              )}
                            </div>
                          ) : item.type === 'video' ? (
                            <div className="relative aspect-video overflow-hidden">
                              <video src={item.url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                                <div className="w-10 h-10 bg-green-500/80 rounded-full flex items-center justify-center"><Play size={18} className="text-black ml-0.5" /></div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative aspect-square overflow-hidden">
                              <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          <div className="p-2.5"><p className="text-xs font-medium text-white truncate">{item.title}</p></div>
                          {isAdmin && (
                            <button onClick={e => { e.stopPropagation(); deleteMedia(item.id); }} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/30 transition-all">
                              <Trash2 size={12} className="text-red-400" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 glass-sm rounded-2xl border border-dashed border-white/10">
                      <FolderOpen size={28} className="text-white/10 mx-auto mb-2" />
                      <p className="text-white/20 text-sm">Chưa có file</p>
                      {isAdmin && (
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <button onClick={() => openUploadForCategory(cat.id)} className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs hover:bg-green-500/20">Upload</button>
                          <button onClick={() => openEmbedForCategory(cat.id)} className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-xs hover:bg-purple-500/20">Link</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass rounded-3xl border border-dashed border-white/10">
              <FolderOpen size={40} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-lg font-medium mb-2">Chưa có danh mục</p>
              {isAdmin && <button onClick={() => setShowAddCategory(true)} className="px-5 py-2.5 bg-green-500 text-black font-semibold rounded-xl hover:bg-green-400">Tạo danh mục</button>}
            </div>
          )}
        </div>
      </section>

      {/* TOP CLIENTS */}
      <section id="clients" className="fade-section py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass glass-hover luxury-border rounded-3xl p-6 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 glass-sm rounded-lg flex items-center justify-center"><Award size={16} className="text-green-400" /></div>
              <h3 className="text-xs font-bold tracking-[0.2em] text-green-400 uppercase">Top Clients</h3>
              {isAdmin && <button onClick={() => setShowAddClient(true)} className="ml-auto p-1.5 hover:bg-white/5 rounded-lg"><Plus size={14} className="text-green-400" /></button>}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {clients.map(client => {
                const Wrapper = client.link ? 'a' : 'div';
                const wrapperProps = client.link ? { href: client.link, target: '_blank', rel: 'noopener noreferrer' } : {};
                return (
                    <Wrapper key={client.id} {...wrapperProps} className="group relative glass-sm glass-hover rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                    {client.logo ? (
                      <img src={client.logo} alt={client.name} className="w-12 h-12 object-contain rounded-xl border border-white/10" />
                    ) : (
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center"><span className="text-green-400/70 text-xs font-bold">{client.name.substring(0, 2).toUpperCase()}</span></div>
                    )}
                    <span className="text-white/50 text-[11px] font-medium text-center">{client.name}</span>
                    {client.link && <ExternalLink size={10} className="text-green-400/30" />}
                    {isAdmin && <button onClick={e => { e.preventDefault(); e.stopPropagation(); deleteClient(client.id); }} className="absolute -top-1 -right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"><Trash2 size={10} className="text-red-400" /></button>}
                  </Wrapper>
                );
              })}
            </div>
            {isAdmin && showAddClient && (
              <div className="mt-6 p-4 glass-sm rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-green-400">Thêm Client</h4>
                <div className="space-y-3">
                  <input value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} placeholder="Tên client" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                  <input value={newClient.link} onChange={e => setNewClient({ ...newClient, link: e.target.value })} placeholder="Link (VD: https://tiktok.com/@username)" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                  <div className="flex gap-2">
                    <button onClick={() => clientLogoInputRef.current?.click()} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 flex items-center gap-2"><Upload size={14} /> Logo</button>
                    {newClient.logo && <span className="text-green-400 text-xs self-center">✓ Logo</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowAddClient(false); setNewClient({ name: '', logo: '', link: '' }); }} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60">Hủy</button>
                  <button onClick={addClient} className="px-4 py-2 bg-green-500 text-black font-semibold rounded-lg text-sm hover:bg-green-400">Thêm</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="fade-section py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass glass-hover luxury-border rounded-3xl p-6 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 glass-sm rounded-lg flex items-center justify-center"><Mail size={16} className="text-green-400" /></div>
              <h3 className="text-xs font-bold tracking-[0.2em] text-green-400 uppercase">Contact</h3>
            </div>
            <div className="flex flex-wrap gap-6 sm:gap-8">
              <a href={`mailto:${info?.email}`} className="flex items-center gap-3 text-white/60 hover:text-green-400 transition-colors group">
                <div className="w-10 h-10 glass-sm rounded-xl flex items-center justify-center group-hover:bg-green-500/20"><Mail size={18} className="text-green-400" /></div>
                <span className="text-sm">{info?.email}</span>
              </a>
              <a href={`tel:${info?.phone}`} className="flex items-center gap-3 text-white/60 hover:text-green-400 transition-colors group">
                <div className="w-10 h-10 glass-sm rounded-xl flex items-center justify-center group-hover:bg-green-500/20"><Phone size={18} className="text-green-400" /></div>
                <span className="text-sm">{info?.phone}</span>
              </a>
              <div className="flex items-center gap-3 text-white/60">
                <div className="w-10 h-10 glass-sm rounded-xl flex items-center justify-center"><MapPin size={18} className="text-green-400" /></div>
                <span className="text-sm">{info?.location}</span>
              </div>
              {/* ZALO */}
              {info?.zaloIcon && (
                <a href={info.zaloLink || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/60 hover:text-green-400 transition-colors group">
                  <div className="w-10 h-10 glass-sm rounded-xl flex items-center justify-center group-hover:bg-green-500/20 overflow-hidden p-1.5">
                    <img src={info.zaloIcon} alt="Zalo" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-sm">Zalo</span>
                </a>
              )}
              {/* ZALO QR - small, click to enlarge */}
              {info?.zaloQr && (
                <button onClick={() => setShowQr(true)} className="flex items-center gap-3 text-white/60 hover:text-green-400 transition-colors group">
                  <div className="w-10 h-10 glass-sm rounded-xl flex items-center justify-center group-hover:bg-green-500/20 overflow-hidden p-1 hover:scale-110 transition-transform">
                    <img src={info.zaloQr} alt="Zalo QR" className="w-full h-full object-contain rounded" />
                  </div>
                  <span className="text-sm flex items-center gap-1"><QrCode size={12} /> Quét QR</span>
                </button>
              )}

            </div>
          </div>
        </div>
      </section>

      <footer className="fade-section py-8 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p onClick={handleFooterClick} className="text-white/20 text-xs cursor-default select-none hover:text-white/30 transition-colors">&copy; {new Date().getFullYear()} {info?.name}</p>
        </div>
      </footer>

      {/* ========== ADMIN PANEL ========== */}
      {isAdmin && (
        <>
          {/* Mobile: bottom sheet / Desktop: side panel */}
          <div data-admin-panel className="fixed z-50 sm:bottom-4 sm:right-4 sm:max-w-[280px] bottom-0 left-0 right-0 sm:left-auto">
            <div className="glass luxury-border sm:rounded-2xl rounded-t-2xl p-4 shadow-2xl shadow-green-500/5 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Settings size={14} className="text-green-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-green-400 text-xs font-bold tracking-wider">ADMIN</span>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={saveAllSettings} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-black font-bold text-xs rounded-lg hover:bg-green-400 disabled:opacity-50 transition-all">
                    <Save size={12} /> {saving ? 'Đang lưu...' : 'LƯU'}
                  </button>
                  <button onClick={() => setIsAdmin(false)} className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all sm:hidden">
                    <X size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {/* Upload ảnh tách nền */}
                <button onClick={() => cutoutInputRef.current?.click()} disabled={uploadingCutout} className="w-full flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs font-medium hover:bg-green-500/20 disabled:opacity-50">
                  <Upload size={14} /> {uploadingCutout ? 'Đang tải...' : 'Upload ảnh tách nền (to)'}
                </button>
                {/* Feather slider */}
                {info?.cutoutImage && (
                  <div className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/40 text-[10px]">Độ feather chân ảnh</span>
                      <span className="text-green-400 text-[10px] font-medium">{featherSlider}%</span>
                    </div>
                    <input type="range" min={0} max={80} value={featherSlider} onChange={e => updateFeather(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-green-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400" />
                  </div>
                )}
                {/* Cutout scale slider */}
                {info?.cutoutImage && (
                  <div className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/40 text-[10px]">Độ to ảnh tách nền</span>
                      <span className="text-green-400 text-[10px] font-medium">{cutoutScaleVal}%</span>
                    </div>
                    <input type="range" min={50} max={200} value={cutoutScaleVal} onChange={e => updateCutoutScale(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-green-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400" />
                  </div>
                )}
                {/* Cutout position Y slider */}
                {info?.cutoutImage && (
                  <div className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/40 text-[10px]">Vị trí lên/xuống</span>
                      <span className="text-green-400 text-[10px] font-medium">{cutoutPosYVal}px</span>
                    </div>
                    <input type="range" min={-200} max={200} value={cutoutPosYVal} onChange={e => updateCutoutPosY(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-green-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400" />
                  </div>
                )}
                <button onClick={() => profileInputRef.current?.click()} disabled={uploadingProfile} className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs hover:bg-white/10 disabled:opacity-50">
                  <Upload size={14} /> Đổi ảnh tròn
                </button>
                {/* Profile image INSIDE circle position/scale sliders */}
                {info?.profileImage && (
                  <>
                    <div className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/40 text-[10px]">Ảnh tròn: Trái/Phải</span>
                        <span className="text-green-400 text-[10px] font-medium">{profilePosXVal}%</span>
                      </div>
                      <input type="range" min={0} max={100} value={profilePosXVal} onChange={e => updateProfilePosX(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-green-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400" />
                    </div>
                    <div className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/40 text-[10px]">Ảnh tròn: Lên/Xuống</span>
                        <span className="text-green-400 text-[10px] font-medium">{profilePosYVal}%</span>
                      </div>
                      <input type="range" min={0} max={100} value={profilePosYVal} onChange={e => updateProfilePosY(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-green-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400" />
                    </div>
                    <div className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/40 text-[10px]">Ảnh tròn: Phóng to</span>
                        <span className="text-green-400 text-[10px] font-medium">{profileScaleVal}%</span>
                      </div>
                      <input type="range" min={100} max={300} value={profileScaleVal} onChange={e => updateProfileScale(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-green-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400" />
                    </div>
                  </>
                )}
                <button onClick={() => { setEditingInfo(true); setEditInfo(info || {}); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs hover:bg-white/10">
                  <Edit3 size={14} /> Chỉnh sửa info
                </button>
                {/* Desktop: exit admin button */}
                <button onClick={() => setIsAdmin(false)} className="hidden sm:flex w-full items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs hover:bg-red-500/20">
                  <Lock size={14} /> Thoát Admin
                </button>
              </div>
            </div>
          </div>
          {/* Mobile backdrop to close admin */}
          <div className="fixed inset-0 z-40 bg-black/30 sm:hidden" onClick={() => setIsAdmin(false)} />
        </>
      )}
    </div>
  );
}
