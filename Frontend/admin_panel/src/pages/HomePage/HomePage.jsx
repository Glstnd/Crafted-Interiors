import { FaCogs, FaUsers, FaBoxOpen } from "react-icons/fa";
import { motion } from "framer-motion";

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

const HomePage = () => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
        <div className="admin-home">
            <header className="hero">
                <div className="hero-text">
                    <h1>Furniture.CraftedInteriors</h1>
                    <p>Эффективное управление каталогами, заказами и пользователями в одном месте.</p>
                </div>
            </header>

            <section className="features">
                <div className="feature-card">
                    <FaBoxOpen className="feature-icon" />
                    <h2>Управление каталогами</h2>
                    <p>Создавайте, редактируйте и организовывайте коллекции мебели.</p>
                </div>
                <div className="feature-card">
                    <FaUsers className="feature-icon" />
                    <h2>Контроль пользователей</h2>
                    <p>Назначайте администраторов, управляйте клиентами и партнёрами.</p>
                </div>
                <div className="feature-card">
                    <FaCogs className="feature-icon" />
                    <h2>Настройки и аналитика</h2>
                    <p>Следите за статистикой продаж, анализируйте данные и настраивайте платформу.</p>
                </div>
            </section>

            <footer className="footer">
                <div className="footer-container">
                    <p>© 2025 Furniture.CraftedInteriors. Все права защищены.</p>
                </div>
            </footer>
        </div>
        </motion.div>
    );
}

export default HomePage;