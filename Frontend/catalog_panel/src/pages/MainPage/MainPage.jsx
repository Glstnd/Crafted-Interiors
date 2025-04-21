import React, { useEffect } from "react";
import DesignPicture from "../../assets/design.png";
import DrawingPicture from "../../assets/drawing.png";
import ManufacturingPicture from "../../assets/manufacturing.png";
import AssemblyPicture from "../../assets/assembly.png";
import "./MainPage.css";

const MainPage = () => {
    useEffect(() => {
        const sections = document.querySelectorAll(".section");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            },
            { threshold: 0.5 } // Срабатывает, когда 50% секции видно
        );

        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    return (
        <div className="main-page">
            <div className="container">
                <section className="section">
                    <div className="text">
                        <h2>Мы проектируем</h2>
                        <p>Мы создаем уникальные мебельные решения, соответствующие вашим желаниям.</p>
                        <div className="slides">
                            <span className="slide">Искры гениальности</span>
                            <span className="slide">Идеи воплощаются</span>
                            <span className="slide">Ваш стиль</span>
                        </div>
                    </div>
                    <img src={DesignPicture} alt="Дизайн мебели" />
                </section>

                <section className="section">
                    <div className="text">
                        <h2>Мы рисуем</h2>
                        <p>Работаем с программами SketchUp, PRO100 и Basis-Mebelshik для моделирования.</p>
                        <div className="slides">
                            <span className="slide">Линии оживают</span>
                            <span className="slide">Точные чертежи</span>
                            <span className="slide">Виртуальная реальность</span>
                        </div>
                    </div>
                    <img src={DrawingPicture} alt="Чертежи мебели" />
                </section>

                <section className="section">
                    <div className="text">
                        <h2>Мы производим</h2>
                        <p>Наши мастера используют качественные материалы для создания мебели.</p>
                        <div className="slides">
                            <span className="slide">Руки мастеров</span>
                            <span className="slide">Дерево дышит</span>
                            <span className="slide">Качество в деталях</span>
                        </div>
                    </div>
                    <img src={ManufacturingPicture} alt="Производство мебели" />
                </section>

                <section className="section">
                    <div className="text">
                        <h2>Мы собираем</h2>
                        <p>Профессиональный монтаж и сборка с точностью до миллиметра.</p>
                        <div className="slides">
                            <span className="slide">Идеальная сборка</span>
                            <span className="slide">Точность движений</span>
                            <span className="slide">Готовый результат</span>
                        </div>
                    </div>
                    <img src={AssemblyPicture} alt="Сборка мебели" />
                </section>
            </div>
        </div>
    );
};

export default MainPage;