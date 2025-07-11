package com.example.demo.controller;

import com.example.demo.dto.UserProfileDTO;
import com.example.demo.dto.UserProfileUpdateDTO;
import com.example.demo.service.UserService;
import com.example.demo.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/profile")
@PreAuthorize("isAuthenticated()")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<UserProfileDTO> getProfile(Authentication authentication) {
        String email = AuthUtil.getEmailFromAuth(authentication);
        UserProfileDTO profile = userService.getUserProfile(email);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserProfileDTO> updateProfile(@RequestBody UserProfileUpdateDTO updateDTO, Authentication authentication) {
        String email = AuthUtil.getEmailFromAuth(authentication);
        UserProfileDTO updated = userService.updateUserProfile(email, updateDTO);
        return ResponseEntity.ok(updated);
    }
}
