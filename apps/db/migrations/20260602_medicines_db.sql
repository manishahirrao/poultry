-- FlockIQ Gap Remediation - Medicines Database
-- Migration: 20260602_medicines_db.sql
-- Description: Creates medicines_db reference table and seeds with 55 common broiler medicines
-- Requirements: REQ-GAP3-HEALTH-005
-- Task: TASK-GAP1-DB-003

CREATE TABLE IF NOT EXISTS medicines_db (
  medicine_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generic_name         TEXT NOT NULL UNIQUE,
  category             TEXT NOT NULL CHECK (category IN ('antibiotic','antifungal','antiparasitic','vaccine','vitamin','probiotic','other')),
  standard_withdrawal_days_india  INTEGER NOT NULL DEFAULT 0,
  dosage_guidance      TEXT,
  brand_names          TEXT[], -- array of common brand names for autocomplete
  notes                TEXT
);
-- No RLS needed — this is a read-only reference table accessible to all authenticated users

-- Seed with 55 common Indian broiler medicines
INSERT INTO medicines_db (generic_name, category, standard_withdrawal_days_india, dosage_guidance, brand_names) VALUES
('Tylosin', 'antibiotic', 7, '100mg/L drinking water for 3-5 days', ARRAY['Tylan', 'Tyla 10%']),
('Enrofloxacin', 'antibiotic', 10, '10mg/kg body weight for 5 days', ARRAY['Baytril', 'Quintas', 'Enrowin']),
('Oxytetracycline', 'antibiotic', 10, '10-20mg/kg for 5-7 days', ARRAY['OTC-20', 'Terramycin']),
('Ampicillin', 'antibiotic', 7, '10mg/kg for 5 days', ARRAY['Ampicef', 'Ampivet']),
('Colistin', 'antibiotic', 1, '75,000 IU/kg feed for 7 days', ARRAY['Colimycin', 'Colistin 10%']),
('Doxycycline', 'antibiotic', 10, '25mg/kg for 5 days', ARRAY['Doxywin', 'Doxybid']),
('Trimethoprim-Sulfa', 'antibiotic', 10, '30mg/kg combined for 5 days', ARRAY['TMP-SMX', 'Cosumix']),
('Neomycin', 'antibiotic', 7, '10mg/kg for 5 days', ARRAY['Neobiotic']),
('Chlortetracycline', 'antibiotic', 10, '10mg/kg for 5-7 days', ARRAY['Aureomycin']),
('Florfenicol', 'antibiotic', 14, '20mg/kg for 5 days', ARRAY['Nuflor']),
('Lincomycin', 'antibiotic', 7, '2-4g/L water for 5 days', ARRAY['Lincomix']),
('Tiamulin', 'antibiotic', 5, '10mg/kg for 5 days', ARRAY['Dynamutilin']),
('Amprolium', 'antiparasitic', 0, '240mg/L water for 5 days (coccidiosis)', ARRAY['Amprolmix', 'Coxistac']),
('Toltrazuril', 'antiparasitic', 18, '75mg/L water for 2 days', ARRAY['Baycox']),
('Diclazuril', 'antiparasitic', 1, '1mg/L water for 2 days', ARRAY['Clinacox']),
('Levamisole', 'antiparasitic', 7, '25mg/kg single dose (worms)', ARRAY['Nilverm', 'Decaris']),
('Ivermectin', 'antiparasitic', 14, '0.2mg/kg for external/internal parasites', ARRAY['Ivomec']),
('Newcastle Disease Vaccine (Live)', 'vaccine', 0, 'Eye/nostril drop or drinking water per label', ARRAY['Lasota', 'Clone 30', 'Hitchner B1']),
('Newcastle Disease Vaccine (Killed)', 'vaccine', 0, 'Subcutaneous injection per label', ARRAY['ND-H120 killed']),
('Infectious Bronchitis Vaccine', 'vaccine', 0, 'Spray or drinking water per label', ARRAY['H120', 'M41', 'IB-88']),
('Infectious Bursal Disease Vaccine (IBD)', 'vaccine', 0, 'Drinking water per label', ARRAY['Gumboro', 'IBD Blen', 'D78']),
('Marek Disease Vaccine', 'vaccine', 0, 'Subcutaneous injection at hatchery', ARRAY['Rispens', 'HVT']),
('Fowl Pox Vaccine', 'vaccine', 0, 'Wing web prick per label', ARRAY['Fowl Pox Vac']),
('Vitamin A+D3+E', 'vitamin', 0, '1ml/L water for 5 days (stress)', ARRAY['Adivit', 'ADE-Forte']),
('Vitamin C (Ascorbic Acid)', 'vitamin', 0, '250-500mg/L water (heat stress)', ARRAY['Vitamin C powder']),
('B-Complex (B1+B2+B6+B12)', 'vitamin', 0, '1g/L water for 5 days', ARRAY['B-Plex']),
('Electrolytes (Oral Rehydration)', 'vitamin', 0, 'Per label for rehydration', ARRAY['Electral Vet', 'Rehydion']),
('Liver Tonic (Silymarin)', 'vitamin', 0, 'Per label — liver support', ARRAY['Livol', 'Hepasol']),
('Methionine (Amino Acid)', 'vitamin', 0, 'Per label as growth supplement', ARRAY['DL-Methionine']),
('Lysine (Amino Acid)', 'vitamin', 0, 'Per label as growth supplement', ARRAY['L-Lysine']),
('Probiotic (Lactobacillus)', 'probiotic', 0, '1g/L water or per feed label', ARRAY['Protexin', 'Bactoflor']),
('Prebiotic (MOS/FOS)', 'probiotic', 0, 'Per feed label', ARRAY['Bio-Mos']),
('Enzyme (Phytase)', 'probiotic', 0, 'Per feed formulation', ARRAY['Axtra PHY']),
('Organic Acids (Butyric Acid)', 'probiotic', 0, 'Per feed label — gut health', ARRAY['Gut-Pro']),
('Calcium Gluconate', 'vitamin', 0, '2-4g/L water for calcium supplement', ARRAY['CalciVet']),
('Zinc Bacitracin', 'antibiotic', 7, '10-50g/tonne feed as growth promoter', ARRAY['Albac']),
('Virginiamycin', 'antibiotic', 0, '5-20g/tonne feed', ARRAY['Stafac']),
('Fenbendazole', 'antiparasitic', 14, '7mg/kg for 5 days (roundworms)', ARRAY['Safe-Guard', 'Panacur']),
('Piperazine', 'antiparasitic', 7, '100mg/kg single dose (roundworms)', ARRAY['Piperazine Citrate']),
('Salinomycin', 'antiparasitic', 5, '60-70g/tonne feed (coccidiostat)', ARRAY['Bio-Cox', 'Sacox']),
('Monensin', 'antiparasitic', 3, '90-110g/tonne feed (coccidiostat)', ARRAY['Coban', 'Elancoban']),
('Lasalocid', 'antiparasitic', 3, '75-125g/tonne feed (coccidiostat)', ARRAY['Avatec']),
('Narasin', 'antiparasitic', 0, '60-80g/tonne feed (coccidiostat)', ARRAY['Monteban']),
('Maduramicin', 'antiparasitic', 5, '5g/tonne feed (coccidiostat)', ARRAY['Cygro']),
('Metronidazole', 'antibiotic', 7, '40mg/kg for 5 days (clostridial)', ARRAY['Flagyl Vet']),
('Chloramphenicol', 'antibiotic', 28, '20mg/kg — NOTE: banned in food animals in India/EU', ARRAY['Chloromycetin']),
('Spiramycin', 'antibiotic', 7, '50-100mg/kg for 5 days', ARRAY['Rovamycin']),
('Erythromycin', 'antibiotic', 7, '125mg/L water for 5 days', ARRAY['Erythrocin']),
('Gentamicin', 'antibiotic', 14, '5mg/kg SC for 3-5 days', ARRAY['Gentocin']),
('Ceftiofur', 'antibiotic', 0, 'Single SC injection at hatchery', ARRAY['Excenel']),
('Flumequine', 'antibiotic', 7, '12mg/kg for 5 days', ARRAY['Flumequil']),
('Sodium Bicarbonate', 'vitamin', 0, '0.5% in water for heat stress', ARRAY['Baking Soda Feed Grade']),
('Potassium Chloride', 'vitamin', 0, '0.15% in water for electrolyte balance', ARRAY['KCl electrolyte']),
('Kaolin-Pectin', 'other', 0, 'Per label for diarrhoea management', ARRAY['Kaopectate']),
('Activated Charcoal', 'other', 0, 'Per label for mycotoxin binding', ARRAY['Toxibind']),
('Fumonisin Binder (Bentonite)', 'other', 0, 'Per feed label — mycotoxin binder', ARRAY['Mycofix', 'Toxfin Dry']);
