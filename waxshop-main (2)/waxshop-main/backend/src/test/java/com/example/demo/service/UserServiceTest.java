package com.example.demo.service;

import com.example.demo.dto.UserProfileDTO;
import com.example.demo.dto.UserProfileUpdateDTO;
import com.example.demo.dto.PasswordChangeDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;
    private User adminUser;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        passwordEncoder = new BCryptPasswordEncoder();
        
        // Regular user setup
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("oldpassword"));
        user.setName("Test User");
        user.setPhone("1234567890");
        user.setRole("USER");
        user.setIsActive(true);
        
        // Admin user setup
        adminUser = new User();
        adminUser.setId(2L);
        adminUser.setEmail("admin@example.com");
        adminUser.setPassword(passwordEncoder.encode("adminpass"));
        adminUser.setName("Admin User");
        adminUser.setPhone("0987654321");
        adminUser.setRole("ADMIN");
        adminUser.setIsActive(true);
    }

    @Test
    void getUserProfile_ReturnsProfile() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        UserProfileDTO dto = userService.getUserProfile("test@example.com");
        assertEquals("Test User", dto.getName());
        assertEquals("1234567890", dto.getPhone());
        assertEquals("test@example.com", dto.getEmail());
        assertEquals("USER", dto.getRole());
        assertTrue(dto.getIsActive());
    }

    @Test
    void getUserProfile_UserNotFound_Throws() {
        when(userRepository.findByEmail("nouser@example.com")).thenReturn(Optional.empty());
        assertThrows(java.util.NoSuchElementException.class, () -> userService.getUserProfile("nouser@example.com"));
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
    void updateUserProfile_UserNotFound_Throws() {
        when(userRepository.findByEmail("nouser@example.com")).thenReturn(Optional.empty());
        UserProfileUpdateDTO updateDTO = new UserProfileUpdateDTO();
        updateDTO.setName("Name");
        updateDTO.setPhone("000");
        assertThrows(java.util.NoSuchElementException.class, () -> userService.updateUserProfile("nouser@example.com", updateDTO));
    }

    @Test
    void changePassword_WithValidCurrentPassword_UpdatesPassword() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        
        PasswordChangeDTO passwordChangeDTO = new PasswordChangeDTO();
        passwordChangeDTO.setCurrentPassword("oldpassword");
        passwordChangeDTO.setNewPassword("newpassword123");
        
        assertDoesNotThrow(() -> userService.changePassword("test@example.com", passwordChangeDTO));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void changePassword_WithInvalidCurrentPassword_ThrowsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        
        PasswordChangeDTO passwordChangeDTO = new PasswordChangeDTO();
        passwordChangeDTO.setCurrentPassword("wrongpassword");
        passwordChangeDTO.setNewPassword("newpassword123");
        
        assertThrows(IllegalArgumentException.class, () -> 
            userService.changePassword("test@example.com", passwordChangeDTO));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void changePassword_WithEmptyNewPassword_ThrowsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        
        PasswordChangeDTO passwordChangeDTO = new PasswordChangeDTO();
        passwordChangeDTO.setCurrentPassword("oldpassword");
        passwordChangeDTO.setNewPassword("");
        
        assertThrows(IllegalArgumentException.class, () -> 
            userService.changePassword("test@example.com", passwordChangeDTO));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void changePassword_WithShortNewPassword_ThrowsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        
        PasswordChangeDTO passwordChangeDTO = new PasswordChangeDTO();
        passwordChangeDTO.setCurrentPassword("oldpassword");
        passwordChangeDTO.setNewPassword("123");
        
        assertThrows(IllegalArgumentException.class, () -> 
            userService.changePassword("test@example.com", passwordChangeDTO));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void changePassword_UserNotFound_Throws() {
        when(userRepository.findByEmail("nouser@example.com")).thenReturn(Optional.empty());
        PasswordChangeDTO passwordChangeDTO = new PasswordChangeDTO();
        passwordChangeDTO.setCurrentPassword("x");
        passwordChangeDTO.setNewPassword("y");
        assertThrows(java.util.NoSuchElementException.class, () -> userService.changePassword("nouser@example.com", passwordChangeDTO));
    }

    @Test
    void getAllUsers_ReturnsListOfUserProfileDTO() {
        User user2 = new User();
        user2.setId(2L);
        user2.setEmail("user2@example.com");
        user2.setName("User Two");
        user2.setPhone("2222222222");
        user2.setRole("USER");
        user2.setIsActive(false);
        user.setId(1L);
        when(userRepository.findAll()).thenReturn(java.util.Arrays.asList(user, user2));
        var result = userService.getAllUsers();
        assertEquals(2, result.size());
        assertEquals("Test User", result.get(0).getName());
        assertEquals("User Two", result.get(1).getName());
        assertTrue(result.get(0).getIsActive());
        assertFalse(result.get(1).getIsActive());
    }

    @Test
    void getUserById_ReturnsUserProfileDTO() {
        user.setId(5L);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        var dto = userService.getUserById(5L);
        assertEquals("Test User", dto.getName());
        assertEquals("test@example.com", dto.getEmail());
        assertTrue(dto.getIsActive());
    }

    @Test
    void getUserById_ThrowsWhenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.getUserById(99L));
    }

    @Test
    void updateUserByAdmin_UpdatesAndReturnsUserProfileDTO() {
        user.setId(10L);
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        UserProfileDTO updateDTO = new UserProfileDTO();
        updateDTO.setName("Admin Updated");
        updateDTO.setPhone("5555555555");
        updateDTO.setRole("USER");
        when(userRepository.findById(10L)).thenReturn(Optional.of(user)); // for getUserById
        var dto = userService.updateUserByAdmin(10L, updateDTO);
        assertEquals("Admin Updated", dto.getName());
        assertEquals("5555555555", dto.getPhone());
        assertEquals("USER", dto.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void updateUserByAdmin_ThrowsWhenNotFound() {
        when(userRepository.findById(123L)).thenReturn(Optional.empty());
        UserProfileDTO updateDTO = new UserProfileDTO();
        assertThrows(IllegalArgumentException.class, () -> userService.updateUserByAdmin(123L, updateDTO));
    }

    @Test
    void updateUserByAdmin_ThrowsWhenTryingToEditAdmin() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));
        UserProfileDTO updateDTO = new UserProfileDTO();
        updateDTO.setName("Updated Admin");
        updateDTO.setPhone("5555555555");
        updateDTO.setRole("ADMIN");
        
        assertThrows(IllegalArgumentException.class, () -> userService.updateUserByAdmin(2L, updateDTO));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deleteUser_DeletesUser() {
        user.setId(20L);
        when(userRepository.findById(20L)).thenReturn(Optional.of(user));
        userService.deleteUser(20L);
        verify(userRepository, times(1)).delete(user);
    }

    @Test
    void deleteUser_ThrowsWhenNotFound() {
        when(userRepository.findById(404L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.deleteUser(404L));
    }

    @Test
    void disableUser_DisablesUser() {
        user.setId(30L);
        when(userRepository.findById(30L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        
        userService.disableUser(30L);
        
        verify(userRepository, times(1)).save(argThat(savedUser -> 
            savedUser.getId().equals(30L) && !savedUser.getIsActive()));
    }

    @Test
    void disableUser_ThrowsWhenNotFound() {
        when(userRepository.findById(404L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.disableUser(404L));
    }

    @Test
    void disableUser_ThrowsWhenTryingToDisableAdmin() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));
        
        assertThrows(IllegalArgumentException.class, () -> userService.disableUser(2L));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void enableUser_EnablesUser() {
        user.setIsActive(false);
        user.setId(40L);
        when(userRepository.findById(40L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        
        userService.enableUser(40L);
        
        verify(userRepository, times(1)).save(argThat(savedUser -> 
            savedUser.getId().equals(40L) && savedUser.getIsActive()));
    }

    @Test
    void enableUser_ThrowsWhenNotFound() {
        when(userRepository.findById(404L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.enableUser(404L));
    }

    @Test
    void enableUser_ThrowsWhenTryingToEnableAdmin() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));
        
        assertThrows(IllegalArgumentException.class, () -> userService.enableUser(2L));
        verify(userRepository, never()).save(any(User.class));
    }
}
