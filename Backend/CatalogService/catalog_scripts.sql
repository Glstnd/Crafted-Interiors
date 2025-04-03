-- Заполнение таблиц
INSERT INTO catalog (name, description, tag) VALUES
('Гостиная', 'Мебель для уютной гостиной', 'living_room'),
('Спальня', 'Мебель для комфортной спальни', 'bedroom'),
('Офис', 'Мебель для рабочего пространства', 'office');

INSERT INTO category (name, description, tag, catalog_id) VALUES
('Диваны', 'Удобные диваны и кушетки', 'sofas', 1),
('Кровати', 'Комфортные кровати разных размеров', 'beds', 2),
('Стулья', 'Офисные кресла для рабочего места', 'chairs', 3);

INSERT INTO product (name, tag, category_id) VALUES
('Кожаный диван', 'leather_sofa', 1),
('Кровать Queen-size', 'queen_bed', 2),
('Эргономичное кресло', 'ergonomic_chair', 3);

SELECT * FROM catalog;

SELECT * FROM category;

SELECT * FROM product;