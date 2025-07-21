import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BannerList from '../components/Banner/BannerList';
import BannerForm from '../components/Banner/BannerForm';
import DeleteBannerModal from '../components/Banner/DeleteBannerModal';
import '../styles/BannerManagement.css';


const BannerManagement = () => {
    const [banners, setBanners] = useState([]);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/banners');
            setBanners(response.data);
        } catch (error) {
            console.error('Error fetching banners:', error);
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

    return (
        <div className="banner-management-container dark-theme">
            <div className="management-header">
                <h1>Quản lý Banner</h1>
                <button onClick={handleCreate} className="btn-create">
                    Thêm Banner mới
                </button>
            </div>

            <div className="content-card">
                <BannerList banners={banners} onEdit={handleEdit} onDelete={handleDelete} />
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