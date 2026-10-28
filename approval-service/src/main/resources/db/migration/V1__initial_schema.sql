-- Initial schema for Approval Service
CREATE TABLE IF NOT EXISTS approvals (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    policy_id BIGINT NOT NULL,
    claim_amount NUMERIC(12, 2) NOT NULL,
    coverage_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    decision_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_approvals_claim_id ON approvals(claim_id);
CREATE INDEX IF NOT EXISTS idx_approvals_policy_id ON approvals(policy_id);
