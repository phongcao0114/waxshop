package com.example.demo.service;

import com.example.demo.dto.UserProfileDTO;
import com.example.demo.dto.UserProfileUpdateDTO;
import com.example.demo.dto.PasswordChangeDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserProfileDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        return dto;
    }

    public UserProfileDTO updateUserProfile(String email, UserProfileUpdateDTO updateDTO) {
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setName(updateDTO.getName());
        user.setPhone(updateDTO.getPhone());
        userRepository.save(user);
        return getUserProfile(email);
    }

    public void changePassword(String email, PasswordChangeDTO passwordChangeDTO) {
        User user = userRepository.findByEmail(email).orElseThrow();
        
        // Verify current password
        if (!passwordEncoder.matches(passwordChangeDTO.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Validate new password
        if (passwordChangeDTO.getNewPassword() == null || passwordChangeDTO.getNewPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("New password cannot be empty");
        }
        
        if (passwordChangeDTO.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(passwordChangeDTO.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserProfileDTO> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            UserProfileDTO dto = new UserProfileDTO();
            dto.setId(user.getId());
            dto.setEmail(user.getEmail());
            dto.setName(user.getName());
            dto.setPhone(user.getPhone());
            dto.setRole(user.getRole());
            dto.setIsActive(user.getIsActive());
            return dto;
        }).collect(Collectors.toList());
    }

    public UserProfileDTO getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        return dto;
    }

    public UserProfileDTO updateUserByAdmin(Long id, UserProfileDTO updateDTO) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("You cannot edit another admin user.");
        }
        user.setName(updateDTO.getName());
        user.setPhone(updateDTO.getPhone());
        user.setRole(updateDTO.getRole());
        userRepository.save(user);
        return getUserById(id);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.delete(user);
    }

    public void disableUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("You cannot disable another admin user.");
        }
        user.setIsActive(false);
        userRepository.save(user);
    }

    public void enableUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("You cannot enable another admin user.");
        }
        user.setIsActive(true);
        userRepository.save(user);
    }
}

