package com.aegis.policy.service;

import com.aegis.policy.dto.PolicyRequestDTO;
import com.aegis.policy.dto.PolicyResponseDTO;
import com.aegis.policy.dto.PolicyValidationResponseDTO;

import java.util.List;

public interface PolicyService {

    PolicyResponseDTO createPolicy(PolicyRequestDTO requestDTO);

    List<PolicyResponseDTO> getAllPolicies();

    PolicyResponseDTO getPolicyById(Long id);

    PolicyResponseDTO updatePolicy(Long id, PolicyRequestDTO requestDTO);

    void deletePolicy(Long id);

    PolicyValidationResponseDTO validatePolicy(Long id);
}
