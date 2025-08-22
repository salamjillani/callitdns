import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Tag,
  Eye,
  Share2,
} from "lucide-react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  limit,
  onSnapshot,
} from "firebase/firestore";

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    loadBlogPost();
  }, [id]);

  const loadBlogPost = async () => {
    try {
      const docRef = doc(db, "blogs", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setPost({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          date:
            data.createdAt?.toDate?.()?.toLocaleDateString() ||
            new Date().toLocaleDateString(),
        });

        // Increment view count
        await updateDoc(docRef, {
          views: increment(1),
        });

        // Load related posts
        loadRelatedPosts(data.category, docSnap.id);
      } else {
        setPost(null);
      }
    } catch (error) {
      console.error("Error loading blog post:", error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedPosts = (category, currentPostId) => {
    const q = query(
      collection(db, "blogs"),
      where("category", "==", category),
      where("published", "==", true),
      limit(4)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date:
            doc.data().createdAt?.toDate?.()?.toLocaleDateString() ||
            new Date().toLocaleDateString(),
        }))
        .filter((p) => p.id !== currentPostId)
        .slice(0, 3);

      setRelatedPosts(posts);
    });

    return () => unsubscribe();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const formatContent = (content) => {
    // Simple markdown-like formatting
    return content.split("\n\n").map((paragraph, index) => {
      // Check for headers
      if (paragraph.startsWith("# ")) {
        return (
          <h2
            key={index}
            className="text-xl sm:text-2xl font-bold text-white mt-6 mb-4"
          >
            {paragraph.substring(2)}
          </h2>
        );
      }
      if (paragraph.startsWith("## ")) {
        return (
          <h3
            key={index}
            className="text-lg sm:text-xl font-semibold text-white mt-4 mb-3"
          >
            {paragraph.substring(3)}
          </h3>
        );
      }
      if (paragraph.startsWith("### ")) {
        return (
          <h4
            key={index}
            className="text-base sm:text-lg font-semibold text-white mt-3 mb-2"
          >
            {paragraph.substring(4)}
          </h4>
        );
      }

      // Check for lists
      if (paragraph.startsWith("- ") || paragraph.startsWith("* ")) {
        const items = paragraph.split("\n").map((item) => item.substring(2));
        return (
          <ul
            key={index}
            className="list-disc list-inside text-slate-300 mb-4 space-y-2"
          >
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      }

      // Check for code blocks
      if (paragraph.startsWith("```")) {
        const code = paragraph.substring(3, paragraph.length - 3);
        return (
          <pre
            key={index}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4 overflow-x-auto"
          >
            <code className="text-slate-300 text-sm">{code}</code>
          </pre>
        );
      }

      // Regular paragraph
      return (
        <p
          key={index}
          className="text-slate-300 mb-4 leading-relaxed text-sm sm:text-base"
        >
          {paragraph}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <p className="text-slate-400">Loading post...</p>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="py-12 text-center px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Post Not Found
          </h1>
          <p className="text-slate-400 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link to="/blog" className="text-amber-400 hover:text-amber-300">
            ← Back to Blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-6 sm:mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog</span>
        </Link>

        {/* Article Header */}
        <article>
          <header className="mb-6 sm:mb-8">
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-48 sm:h-64 md:h-96 object-cover rounded-xl mb-6 sm:mb-8"
              />
            )}

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs sm:text-sm rounded-full">
                {post.category}
              </span>
              {post.featured && (
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 text-xs sm:text-sm rounded-full">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-4 sm:mb-6 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400 pb-4 sm:pb-6 border-b border-slate-800">
              {post.author && (
                <span className="flex items-center gap-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  {post.author}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-2">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                {post.views || 0} views
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 ml-auto hover:text-white transition"
              >
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-invert max-w-none">
            {formatContent(post.content)}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-800">
              <div className="flex items-center space-x-2 mb-4">
                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <span className="text-slate-400 text-sm sm:text-base">
                  Tags:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs sm:text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.id}`}
                  className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-4 hover:border-amber-500/20 transition"
                >
                  {relatedPost.imageUrl && (
                    <img
                      src={relatedPost.imageUrl}
                      alt={relatedPost.title}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-white mb-2 text-sm sm:text-base line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                  <div className="mt-2 sm:mt-3 text-xs text-slate-500">
                    {relatedPost.date} • {relatedPost.readTime}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
