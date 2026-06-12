import { Footer } from "../components/footer/footer"
import { Navbar } from "../components/navbar/navbar"
import { Outlet } from "react-router-dom"
import "./MainLayout.css"
export const MainLayout = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer/>
        </>
    )
}