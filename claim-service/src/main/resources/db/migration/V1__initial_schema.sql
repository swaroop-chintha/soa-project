-- Initial schema for Claim Service
CREATE TABLE IF NOT EXISTS claims (
    id BIGSERIAL PRIMARY KEY,
    claim_number VARCHAR(50) NOT NULL UNIQUE,
    policy_id BIGINT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    claim_amount NUMERIC(12, 2) NOT NULL,
    description VARCHAR(500),
    claim_date DATE NOT NULL,
    status VARCHAR(25) NOT NULL,
    rejection_reason VARCHAR(255),
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_claims_number ON claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_claims_idempotency ON claims(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);

CREATE TABLE IF NOT EXISTS claim_status_history (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    previous_status VARCHAR(25),
    new_status VARCHAR(25) NOT NULL,
    reason VARCHAR(500),
    changed_at TIMESTAMP NOT NULL,
    changed_by VARCHAR(100),
    CONSTRAINT fk_history_claim FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_csh_claim_id ON claim_status_history(claim_id);
