package com.example.demo.service;

import com.example.demo.dto.UserProfileDTO;
import com.example.demo.dto.UserProfileUpdateDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = new User();
        user.setId(1);
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setName("Test User");
        user.setPhone("1234567890");
        user.setRole("USER");
    }

    @Test
    void getUserProfile_ReturnsProfile() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        UserProfileDTO dto = userService.getUserProfile("test@example.com");
        assertEquals("Test User", dto.getName());
        assertEquals("1234567890", dto.getPhone());
        assertEquals("test@example.com", dto.getEmail());
    }

    @Test
    void updateUserProfile_UpdatesAndReturnsProfile() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        UserProfileUpdateDTO updateDTO = new UserProfileUpdateDTO();
        updateDTO.setName("Updated Name");
        updateDTO.setPhone("0987654321");
        UserProfileDTO dto = userService.updateUserProfile("test@example.com", updateDTO);
        assertEquals("Updated Name", dto.getName());
        assertEquals("0987654321", dto.getPhone());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void getAllUsers_ReturnsListOfUserProfileDTO() {
        User user2 = new User();
        user2.setId(2);
        user2.setEmail("user2@example.com");
        user2.setName("User Two");
        user2.setPhone("2222222222");
        user2.setRole("USER");
        user.setId(1);
        when(userRepository.findAll()).thenReturn(java.util.Arrays.asList(user, user2));
        var result = userService.getAllUsers();
        assertEquals(2, result.size());
        assertEquals("Test User", result.get(0).getName());
        assertEquals("User Two", result.get(1).getName());
    }

    @Test
    void getUserById_ReturnsUserProfileDTO() {
        user.setId(5);
        when(userRepository.findById(5)).thenReturn(Optional.of(user));
        var dto = userService.getUserById(5L);
        assertEquals("Test User", dto.getName());
        assertEquals("test@example.com", dto.getEmail());
    }

    @Test
    void getUserById_ThrowsWhenNotFound() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () -> userService.getUserById(99L));
    }

    @Test
    void updateUserByAdmin_UpdatesAndReturnsUserProfileDTO() {
        user.setId(10);
        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        UserProfileDTO updateDTO = new UserProfileDTO();
        updateDTO.setName("Admin Updated");
        updateDTO.setPhone("5555555555");
        updateDTO.setRole("ADMIN");
        when(userRepository.findById(10)).thenReturn(Optional.of(user)); // for getUserById
        var dto = userService.updateUserByAdmin(10L, updateDTO);
        assertEquals("Admin Updated", dto.getName());
        assertEquals("5555555555", dto.getPhone());
        assertEquals("ADMIN", dto.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void updateUserByAdmin_ThrowsWhenNotFound() {
        when(userRepository.findById(123)).thenReturn(Optional.empty());
        UserProfileDTO updateDTO = new UserProfileDTO();
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () -> userService.updateUserByAdmin(123L, updateDTO));
    }

    @Test
    void deleteUser_DeletesUser() {
        user.setId(20);
        when(userRepository.findById(20)).thenReturn(Optional.of(user));
        userService.deleteUser(20L);
        verify(userRepository, times(1)).delete(user);
    }

    @Test
    void deleteUser_ThrowsWhenNotFound() {
        when(userRepository.findById(404)).thenReturn(Optional.empty());
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () -> userService.deleteUser(404L));
    }
}

