package com.example.demo.service;

import com.example.demo.dto.UserProfileDTO;
import com.example.demo.dto.UserProfileUpdateDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public UserProfileDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        return dto;
    }

    public UserProfileDTO updateUserProfile(String email, UserProfileUpdateDTO updateDTO) {
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setName(updateDTO.getName());
        user.setPhone(updateDTO.getPhone());
        userRepository.save(user);
        return getUserProfile(email);
    }

    public List<UserProfileDTO> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            UserProfileDTO dto = new UserProfileDTO();
            dto.setId(user.getId());
            dto.setEmail(user.getEmail());
            dto.setName(user.getName());
            dto.setPhone(user.getPhone());
            dto.setRole(user.getRole());
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
        return dto;
    }

    public UserProfileDTO updateUserByAdmin(Long id, UserProfileDTO updateDTO) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
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
}

