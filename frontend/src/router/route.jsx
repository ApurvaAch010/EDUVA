import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { MainLayout } from "../layouts/MainLayout"
import { HomePage } from "../pages/homepage/homepage"
import { AuthPage } from "../pages/authentication/authpage"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AuthLayout } from "../layouts/AuthLayout"
import { ForgetPass } from "../pages/authentication/forgetpass.page"
import { AuthProvider } from "../components/authprovider/AuthProvider"
import { useSelector } from "react-redux"
import { AdminLayout } from "../layouts/AdminLayout"
import { DashboardPage } from "../pages/Admin/DashboardPage"
import { ProductsPage } from "../pages/Admin/products/ProductsPage"
import { CategoriesPage } from "../pages/Admin/categories/CategoriesPage"
import { BannersPage } from "../pages/Admin/bannerPage/BannerPage"
import { UsersPage } from "../pages/Admin/User/Userspage"
import { OrdersAdminPage } from "../pages/Admin/orders/OrderAdminPage"

const ErrorComponent = () => {
    return (
        <>
            <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
                <h1 style={{ color: "red", fontSize: "5rem", fontFamily: "sans-serif" }}>404</h1>
                <p style={{ fontSize: "2rem", fontFamily: "sans-serif" }}>You have encountered an error please try again.</p>
            </div>
        </>
    )
}

const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);

    if (loading) return null; // wait for /auth/me 

    // if already logged in go to home
    if (isAuthenticated) return <Navigate to="/" replace />;

    return children;
};


const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

    if (loading) return null; // wait for /auth/me 

    // not logged in
    if (!isAuthenticated) return <Navigate to="/auth" />;

    // wrong role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
};


export const RouterComponent = () => {
    return (
        <BrowserRouter>
            <ToastContainer />
            <AuthProvider>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />} />
                    </Route>

                    <Route element={<AuthLayout />}>
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/auth/forget-password" element={<ForgetPass />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />

z
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={["admin", "mod"]}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<DashboardPage />} />
                            <Route path="products" element={<ProductsPage />} />
                            <Route path="categories" element={<CategoriesPage />} />
                            <Route path="banners" element={<BannersPage />} />
                            <Route path="users" element={<UsersPage />} />
                            <Route path="orders" element={<OrdersAdminPage/>}/>
                        </Route>

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}