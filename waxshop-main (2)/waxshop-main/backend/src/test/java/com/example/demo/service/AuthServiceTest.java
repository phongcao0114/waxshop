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
        req.name = "Admin User";
        req.phone = "0123456789";
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
        user.setIsActive(true);
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(user.getEmail(), "USER")).thenReturn("token");
        when(jwtUtil.generateRefreshToken(user.getEmail())).thenReturn("refreshToken");
        AuthResponseDTO resp = authService.login(req);
        assertEquals("token", resp.getToken());
        assertEquals("USER", resp.getRole());
    }

    @Test
    void login_DisabledUser_ThrowsException() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "user@example.com";
        req.password = "pass";
        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword(new BCryptPasswordEncoder().encode("pass"));
        user.setRole("USER");
        user.setIsActive(false);
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        
        assertThrows(IllegalArgumentException.class, () -> authService.login(req));
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
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
        user.setIsActive(true);
        when(jwtUtil.extractEmail(refreshToken)).thenReturn("user@example.com");
        when(jwtUtil.validateRefreshToken(refreshToken)).thenReturn(true);
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("user@example.com", "USER")).thenReturn("token");
        var resp = authService.refresh(refreshToken);
        assertEquals("token", resp.getToken());
        assertEquals("USER", resp.getRole());
        assertEquals(refreshToken, resp.getRefreshToken());
    }

    @Test
    void refresh_DisabledUser_ThrowsException() {
        String refreshToken = "refresh";
        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword("pass");
        user.setRole("USER");
        user.setIsActive(false);
        when(jwtUtil.extractEmail(refreshToken)).thenReturn("user@example.com");
        when(jwtUtil.validateRefreshToken(refreshToken)).thenReturn(true);
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        
        assertThrows(IllegalArgumentException.class, () -> authService.refresh(refreshToken));
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
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
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> authService.refresh(refreshToken));
    }

    @Test
    void login_InvalidPassword_Throws() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "user@example.com";
        req.password = "wrong";
        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword(new BCryptPasswordEncoder().encode("pass"));
        user.setRole("USER");
        user.setIsActive(true);
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        assertThrows(IllegalArgumentException.class, () -> authService.login(req));
    }

    @Test
    void login_UserNotFound_Throws() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "notfound@example.com";
        req.password = "pass";
        when(userRepo.findByEmail("notfound@example.com")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> authService.login(req));
    }

    @Test
    void registerAdmin_EmailExists_Throws() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "admin@example.com";
        when(userRepo.findByEmail("admin@example.com")).thenReturn(Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> authService.registerAdmin(req));
    }

    @Test
    void register_ThrowsIfNameIsEmpty() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "user@example.com";
        req.password = "pass";
        req.name = "";
        req.phone = "0123456789";
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    void register_ThrowsIfPhoneIsEmpty() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "user@example.com";
        req.password = "pass";
        req.name = "Test User";
        req.phone = "";
        when(userRepo.findByEmail("user@example.com")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    void register_ThrowsIfNameMissing() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "user2@example.com";
        req.password = "pass";
        req.name = " "; // blank name
        req.phone = "0123456789";
        when(userRepo.findByEmail("user2@example.com")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    void register_ThrowsIfPhoneMissing() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "user3@example.com";
        req.password = "pass";
        req.name = "Test User";
        req.phone = null;
        when(userRepo.findByEmail("user3@example.com")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    void registerAdmin_ThrowsIfEmailExists() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "admin2@example.com";
        req.password = "pass";
        when(userRepo.findByEmail("admin2@example.com")).thenReturn(Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> authService.registerAdmin(req));
    }

    @Test
    void registerAdmin_InvalidRole_DefaultsToAdmin() {
        UserRequestDTO req = new UserRequestDTO();
        req.email = "admin3@example.com";
        req.password = "pass";
        req.role = "INVALID";
        when(userRepo.findByEmail("admin3@example.com")).thenReturn(Optional.empty());
        authService.registerAdmin(req);
        verify(userRepo).save(any(User.class));
    }
}
