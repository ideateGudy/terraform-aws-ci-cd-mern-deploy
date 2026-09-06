import { Route, Routes } from "react-router";
import Layout from "./components/Layout.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ShortenerPage from "./pages/ShortenerPage.jsx";
import DiaryPage from "./pages/DiaryPage.jsx";
import DiaryEntryPage from "./pages/DiaryEntryPage.jsx";

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/diary" element={<DiaryPage />} />
                <Route path="/todos" element={<DiaryPage />} />
                <Route path="/diary/:id" element={<DiaryEntryPage />} />
                <Route path="/shortener" element={<ShortenerPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage register />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;
