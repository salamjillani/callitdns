import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  User,
  FileText,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Menu,
} from "lucide-react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import {
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [adminData, setAdminData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Profile states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // Blog form states
  const [blogForm, setBlogForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Product",
    readTime: "5 min read",
    published: true,
    featured: false,
    tags: "",
    imageUrl: "",
  });

  useEffect(() => {
    checkAdminAuth();
    loadAdminData();
    loadBlogs();

    // Debug auth claims and admin document
    const debugAuth = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          console.log("=== AUTH DEBUG ===");
          console.log("Auth UID:", user.uid);
          console.log("Custom claims:", tokenResult.claims);
          console.log("Has admin claim:", tokenResult.claims.admin);
          console.log("Has role claim:", tokenResult.claims.role);

          const adminDoc = await getDoc(doc(db, "admins", user.uid));
          console.log("=== ADMIN DOC DEBUG ===");
          if (adminDoc.exists()) {
            console.log("Admin document exists:", adminDoc.data());
          } else {
            console.log("No admin document found for UID:", user.uid);
          }
          console.log("=======================");
        } catch (error) {
          console.error("Debug error:", error);
        }
      }
    };

    debugAuth();
  }, []);

  const checkAdminAuth = async () => {
    const user = auth.currentUser;
    const isAdmin = localStorage.getItem("isAdmin");

    if (!user || isAdmin !== "true") {
      navigate("/callitdns-mgmt-portal-x9k2m");
      return;
    }

    try {
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (!adminDoc.exists()) {
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("adminData");
        await auth.signOut();
        navigate("/callitdns-mgmt-portal-x9k2m");
      }
    } catch (error) {
      console.error("Error checking admin auth:", error);
      navigate("/callitdns-mgmt-portal-x9k2m");
    }
  };

  const loadAdminData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        setAdminData(data);
        setProfileForm((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
        }));
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  const loadBlogs = () => {
    try {
      const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const blogsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt:
              doc.data().createdAt?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
          }));
          setBlogs(blogsList);
          setLoading(false);
        },
        (error) => {
          console.error("Error loading blogs:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up blogs listener:", error);
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const user = auth.currentUser;

      // Update name in Firestore
      if (profileForm.name !== adminData.name) {
        await updateDoc(doc(db, "admins", user.uid), {
          name: profileForm.name,
        });
      }

      // Update email if changed
      if (
        profileForm.email !== adminData.email &&
        profileForm.currentPassword
      ) {
        const credential = EmailAuthProvider.credential(
          user.email,
          profileForm.currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, profileForm.email);

        await updateDoc(doc(db, "admins", user.uid), {
          email: profileForm.email,
        });
      }

      // Update password if provided
      if (profileForm.newPassword && profileForm.currentPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          throw new Error("New passwords do not match");
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          profileForm.currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, profileForm.newPassword);
      }

      setProfileMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      loadAdminData();

      // Clear password fields
      setProfileForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Profile update error:", error);
      setProfileMessage({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();

    try {
      const blogData = {
        ...blogForm,
        tags: blogForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        author: adminData?.name || "Admin",
        authorId: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
      };

      if (editingBlog) {
        await updateDoc(doc(db, "blogs", editingBlog.id), blogData);
        alert("Blog post updated successfully!");
      } else {
        await addDoc(collection(db, "blogs"), {
          ...blogData,
          createdAt: serverTimestamp(),
          views: 0,
        });
        alert("Blog post created successfully!");
      }

      setShowBlogForm(false);
      setEditingBlog(null);
      setBlogForm({
        title: "",
        excerpt: "",
        content: "",
        category: "Product",
        readTime: "5 min read",
        published: true,
        featured: false,
        tags: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error("Error saving blog:", error);
      alert("Failed to save blog post: " + error.message);
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      category: blog.category || "Product",
      readTime: blog.readTime || "5 min read",
      published: blog.published !== false,
      featured: blog.featured || false,
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : "",
      imageUrl: blog.imageUrl || "",
    });
    setShowBlogForm(true);
    setMobileMenuOpen(false);
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteDoc(doc(db, "blogs", blogId));
        alert("Blog post deleted successfully!");
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Failed to delete blog post: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminData");
      await auth.signOut();
      navigate("/callitdns-mgmt-portal-x9k2m");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 bg-gradient-to-br from-red-500/5 via-slate-950 to-amber-500/5" />

      {/* Admin Header */}
      <header className="relative z-10 bg-slate-900/50 backdrop-blur-lg border-b border-slate-800">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Admin Dashboard
              </h1>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop logout button */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => handleTabChange("profile")}
                className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg font-semibold transition text-left ${
                  activeTab === "profile"
                    ? "bg-amber-500 text-black"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => handleTabChange("blogs")}
                className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg font-semibold transition text-left ${
                  activeTab === "blogs"
                    ? "bg-amber-500 text-black"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Blogs ({blogs.length})</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-3 rounded-lg transition text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
        {/* Desktop Tabs */}
        <div className="hidden lg:flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "profile"
                ? "bg-amber-500 text-black"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "blogs"
                ? "bg-amber-500 text-black"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Blogs ({blogs.length})</span>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              Admin Profile
            </h2>

            <form
              onSubmit={handleProfileUpdate}
              className="space-y-4 sm:space-y-6 max-w-2xl"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 sm:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 sm:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                  required
                />
              </div>

              <div className="border-t border-slate-700 pt-4 sm:pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Change Password
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                      placeholder="Required for email or password change"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.newPassword}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              {profileMessage.text && (
                <div
                  className={`p-4 rounded-lg text-sm sm:text-base ${
                    profileMessage.type === "success"
                      ? "bg-green-500/10 border border-green-500/20 text-green-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-black font-semibold px-6 py-2.5 sm:py-3 rounded-lg transition text-sm sm:text-base"
              >
                {profileLoading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Blog Management
              </h2>
              <button
                onClick={() => {
                  setShowBlogForm(true);
                  setEditingBlog(null);
                  setBlogForm({
                    title: "",
                    excerpt: "",
                    content: "",
                    category: "Product",
                    readTime: "5 min read",
                    published: true,
                    featured: false,
                    tags: "",
                    imageUrl: "",
                  });
                }}
                className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2.5 rounded-lg transition text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>New Blog Post</span>
              </button>
            </div>

            {/* Blog Form */}
            {showBlogForm && (
              <div className="mb-8 p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowBlogForm(false);
                      setEditingBlog(null);
                    }}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleBlogSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={blogForm.title}
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, title: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Category
                      </label>
                      <select
                        value={blogForm.category}
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, category: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                      >
                        <option value="Product">Product</option>
                        <option value="Security">Security</option>
                        <option value="Technology">Technology</option>
                        <option value="Tutorial">Tutorial</option>
                        <option value="Company">Company</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Excerpt *
                    </label>
                    <textarea
                      value={blogForm.excerpt}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, excerpt: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                      rows={2}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={blogForm.content}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, content: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                      rows={8}
                      required
                      placeholder="Supports Markdown formatting..."
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Read Time
                      </label>
                      <input
                        type="text"
                        value={blogForm.readTime}
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, readTime: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                        placeholder="e.g., 5 min read"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={blogForm.tags}
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, tags: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                        placeholder="dns, security, ai"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Featured Image URL
                    </label>
                    <input
                      type="url"
                      value={blogForm.imageUrl}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, imageUrl: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blogForm.published}
                        onChange={(e) =>
                          setBlogForm({
                            ...blogForm,
                            published: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                      />
                      <span className="text-slate-300">Published</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blogForm.featured}
                        onChange={(e) =>
                          setBlogForm({
                            ...blogForm,
                            featured: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                      />
                      <span className="text-slate-300">Featured</span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      type="submit"
                      className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-2.5 rounded-lg transition text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingBlog ? "Update" : "Create"} Post</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBlogForm(false);
                        setEditingBlog(null);
                      }}
                      className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Blog List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Loading blogs...</p>
                </div>
              ) : blogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">
                    No blog posts yet. Create your first post!
                  </p>
                </div>
              ) : (
                blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-white">
                            {blog.title}
                          </h3>
                          {blog.featured && (
                            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                              Featured
                            </span>
                          )}
                          {!blog.published && (
                            <span className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded-full">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 mb-3 text-sm sm:text-base">
                          {blog.excerpt}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>
                              {blog.createdAt
                                ? new Date(blog.createdAt).toLocaleDateString()
                                : "No date"}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{blog.readTime}</span>
                          </span>
                          <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                            {blog.category}
                          </span>
                          {blog.published ? (
                            <span className="flex items-center space-x-1 text-green-400">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Published</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-slate-400">
                              <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Draft</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 lg:ml-4">
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
