package com.workflow.repository;

import com.workflow.model.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {
}
