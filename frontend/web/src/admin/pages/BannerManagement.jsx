import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BannerList from '../components/Banner/BannerList';
import BannerForm from '../components/Banner/BannerForm';
import DeleteBannerModal from '../components/Banner/DeleteBannerModal';
import { BiSearch } from 'react-icons/bi';
import { AiOutlinePlus } from 'react-icons/ai';
// @ts-ignore
import styles from '../styles/ProductLayout.module.css';


const BannerManagement = () => {
    const [banners, setBanners] = useState([]);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [sortType, setSortType] = useState('newest');

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/banners');
            console.log('API response for banners:', response.data); // Log response
            setBanners(response.data);
        } catch (error) {
            console.error('Error fetching banners:', error.response ? error.response.data : error.message); // Log detailed error
        }
    };


    const handleCreate = () => {
        setSelectedBanner(null);
        setIsFormOpen(true);
    };

    const handleEdit = (banner) => {
        setSelectedBanner(banner);
        setIsFormOpen(true);
    };

    const handleDelete = (banner) => {
        setSelectedBanner(banner);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/banners/${selectedBanner._id}`);
            fetchBanners();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting banner:', error);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedBanner) {
                await axios.put(
                    `http://localhost:5000/api/banners/${selectedBanner._id}`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            } else {
                await axios.post(
                    'http://localhost:5000/api/banners',
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }
            fetchBanners();
            setIsFormOpen(false);
        } catch (error) {
            console.error('Lỗi khi lưu banner:', error);
        }
    };

    const filteredBanners = banners.filter(banner => {
        if (!searchText.trim()) return true; // If no search text, show all banners
        const searchLower = searchText.toLowerCase();
        return (
            (banner.title || '').toLowerCase().includes(searchLower) ||
            (banner.description || '').toLowerCase().includes(searchLower) ||
            (banner.imageUrl || '').toLowerCase().includes(searchLower)
        );
    });

    const sortedBanners = [...filteredBanners].sort((a, b) => {
        if (sortType === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortType === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
        // Add other sorting options if needed, e.g., by title
        return 0;
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Quản lý Banner</h1>

            <div className={styles.filterBar} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--input-bg)', borderRadius: '8px', flexGrow: 1, padding: '5px 10px', height: '42px' }}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Tìm kiếm banner..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ border: 'none', background: 'transparent', flexGrow: 1, outline: 'none', color: 'var(--text-primary)', padding: '0 5px' }}
                    />
                    <BiSearch size={20} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                </div>

                <select
                    className={styles.select}
                    value={sortType}
                    onChange={e => setSortType(e.target.value)}
                    style={{ width: '150px', height: '42px' }}
                >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                </select>
                <span style={{ color: 'var(--text-secondary)' }}>Tổng banner: {filteredBanners.length}</span>
                <button onClick={handleCreate} className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: 'auto', padding: '10px 18px', height: '42px' }}>
                    <AiOutlinePlus size={20} style={{ marginRight: '5px' }} />
                    Thêm Banner mới
                </button>
            </div>

            <div className={styles.card} style={{ marginTop: 16 }}>
                <BannerList banners={sortedBanners} onEdit={handleEdit} onDelete={handleDelete} />
            </div>

            {isFormOpen && (
                <BannerForm
                    banner={selectedBanner}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
            {isDeleteModalOpen && (
                <DeleteBannerModal
                    onConfirm={confirmDelete}
                    onClose={() => setIsDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};

export default BannerManagement; 