import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa'; // <-- Import FaChevronRight
import './Breadcrumb.css'; // Import CSS cho breadcrumb

const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="breadcrumb-nav" aria-label="breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li
            key={item.path || item.label + index}
            className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {index === items.length - 1 || !item.path ? (
              <span>
                {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                {item.label}
              </span>
            ) : (
              <Link to={item.path} className="breadcrumb-link">
                {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && <FaChevronRight className="breadcrumb-separator" />}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;