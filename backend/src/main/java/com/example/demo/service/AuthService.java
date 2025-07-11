package com.example.demo.service;

import com.example.demo.dto.AuthResponseDTO;
import com.example.demo.dto.UserRequestDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public void register(UserRequestDTO request) {
        if (userRepo.findByEmail(request.email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (request.name == null || request.name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (request.phone == null || request.phone.trim().isEmpty()) {
            throw new IllegalArgumentException("Phone is required");
        }
        User user = new User();
        user.setEmail(request.email);
        user.setPassword(encoder.encode(request.password));
        user.setRole("USER");
        user.setName(request.name);
        user.setPhone(request.phone);
        userRepo.save(user);
    }

    public void registerAdmin(UserRequestDTO request) {
        if (userRepo.findByEmail(request.email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        User user = new User();
        user.setEmail(request.email);
        user.setPassword(encoder.encode(request.password));
        // Set role from request if valid, otherwise default to ADMIN
        if (request.role != null && (request.role.equals("ADMIN") || request.role.equals("USER"))) {
            user.setRole(request.role);
        } else {
            user.setRole("ADMIN");
        }
        user.setName(request.name);
        user.setPhone(request.phone);
        userRepo.save(user);
    }

    public AuthResponseDTO login(UserRequestDTO request) {
        User user = userRepo.findByEmail(request.email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!encoder.matches(request.password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setRefreshToken(refreshToken);
        response.setRole(user.getRole());
        AuthResponseDTO.UserDTO userDto = new AuthResponseDTO.UserDTO();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setRole(user.getRole());
        userDto.setName(user.getName());
        response.setUser(userDto);
        return response;
    }

    public AuthResponseDTO refresh(String refreshToken) {
        String email = jwtUtil.extractEmail(refreshToken);
        if (!jwtUtil.validateRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setRefreshToken(refreshToken); // or issue a new one
        response.setRole(user.getRole());
        AuthResponseDTO.UserDTO userDto = new AuthResponseDTO.UserDTO();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setRole(user.getRole());
        userDto.setName(user.getName());
        response.setUser(userDto);
        return response;
    }
}
