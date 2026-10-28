package com.aegis.approval.repository;

import com.aegis.approval.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {

    Optional<Approval> findByClaimId(Long claimId);

    boolean existsByClaimId(Long claimId);
}
