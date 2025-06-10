import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterOnly() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/users/register', form);
            console.log(data);

            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name);
            navigate('/login');
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi hệ thống');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-4">Đăng ký tài khoản</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Họ và tên"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                    <button type="submit" className="w-full bg-black text-white py-2 rounded-xl">
                        Đăng ký
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Đã có tài khoản?{' '}
                    <a href="/login" className="text-blue-500 underline">
                        Đăng nhập
                    </a>
                </p>
            </div>
        </div>
    );
}