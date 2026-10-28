-- Seed policies for Aegis Claims System
INSERT INTO policies (policy_number, customer_name, policy_type, coverage_amount, start_date, end_date, status) VALUES
('POL-2026-AUTO-001', 'Bruce Wayne', 'COMPREHENSIVE', 75000.00, '2026-01-01', '2026-12-31', 'ACTIVE'),
('POL-2026-HEALTH-002', 'Clark Kent', 'HEALTH', 100000.00, '2026-01-01', '2026-12-31', 'ACTIVE'),
('POL-2026-HOME-003', 'Diana Prince', 'PROPERTY', 250000.00, '2026-01-01', '2026-12-31', 'ACTIVE'),
('POL-2026-TRAVEL-004', 'Barry Allen', 'TRAVEL', 15000.00, '2026-01-01', '2026-12-31', 'ACTIVE'),
('POL-2026-LIFE-005', 'Arthur Curry', 'LIFE', 500000.00, '2026-01-01', '2026-12-31', 'ACTIVE'),
('POL-2025-EXPIRED-006', 'Victor Stone', 'AUTO', 30000.00, '2025-01-01', '2025-12-31', 'EXPIRED')
ON CONFLICT (policy_number) DO NOTHING;
