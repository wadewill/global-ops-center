package com.listingscore.tasks.api;

import com.listingscore.tasks.domain.TaskStatus;
import jakarta.validation.constraints.NotNull;
public record TaskStatusRequest(@NotNull TaskStatus status) { }
