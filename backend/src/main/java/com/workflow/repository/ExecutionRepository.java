package com.workflow.repository;

import com.workflow.model.Execution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ExecutionRepository extends JpaRepository<Execution, UUID> {
    Page<Execution> findByStatus(Execution.Status status, Pageable pageable);
    Page<Execution> findByWorkflowId(UUID workflowId, Pageable pageable);
    Page<Execution> findByWorkflowIdAndStatus(UUID workflowId, Execution.Status status, Pageable pageable);
}
