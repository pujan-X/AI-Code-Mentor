package com.aicodementor.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class healthcontroller {

    @GetMapping("/health")
    public String checkHealth() {
        return "✅ AI Code Mentor Backend is RUNNING!";
    }
}