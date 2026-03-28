import { Link } from 'react-router-dom'
import '../styles/categorycard.css'

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/jobs?category=${encodeURIComponent(category.name)}`}
      className="category-card"
      style={{
        '--cat-color': category.color,
        '--cat-bg': category.bg,
      }}
    >
      <div className="category-card__icon">{category.icon}</div>
      <h3 className="category-card__name">{category.name}</h3>
      <p className="category-card__count">{category.count.toLocaleString()} jobs</p>
      <span className="category-card__arrow">→</span>
    </Link>
  )
}