import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, User, ArrowRight, X } from 'lucide-react';
import { RECIPES_AND_POSTS } from '../data/cakesData';
import { usePageSeo, getBreadcrumbSchema } from '../utils/seo';
import './RecipesPage.css';

export default function RecipesPage() {
  const [activePost, setActivePost] = useState(null);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Baking Guides & Recipes', url: '/recipes' }
  ]);

  usePageSeo({
    title: 'Cake Recipes & Baking Guides | Master Baker Carol Jenny | Lany Cakes',
    description: 'Expert baking guides, cake portion guides, and celebration planning advice from Master Baker Carol Jenny at Lany Cake Shop Nairobi.',
    canonicalPath: '/recipes',
    image: '/images/lany/cj-cakes.webp',
    schema: breadcrumbSchema
  });

  return (
    <div className="recipes-page">
      <div className="recipes-hero-banner">
        <div className="lany-container">
          <span className="section-sub-badge">Baker’s Journal &amp; Guides</span>
          <h1 className="recipes-title">Cake Recipes &amp; Baking Guides</h1>
          <p className="recipes-subtitle">
            Expert insights from our master decorator Carol Jenny: how to size wedding cakes, pair flavors, and keep your bakes fresh in the Nairobi climate.
          </p>
        </div>
      </div>

      <div className="lany-container recipes-body-container">
        <div className="recipes-grid">
          {RECIPES_AND_POSTS.map(post => (
            <article key={post.id} className="recipe-card">
              <div className="recipe-img-wrap" onClick={() => setActivePost(post)}>
                <img src={post.image} alt={post.title} className="recipe-img" />
                <span className="recipe-cat-badge">{post.category}</span>
              </div>

              <div className="recipe-content">
                <div className="recipe-meta-row">
                  <span className="recipe-meta-item">
                    <Clock size={14} />
                    <span>{post.readTime}</span>
                  </span>
                  <span className="recipe-meta-item">
                    <User size={14} />
                    <span>{post.author}</span>
                  </span>
                </div>

                <h3 className="recipe-post-title" onClick={() => setActivePost(post)}>
                  {post.title}
                </h3>

                <p className="recipe-excerpt">{post.excerpt}</p>

                <button 
                  className="recipe-read-btn"
                  onClick={() => setActivePost(post)}
                >
                  <span>Read Guide</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Post Modal Reader */}
      {activePost && (
        <div className="post-modal-overlay" onClick={() => setActivePost(null)}>
          <div className="post-modal-card" onClick={e => e.stopPropagation()}>
            <div className="post-modal-header">
              <span className="post-cat-tag">{activePost.category}</span>
              <button className="post-modal-close" onClick={() => setActivePost(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="post-modal-body">
              <h2 className="post-full-title">{activePost.title}</h2>
              <div className="post-author-row">
                <span>By {activePost.author} &bull; {activePost.date} &bull; {activePost.readTime}</span>
              </div>

              <div className="post-full-img-wrap">
                <img src={activePost.image} alt={activePost.title} />
              </div>

              <div className="post-article-content">
                {activePost.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="post-modal-footer">
              <button className="post-close-btn" onClick={() => setActivePost(null)}>
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
