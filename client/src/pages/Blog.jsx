// client/src/pages/Blog.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: 'Introducing Dotty AI: The Future of DNS Management',
      excerpt: 'Learn how our AI assistant is revolutionizing the way developers manage DNS records.',
      date: '2025-01-15',
      readTime: '5 min read',
      category: 'Product'
    },
    {
      id: 2,
      title: 'DNS Security Best Practices for 2025',
      excerpt: 'Essential security configurations every domain owner should implement.',
      date: '2025-01-10',
      readTime: '8 min read',
      category: 'Security'
    },
    {
      id: 3,
      title: 'How AI is Transforming DevOps',
      excerpt: 'Exploring the impact of artificial intelligence on modern development operations.',
      date: '2025-01-05',
      readTime: '6 min read',
      category: 'Technology'
    }
  ];

  return (
    <Layout>
      <div className="py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
          <p className="text-lg text-slate-300">Insights, updates, and DNS best practices</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6 hover:border-amber-500/20 transition">
              <div className="mb-4">
                <span className="text-xs font-semibold text-amber-400 uppercase">{post.category}</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">
                <Link to={`/blog/${post.id}`} className="hover:text-amber-400 transition">
                  {post.title}
                </Link>
              </h2>
              <p className="text-slate-400 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                </div>
                <Link to={`/blog/${post.id}`} className="text-amber-400 hover:text-amber-300">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
}