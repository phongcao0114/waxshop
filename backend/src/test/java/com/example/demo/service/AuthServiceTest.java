package com.example.demo.service;

import com.example.demo.dto.AuthResponseDTO;
import com.example.demo.dto.UserRequestDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    @Mock
    private UserRepository userRepo;
    @Mock
    private JwtUtil jwtUtil;
    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_Success() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "user@example.com";
        req.password = "pass";
        req.name = "Test User";
        req.phone = "0123456789";
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.empty());
        authService.register(req);
        verify(userRepo).save(any(User.class));
    }

    @Test
    void registerAdmin_Success() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "admin@example.com";
        req.password = "pass";
        when(userRepo.findByEmail("admin@example.com")).thenReturn(Optional.empty());
        authService.registerAdmin(req);
        verify(userRepo).save(any(User.class));
    }

    @Test
    void login_Success() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "user@example.com";
        req.password = "pass";
        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword(new BCryptPasswordEncoder().encode("pass"));
        user.setRole("USER");
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(user.getEmail(), "USER")).thenReturn("token");
        AuthResponseDTO resp = authService.login(req);
        assertEquals("token", resp.getToken());
        assertEquals("USER", resp.getRole());
    }

    @Test
    void register_ThrowsIfEmailExists() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "user@example.com";
        req.password = "pass";
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    void refresh_Success() {
        String refreshToken = "refresh";
        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword("pass");
        user.setRole("USER");
        when(jwtUtil.extractEmail(refreshToken)).thenReturn("user@example.com");
        when(jwtUtil.validateRefreshToken(refreshToken)).thenReturn(true);
        when(userRepo.findByEmail("user@example.com")).thenReturn(java.util.Optional.of(user));
        when(jwtUtil.generateToken("user@example.com", "USER")).thenReturn("token");
        var resp = authService.refresh(refreshToken);
        assertEquals("token", resp.getToken());
        assertEquals("USER", resp.getRole());
        assertEquals(refreshToken, resp.getRefreshToken());
    }

    @Test
    void refresh_InvalidToken_Throws() {
        String refreshToken = "refresh";
        when(jwtUtil.extractEmail(refreshToken)).thenReturn("user@example.com");
        when(jwtUtil.validateRefreshToken(refreshToken)).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> authService.refresh(refreshToken));
    }

    @Test
    void refresh_UserNotFound_Throws() {
        String refreshToken = "refresh";
        when(jwtUtil.extractEmail(refreshToken)).thenReturn("user@example.com");
        when(jwtUtil.validateRefreshToken(refreshToken)).thenReturn(true);
        when(userRepo.findByEmail("user@example.com")).thenReturn(java.util.Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> authService.refresh(refreshToken));
    }

    @Test
    void login_InvalidPassword_Throws() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "user@example.com";
        req.password = "wrong";
        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("pass"));
        user.setRole("USER");
        when(userRepo.findByEmail("user@example.com")).thenReturn(java.util.Optional.of(user));
        assertThrows(IllegalArgumentException.class, () -> authService.login(req));
    }

    @Test
    void login_UserNotFound_Throws() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "notfound@example.com";
        req.password = "pass";
        when(userRepo.findByEmail("notfound@example.com")).thenReturn(java.util.Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> authService.login(req));
    }

    @Test
    void registerAdmin_EmailExists_Throws() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "admin@example.com";
        when(userRepo.findByEmail("admin@example.com")).thenReturn(java.util.Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> authService.registerAdmin(req));
    }
}
