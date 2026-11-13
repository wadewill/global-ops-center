package com.listingscore.tasks.api;

import com.listingscore.auth.service.AuthService;
import com.listingscore.imports.api.CatalogText;
import com.listingscore.tasks.domain.TaskStatus;
import com.listingscore.tasks.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.Locale;

@RestController @RequestMapping("/api/v1/tasks")
public class TaskController {
    private final TaskService tasks; private final AuthService auth;
    public TaskController(TaskService tasks, AuthService auth){this.tasks=tasks;this.auth=auth;}
    @GetMapping public List<TaskResponse> list(@RequestParam(required=false) TaskStatus status, Locale locale){return tasks.list(auth.currentUser().getId(),status).stream().map(task -> CatalogText.task(task, locale)).toList();}
    @PatchMapping("/{id}") public TaskResponse update(@PathVariable UUID id,@Valid @RequestBody TaskStatusRequest request, Locale locale){return CatalogText.task(tasks.update(auth.currentUser().getId(),id,request.status()), locale);}
}
