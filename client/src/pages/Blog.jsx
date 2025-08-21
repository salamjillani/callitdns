import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Calendar, Clock, ArrowRight, Tag, TrendingUp, Eye } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    let unsubscribe;

    try {
      // Subscribe to real-time blog updates
      const q = query(
        collection(db, 'blogs'),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const blogsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            date: doc.data().createdAt?.toDate?.()?.toLocaleDateString() || new Date().toLocaleDateString()
          }));
          
          setPosts(blogsList);
          
          // Extract unique categories
          const uniqueCategories = ['All', ...new Set(blogsList.map(post => post.category).filter(Boolean))];
          setCategories(uniqueCategories);
          
          setLoading(false);
        },
        (error) => {
          console.error('Error loading blog posts:', error);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up blog listener:', error);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const featuredPosts = posts.filter(post => post.featured).slice(0, 3);

  return (
    <Layout>
      <div className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
          <p className="text-base sm:text-lg text-slate-300">Insights, updates, and DNS best practices</p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Featured Posts</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="block bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 sm:p-6 hover:border-amber-500/40 transition transform hover:-translate-y-1"
                >
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="w-full h-32 sm:h-40 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-xs font-semibold text-amber-400 uppercase">{post.category}</span>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mt-2 mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm sm:text-base ${
                  selectedCategory === category
                    ? 'bg-amber-500 text-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mb-4"></div>
            <p className="text-slate-400">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            {selectedCategory === 'All' ? (
              <p className="text-slate-400">No blog posts available yet. Check back soon!</p>
            ) : (
              <p className="text-slate-400">No posts found in the "{selectedCategory}" category.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredPosts.map((post) => (
              <article 
                key={post.id} 
                className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-4 sm:p-6 hover:border-amber-500/20 transition"
              >
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-full h-36 sm:h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                
                <div className="mb-4">
                  <span className="text-xs font-semibold text-amber-400 uppercase">{post.category}</span>
                </div>
                
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 line-clamp-2">
                  <Link to={`/blog/${post.id}`} className="hover:text-amber-400 transition">
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-slate-400 mb-4 line-clamp-3 text-sm sm:text-base">{post.excerpt}</p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{post.date}</span>
                      <span className="sm:hidden">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {post.readTime}
                    </span>
                    {post.views > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        {post.views}
                      </span>
                    )}
                  </div>
                  <Link to={`/blog/${post.id}`} className="text-amber-400 hover:text-amber-300 flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}