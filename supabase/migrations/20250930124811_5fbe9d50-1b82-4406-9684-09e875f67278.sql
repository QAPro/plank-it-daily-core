-- Remove the existing cardio_strength family and add new Walking and Wall Sits families
DELETE FROM exercise_families WHERE family_key = 'cardio_strength';

-- Add Walking family
INSERT INTO exercise_families (family_key, family_name, description, display_order, icon_name) 
VALUES ('walking', 'Walking', 'Walking exercises and step movements', 7, 'Footprints');

-- Add Wall Sits family  
INSERT INTO exercise_families (family_key, family_name, description, display_order, icon_name)
VALUES ('wall_sits', 'Wall Sits', 'Wall sit exercises and variations', 8, 'Square');