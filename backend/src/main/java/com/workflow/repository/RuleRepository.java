package com.workflow.repository;

import com.workflow.model.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RuleRepository extends JpaRepository<Rule, UUID> {
    List<Rule> findByStepIdOrderByPriorityAsc(UUID stepId);
    Optional<Rule> findByStepIdAndPriority(UUID stepId, Integer priority);
}
