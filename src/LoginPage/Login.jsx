import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/users/login', form);
            console.log('Login response:', data); // Kiểm tra ở đây
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name); // ← đây là quan trọng

            navigate('/');
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi hệ thống');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-center">Đăng nhập</h2>
                <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full mb-3 px-3 py-2 border rounded" required />
                <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} className="w-full mb-3 px-3 py-2 border rounded" required />
                <button type="submit" className="w-full bg-black text-white py-2 rounded-xl">Đăng nhập</button>
            </form>
        </div>
    );
}