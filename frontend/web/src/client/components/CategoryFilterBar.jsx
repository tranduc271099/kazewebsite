import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/CategoryFilterBar.css';

const CategoryFilterBar = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedCategory = params.get('category') || '';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/categories');
                setCategories(res.data);
            } catch (err) {
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const handleClick = (cat) => {
        navigate(`/search?category=${cat._id}`);
    };

    return (
        <div className="category-filter-bar">
            {categories.map(cat => (
                <button
                    key={cat._id}
                    className={`category-btn${selectedCategory === cat._id ? ' active' : ''}`}
                    onClick={() => handleClick(cat)}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilterBar; 