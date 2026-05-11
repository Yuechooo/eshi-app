import { useState, useRef } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { useCommunity } from '../../contexts/CommunityContext'

const MOCK_POSTS = [
  {
    id: 'mock-1',
    userNameEn: 'Mei',
    userNameZh: '小梅',
    userInitial: 'M',
    userColor: 'bg-rose-100 text-rose-600',
    timeEn: 'Today 8:14 AM',
    timeZh: '今天 08:14',
    locationEn: 'Shanghai',
    locationZh: '上海',
    wellnessTagKey: 'tagWarming',
    imageUrl: 'https://images.unsplash.com/photo-1766761562530-c8dd12c96d9a?auto=format&fit=crop&w=600&q=85',
    mediaType: 'image',
    titleEn: 'Pumpkin Millet Porridge',
    titleZh: '南瓜小米粥',
    textEn: 'Made this after a hectic morning meeting. The natural sweetness of the pumpkin is so grounding — added a pinch of ginger and a soft-boiled egg on the side.',
    textZh: '忙碌的早会结束后做的。南瓜的甜味很让人安定，加了一点姜末，配了一个溏心蛋。',
    tags: ['tagWarming', 'tagQuick', 'tagSeasonal'],
    comments: [
      { id: 'c1', userEn: 'Lin', userZh: '林', textEn: 'This looks so cozy and warm!', textZh: '好暖好治愈！', userColor: 'bg-teal-100 text-teal-700' },
    ],
  },
  {
    id: 'mock-2',
    userNameEn: 'Yuna',
    userNameZh: '云雅',
    userInitial: 'Y',
    userColor: 'bg-sky-100 text-sky-600',
    timeEn: 'Today 12:05 PM',
    timeZh: '今天 12:05',
    locationEn: null,
    locationZh: null,
    wellnessTagKey: 'tagLight',
    imageUrl: 'https://images.unsplash.com/photo-1770966666356-3f022a79b8ea?auto=format&fit=crop&w=600&q=85',
    mediaType: 'image',
    titleEn: 'Steamed Egg with Greens',
    titleZh: '蒸蛋配时蔬',
    textEn: 'Simple lunch today — silky steamed egg with some blanched spinach and a light drizzle of soy sauce. Nourishing and easy on the stomach.',
    textZh: '今天午餐很简单——嫩滑的蒸蛋配焯水菠菜，淋一点酱油。清淡又滋补，脾胃很舒服。',
    tags: ['tagLight', 'tagDigestionFriendly', 'tagQuick'],
    comments: [
      { id: 'c2', userEn: 'Zhao', userZh: '赵', textEn: 'Steamed egg is so underrated!', textZh: '蒸蛋真的被低估了！', userColor: 'bg-purple-100 text-purple-600' },
      { id: 'c3', userEn: 'Mei', userZh: '小梅', textEn: "Mine always turns out lumpy... what's your trick?", textZh: '我蒸出来总是有气泡，你怎么做的？', userColor: 'bg-rose-100 text-rose-600' },
    ],
  },
  {
    id: 'mock-3',
    userNameEn: 'Kai',
    userNameZh: '凯',
    userInitial: 'K',
    userColor: 'bg-amber-100 text-amber-700',
    timeEn: 'Today 7:30 PM',
    timeZh: '今天 19:30',
    locationEn: 'Rainy evening',
    locationZh: '雨天傍晚',
    wellnessTagKey: 'tagNourishing',
    imageUrl: 'https://images.unsplash.com/photo-1672667509988-baade9ade083?auto=format&fit=crop&w=600&q=85',
    mediaType: 'image',
    titleEn: 'Ginger Chicken Soup on a Rainy Day',
    titleZh: '雨天姜汁鸡汤',
    textEn: 'Rainy days call for slow-simmered broth. Used fresh ginger, red dates, and a whole chicken. The house smelled amazing for hours.',
    textZh: '下雨天就想喝汤。用了新鲜姜块、红枣和整只鸡，慢炖两个小时。满屋子都是香气。',
    tags: ['tagWarming', 'tagNourishing'],
    comments: [],
  },
  {
    id: 'mock-4',
    userNameEn: 'Shan',
    userNameZh: '珊',
    userInitial: 'S',
    userColor: 'bg-green-100 text-green-700',
    timeEn: 'Today 6:45 PM',
    timeZh: '今天 18:45',
    locationEn: null,
    locationZh: null,
    wellnessTagKey: 'tagProteinRich',
    imageUrl: 'https://images.unsplash.com/photo-1765295218809-784d6c2fe39c?auto=format&fit=crop&w=600&q=85',
    mediaType: 'image',
    titleEn: 'Post-Workout Tofu Bowl',
    titleZh: '运动后豆腐碗',
    textEn: 'Quick protein bowl after a 40-minute run. Firm tofu, cucumber, sesame oil, and a sprinkle of scallions. Simple and restorative.',
    textZh: '跑步40分钟后的快手蛋白餐。老豆腐、黄瓜、麻油、葱花。简单但很有恢复感。',
    tags: ['tagProteinRich', 'tagLight', 'tagWorkoutSupport'],
    comments: [
      { id: 'c4', userEn: 'Yuna', userZh: '云雅', textEn: 'The sesame oil pairing is genius!', textZh: '麻油这个组合绝了！', userColor: 'bg-sky-100 text-sky-600' },
    ],
  },
]

const TAG_COLOR = {
  tagWarming: 'bg-orange-50 text-orange-600 border-orange-100',
  tagCooling: 'bg-blue-50 text-blue-600 border-blue-100',
  tagQuick: 'bg-lime-50 text-lime-700 border-lime-100',
  tagNourishing: 'bg-amber-50 text-amber-700 border-amber-100',
  tagProteinRich: 'bg-rose-50 text-rose-600 border-rose-100',
  tagLight: 'bg-teal-50 text-teal-600 border-teal-100',
  tagDigestionFriendly: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  tagSeasonal: 'bg-primary-soft text-primary border-primary/20',
  tagLowOil: 'bg-green-50 text-green-700 border-green-100',
  tagBusyDay: 'bg-gray-50 text-gray-600 border-gray-100',
  tagFatigueSupport: 'bg-purple-50 text-purple-600 border-purple-100',
  tagWorkoutSupport: 'bg-indigo-50 text-indigo-600 border-indigo-100',
}

const COMMUNITY_TAGS = [
  'tagWarming', 'tagLight', 'tagQuick', 'tagNourishing',
  'tagProteinRich', 'tagSeasonal', 'tagBusyDay', 'tagWorkoutSupport',
]

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function DeleteConfirmModal({ onConfirm, onCancel, t }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative w-full max-w-[17rem] rounded-[1.5rem] border border-white/90 bg-bg shadow-popover ring-1 ring-ink/[0.04] px-6 py-6">
        <p className="text-sm font-semibold text-ink text-center mb-5 leading-snug">
          {t('communityDeleteConfirm')}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-2xl border border-ink/10 text-sm text-muted font-medium hover:text-ink transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-2xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 active:bg-rose-700 transition-colors"
          >
            {t('communityDeleteBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}

function UserAvatar({ initial, color, size = 'w-9 h-9 text-sm' }) {
  return (
    <div className={`${size} ${color} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>
      {initial}
    </div>
  )
}

function PostImage({ post, title }) {
  const [failed, setFailed] = useState(false)
  if (!post.imageUrl || failed) {
    return (
      <div className="w-full bg-gradient-to-br from-[#f0ede6] to-[#e8e2d8] flex items-center justify-center text-muted text-sm" style={{ height: 220 }}>
        {title}
      </div>
    )
  }
  if (post.mediaType === 'video' && post.videoUrl) {
    return (
      <video
        src={post.videoUrl}
        controls
        className="w-full object-cover"
        style={{ height: 220 }}
      />
    )
  }
  return (
    <img
      src={post.imageUrl}
      alt={title}
      loading="lazy"
      className="w-full object-cover"
      style={{ height: 220 }}
      onError={() => setFailed(true)}
    />
  )
}

function PostCard({ post, onDelete }) {
  const { t, lang } = useLanguage()
  const [comments, setComments] = useState(post.comments)
  const [commentInput, setCommentInput] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const name = lang === 'zh' ? post.userNameZh : post.userNameEn
  const time = lang === 'zh' ? post.timeZh : post.timeEn
  const location = lang === 'zh' ? post.locationZh : post.locationEn
  const title = lang === 'zh' ? post.titleZh : post.titleEn
  const text = lang === 'zh' ? post.textZh : post.textEn

  const handleSend = () => {
    const trimmed = commentInput.trim()
    if (!trimmed) return
    setComments(prev => [...prev, {
      id: Date.now(),
      userEn: 'You',
      userZh: '你',
      textEn: trimmed,
      textZh: trimmed,
      userColor: 'bg-primary-soft text-primary',
    }])
    setCommentInput('')
  }

  return (
  <>
    <article className="rounded-3xl border border-white/90 bg-surface/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <UserAvatar initial={post.userInitial} color={post.userColor} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink text-sm leading-snug">{name}</div>
          <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span>{time}</span>
            {location && (
              <>
                <span className="opacity-40">·</span>
                <span>{location}</span>
              </>
            )}
          </div>
        </div>
        {post.wellnessTagKey && (
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${TAG_COLOR[post.wellnessTagKey] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
            {t(post.wellnessTagKey)}
          </span>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label={t('communityDeletePostLabel')}
            title={t('communityDeletePostLabel')}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-muted/50 hover:text-rose-400 hover:bg-rose-50 transition-colors ml-0.5"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <div className="overflow-hidden">
        <PostImage post={post} title={title} />
      </div>

      <div className="px-4 pt-3 pb-2 space-y-2">
        <h3 className="font-semibold text-ink leading-snug" style={{ fontSize: '0.9375rem' }}>{title}</h3>
        {text && <p className="text-sm text-muted/90 leading-relaxed">{text}</p>}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {post.tags.map(tag => (
              <span
                key={tag}
                className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${TAG_COLOR[tag] || 'bg-gray-50 text-gray-500 border-gray-100'}`}
              >
                {t(tag)}
              </span>
            ))}
          </div>
        )}
      </div>

      {(comments.length > 0 || true) && (
        <>
          <div className="mx-4 border-t border-ink/[0.06]" />
          <div className="px-4 py-3 space-y-2.5">
            {comments.map(c => {
              const cUser = lang === 'zh' ? c.userZh : c.userEn
              const cText = lang === 'zh' ? c.textZh : c.textEn
              return (
                <div key={c.id} className="flex items-start gap-2">
                  <UserAvatar initial={cUser[0].toUpperCase()} color={c.userColor} size="w-6 h-6 text-xs" />
                  <div className="flex-1 min-w-0 bg-bg/70 border border-white/80 rounded-2xl px-3 py-2">
                    <span className="text-xs font-semibold text-ink mr-1.5">{cUser}</span>
                    <span className="text-xs text-muted/90">{cText}</span>
                  </div>
                </div>
              )
            })}

            <div className="flex items-center gap-2">
              <UserAvatar initial="Y" color="bg-primary-soft text-primary" size="w-6 h-6 text-xs" />
              <div className="flex-1 flex items-center gap-1 bg-bg/60 border border-white/80 rounded-2xl pl-3 pr-1 py-1">
                <input
                  type="text"
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={t('communityComment')}
                  className="flex-1 bg-transparent text-xs outline-none text-ink placeholder:text-muted/50 min-w-0"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!commentInput.trim()}
                  className="text-xs font-semibold text-primary px-2.5 py-1.5 rounded-xl hover:bg-primary-soft disabled:opacity-40 transition-colors flex-shrink-0"
                >
                  {t('communitySend')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </article>

    {showDeleteConfirm && (
      <DeleteConfirmModal
        t={t}
        onConfirm={() => { setShowDeleteConfirm(false); onDelete(post.id) }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    )}
  </>
  )
}

function CreatePostModal({ onClose, onPublish }) {
  const { t } = useLanguage()
  const fileInputRef = useRef(null)
  const [mediaUrl, setMediaUrl] = useState(null)
  const [mediaType, setMediaType] = useState(null)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setMediaUrl(url)
    setMediaType(file.type.startsWith('video') ? 'video' : 'image')
  }

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handlePublish = () => {
    if (!title.trim()) return
    onPublish({
      id: Date.now(),
      isUserPost: true,
      userNameEn: 'You',
      userNameZh: '你',
      userInitial: 'Y',
      userColor: 'bg-primary-soft text-primary',
      timeEn: 'Just now',
      timeZh: '刚刚',
      locationEn: null,
      locationZh: null,
      wellnessTagKey: selectedTags[0] || null,
      imageUrl: mediaType === 'image' ? mediaUrl : null,
      videoUrl: mediaType === 'video' ? mediaUrl : null,
      mediaType,
      titleEn: title,
      titleZh: title,
      textEn: text,
      textZh: text,
      tags: selectedTags,
      comments: [],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-bg rounded-t-[2rem] sm:rounded-[2rem] shadow-popover border border-white/80 max-h-[92dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-ink/[0.06]">
          <h2 className="font-display text-lg font-semibold text-ink">{t('communitySharePrompt')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-bg border border-ink/10 text-muted hover:text-ink transition-colors text-sm leading-none"
            aria-label={t('communityCancel')}
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 pb-8">
          <div>
            {!mediaUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl border-2 border-dashed border-ink/15 bg-bg/60 flex flex-col items-center justify-center gap-2 text-muted hover:border-primary/40 hover:text-primary transition-colors"
                style={{ height: 144 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-sm font-medium">{t('communityAddPhoto')}</span>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden" style={{ height: 200 }}>
                {mediaType === 'video' ? (
                  <video src={mediaUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={mediaUrl} alt="preview" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => { setMediaUrl(null); setMediaType(null) }}
                  className="absolute top-2 right-2 w-7 h-7 bg-ink/60 text-white rounded-full flex items-center justify-center text-xs leading-none"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">{t('communityPostTitle')}</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('communityPostTitle')}
              className="w-full bg-surface/60 border border-ink/10 rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-primary/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">{t('communityPostText')}</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={t('communityPostText')}
              rows={3}
              className="w-full bg-surface/60 border border-ink/10 rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-primary/40 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-2">{t('communityTagsOptional')}</label>
            <div className="flex flex-wrap gap-2">
              {COMMUNITY_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg text-muted border-ink/10 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {t(tag)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-ink/10 text-muted text-sm font-semibold hover:text-ink transition-colors"
            >
              {t('communityCancel')}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={!title.trim()}
              className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {t('communityPublish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CommunityFeed() {
  const { t } = useLanguage()
  const { userPosts, addPost, deletePost } = useCommunity()
  const [showModal, setShowModal] = useState(false)

  const allPosts = [...userPosts, ...MOCK_POSTS]

  return (
    <>
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            {t('communityTitle')}
          </h2>
          <p className="mt-1 text-sm text-muted leading-relaxed">
            {t('communitySubtitle')}
          </p>
        </div>

        <div className="space-y-5">
          {allPosts.map(post => (
            <PostCard key={post.id} post={post} onDelete={post.isUserPost ? deletePost : undefined} />
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-card-hover flex items-center justify-center hover:opacity-90 active:scale-95 transition-[opacity,transform] md:bottom-8 md:right-8"
        aria-label={t('communitySharePrompt')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onPublish={addPost}
        />
      )}
    </>
  )
}
