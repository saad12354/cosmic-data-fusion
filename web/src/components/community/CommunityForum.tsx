import { useState } from 'react';
import {
    MessageSquare,
    Share2,
    Bookmark,
    MoreHorizontal,
    Plus,
    Search,
    TrendingUp,
    Clock,
    Star,
    ChevronDown,
    ArrowUp,
    Image as ImageIcon,
    FileText,
    Link as LinkIcon,
    BarChart2,
    X,
    Check,
    Target
} from 'lucide-react';
import { MOCK_POSTS, GROUPS, MOCK_CHALLENGES } from './mockData';
import { AnomalyBettingPool } from './AnomalyBettingPool';
import type { Post, Comment } from './mockData';
import { motion, AnimatePresence } from 'framer-motion';

export function CommunityForum({ user }: { user: string }) {
    const [posts] = useState(MOCK_POSTS);
    const [activeSort, setActiveSort] = useState<'hot' | 'new' | 'top'>('hot');
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);

    return (
        <div className="max-w-7xl mx-auto flex gap-8">
            {/* Sidebar Left - Groups */}
            <aside className="hidden lg:block w-64 space-y-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden text-sm">
                    <div className="p-4 border-b border-white/5 font-bold flex items-center gap-2">
                        <Star className="w-4 h-4 text-accent-cyan" />
                        YOUR GROUPS
                    </div>
                    <div className="p-2 space-y-1">
                        {GROUPS.filter(g => g.joined).map(group => (
                            <button
                                key={group.id}
                                onClick={() => setSelectedGroup(group.name)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 ${selectedGroup === group.name ? 'bg-accent-blue/10 text-accent-blue' : 'text-slate-400'}`}
                            >
                                <span className="text-lg">{group.icon}</span>
                                <div className="text-left">
                                    <p className="font-bold text-xs truncate">{group.name}</p>
                                    <p className="text-[10px] opacity-50">{group.members} members</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden text-sm text-sm">
                    <div className="p-4 border-b border-white/5 font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent-purple" />
                        DISCOVER GROUPS
                    </div>
                    <div className="p-2 space-y-1">
                        {GROUPS.filter(g => !g.joined).map(group => (
                            <div
                                key={group.id}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-400 group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-lg">{group.icon}</span>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-xs truncate">{group.name}</p>
                                        <p className="text-[10px] opacity-50">{group.members} members</p>
                                    </div>
                                </div>
                                <button className="p-1 px-2 bg-accent-blue/10 text-accent-blue rounded-md text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    JOIN
                                </button>
                            </div>
                        ))}
                        <button className="w-full mt-2 p-2 text-accent-cyan text-[10px] font-bold hover:underline">
                            + Discover Groups
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Feed */}
            <main className="flex-1 space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-xl border border-white/5 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveSort('hot')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSort === 'hot' ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Hot
                        </button>
                        <button
                            onClick={() => setActiveSort('new')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSort === 'new' ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Clock className="w-4 h-4" />
                            New
                        </button>
                        <button
                            onClick={() => setActiveSort('top')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSort === 'top' ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Star className="w-4 h-4" />
                            Top
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-accent-blue" />
                            <input
                                type="text"
                                placeholder="Search community..."
                                className="bg-slate-900/50 border border-white/5 rounded-xl px-10 py-2 text-sm outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 w-64"
                            />
                        </div>
                        <button
                            onClick={() => setIsPostModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-accent-blue to-accent-purple hover:opacity-90 rounded-xl text-sm font-bold transition-all shadow-lg text-white"
                        >
                            <Plus className="w-4 h-4" />
                            Create Post
                        </button>
                    </div>
                </div>

                {/* Feed Posts */}
                <div className="space-y-6">
                    {/* Featured Anomaly Challenge */}
                    <div className="mb-8">
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent-cyan mb-3 px-1 flex items-center gap-2">
                            <Star className="w-3 h-3 fill-accent-cyan" />
                            Featured Researcher Challenge
                        </p>
                        <AnomalyBettingPool challenge={MOCK_CHALLENGES[0]} />
                    </div>

                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            </main>

            {/* Sidebar Right - Stats/Users */}
            <aside className="hidden xl:block w-72 space-y-6">
                <div className="bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-sm">
                    <h3 className="font-bold text-lg mb-2">Cosmic Hub 🌌</h3>
                    <p className="text-slate-400 leading-relaxed mb-4 text-xs">
                        Welcome to the decentralized research hub. Collaborate with astronomers worldwide in real-time.
                    </p>
                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                        <div>
                            <p className="text-xl font-bold">12.4k</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Members</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold">452</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Online</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden p-4">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-500" />
                        TOP CONTRIBUTORS
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Dr. Sarah Chen', rep: '15k', role: 'Galaxy Expert' },
                            { name: 'Alex Rivera', rep: '8.2k', role: 'Exoplanet Hunter' },
                            { name: 'Prof. Maria Lopez', rep: '7.5k', role: 'Stellar Expert' }
                        ].map((u, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-accent-cyan">
                                    {u.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs truncate">{u.name}</p>
                                    <p className="text-[10px] text-slate-500">{u.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold">{u.rep}</p>
                                    <p className="text-[8px] text-slate-500 uppercase tracking-tighter">REP</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Floating Action Button */}
            <div className="fixed bottom-10 right-10 z-[100]">
                <AnimatePresence>
                    {fabOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            className="absolute bottom-16 right-0 mb-4 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 min-w-[200px]"
                        >
                            <button className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-xl transition-all text-sm group text-left">
                                <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center text-accent-blue group-hover:bg-accent-blue group-hover:text-white transition-all">
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                                <span className="font-medium">Share Discovery</span>
                            </button>
                            <button className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-xl transition-all text-sm group text-left">
                                <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center text-accent-purple group-hover:bg-accent-purple group-hover:text-white transition-all">
                                    <BarChart2 className="w-4 h-4" />
                                </div>
                                <span className="font-medium">Discuss Data</span>
                            </button>
                            <button className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-xl transition-all text-sm group text-left">
                                <div className="w-8 h-8 rounded-lg bg-accent-cyan/20 flex items-center justify-center text-accent-cyan group-hover:bg-accent-cyan group-hover:text-white transition-all">
                                    <Star className="w-4 h-4" />
                                </div>
                                <span className="font-medium">Create Group</span>
                            </button>
                            <button className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-xl transition-all text-sm group text-left">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <Target className="w-4 h-4" />
                                </div>
                                <span className="font-medium">New Anomaly Challenge</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setFabOpen(!fabOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${fabOpen ? 'bg-slate-800 rotate-45' : 'bg-accent-blue hover:scale-110 shadow-accent-blue/50'}`}
                >
                    <Plus className={`w-8 h-8 text-white transition-all`} />
                </button>
            </div>

            {/* Create Post Modal */}
            <AnimatePresence>
                {isPostModalOpen && (
                    <PostComposer onClose={() => setIsPostModalOpen(false)} user={user} />
                )}
            </AnimatePresence>

        </div >
    );
}

function PostCard({ post }: { post: Post }) {
    const [likes, setLikes] = useState(post.upvotes);
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);

    return (
        <article className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
            <div className="p-5 flex gap-4">
                {/* Vote Sidebar */}
                <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                        onClick={() => {
                            if (isLiked) {
                                setLikes(likes - 1);
                                setIsLiked(false);
                            } else {
                                setLikes(likes + 1);
                                setIsLiked(true);
                            }
                        }}
                        className={`p-1 rounded-md transition-all ${isLiked ? 'text-accent-blue bg-accent-blue/10' : 'text-slate-500 hover:text-accent-blue hover:bg-white/5'}`}
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className={`font-bold text-sm ${isLiked ? 'text-accent-blue' : 'text-slate-400'}`}>{likes}</span>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3 text-xs">
                        <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/30 text-[10px] font-bold text-accent-purple">
                            {post.userName[0]}
                        </div>
                        <span className="font-bold text-white mb-0">{post.userName}</span>
                        <span className="text-slate-500">in</span>
                        <span className="text-accent-cyan font-bold hover:underline cursor-pointer">{post.group}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500">{post.timestamp}</span>
                    </div>

                    <h2 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-accent-blue transition-colors">
                        {post.title}
                    </h2>

                    <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-3">
                        {post.content}
                    </p>

                    {post.imageUrl && (
                        <div className="rounded-xl overflow-hidden border border-white/5 mb-4 max-h-[400px]">
                            <img src={post.imageUrl} alt="post" className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-6 text-slate-400">
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-2 hover:text-white transition-colors text-sm"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-bold">{post.commentsCount} Comments</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-white transition-colors text-sm">
                            <Share2 className="w-4 h-4" />
                            <span className="font-bold">Share</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-white transition-colors text-sm">
                            <Bookmark className="w-4 h-4" />
                            <span className="font-bold">Save</span>
                        </button>
                        <button className="ml-auto hover:text-white p-1">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Simple Nested Comment Preview */}
                    <AnimatePresence>
                        {showComments && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 pt-6 border-t border-white/5 space-y-6 overflow-hidden"
                            >
                                {post.comments.map(comment => (
                                    <CommentItem key={comment.id} comment={comment} level={0} />
                                ))}
                                <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-400 transition-all">
                                    View 15 more comments
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </article>
    );
}

function CommentItem({ comment, level }: { comment: Comment, level: number }) {
    return (
        <div className={`space-y-4 ${level > 0 ? 'ml-8 pl-4 border-l border-white/10' : ''}`}>
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {comment.userName[0]}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-bold text-white">{comment.userName}</span>
                        <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {comment.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-accent-blue transition-colors">
                            <ArrowUp className="w-3 h-3" />
                            {comment.upvotes}
                        </button>
                        <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Reply
                        </button>
                    </div>
                </div>
            </div>
            {comment.replies && comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} level={level + 1} />
            ))}
        </div>
    );
}

function PostComposer({ onClose, user }: { onClose: () => void, user: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Create Post</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/30 text-[10px] font-bold text-accent-purple">
                            {user[0].toUpperCase()}
                        </div>
                        <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-white/10">
                            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Post to:</span>
                            <span className="font-bold flex items-center gap-1">
                                Galaxy Research
                                <ChevronDown className="w-4 h-4" />
                            </span>
                        </div>
                    </div>

                    <input
                        type="text"
                        placeholder="Post Title"
                        className="w-full bg-slate-800 border-none outline-none text-xl font-bold py-2 focus:ring-0 placeholder:text-slate-600"
                    />

                    <div className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-2 border-b border-white/5 flex gap-2">
                            <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors">
                                <ImageIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors">
                                <FileText className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors">
                                <LinkIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            placeholder="Share your discovery or data insights..."
                            className="w-full bg-transparent border-none outline-none p-4 min-h-[150px] resize-none focus:ring-0 text-slate-300"
                        ></textarea>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full flex items-center gap-2">
                            #galaxies
                            <X className="w-3 h-3 cursor-pointer hover:text-white" />
                        </span>
                        <button className="px-3 py-1 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 transition-colors">
                            + Add Tag
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-slate-800/30 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
                            <Check className="w-3 h-3" />
                            Mark as Question
                        </button>
                        <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
                            <Check className="w-3 h-3 text-transparent border border-white/20 rounded-sm" />
                            Request Peer Review
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-all text-sm">
                            Cancel
                        </button>
                        <button className="px-8 py-2 bg-accent-blue hover:bg-accent-blue/90 rounded-xl font-bold transition-all text-sm shadow-lg shadow-accent-blue/20">
                            Post to Community
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

