package com.softserve.edu.service;


import com.softserve.edu.entity.user.User;
import com.softserve.edu.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Check whereas user with {@code username} exist in database
     * Checks whereas user with {@code username} exist in database
     *
     * @param username must not be non {@literal null}
     * @return {@literal true} if user with {@code username} doesn't exist in database, else {@literal false}
     */
    public boolean existsWithUsername(String username) {
        return userRepository.findOne(username) == null;
    }


    /**
     * Changes given type of user's field
     *
     * @param username must not be non {@literal null}
     * @param newValue new value
     * @param typeOfField   type  of user's field
     * @return {@literal true} if changed, else - {@literal false}
     */
    public boolean changeField(String username, String newValue, String typeOfField) {
        boolean isChanged = false;
        if (typeOfField != null && username != null && newValue != null) {
            User user = userRepository.findByUsername(username);
            if (user != null) {
                switch (typeOfField) {
                    case "firstName":
                        user.setFirstName(newValue);
                        isChanged = true;
                        break;
                    case "lastName":
                        user.setLastName(newValue);
                        isChanged = true;
                        break;
                    case "middleName":
                        user.setMiddleName(newValue);
                        isChanged = true;
                        break;
                    case "email":
                        user.setEmail(newValue);
                        isChanged = true;
                        break;
                    case "phone":
                        user.setPhone(newValue);
                        isChanged = true;
                        break;
                }
                if (isChanged) {
                    userRepository.save(user);
                }
            }
        }
        return isChanged;
    }

    /**
     * Finds an employee by the given username
     *
     * @param username of employee
     * @return employee entity
     * @throws ClassCastException if username isn't a employee
     */
    public User getEmployee(String username) throws ClassCastException {
        return userRepository.findOne(username);
    }

    /**
     * Changes user's password
     *
     * @param username    must not be non {@literal null}
     * @param oldPassword old password
     * @param newPassword new password
     * @return {@literal true} if changed, if not or passwords don't match - {@literal false}
     */
    public boolean changePassword(String username, String oldPassword, String newPassword) {
        boolean isChanged = false;
        if (username != null && oldPassword != null && newPassword != null) {
            User user = userRepository.findOne(username);
            if (user != null) {
                PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
                isChanged = passwordEncoder.matches(oldPassword, user.getPassword());
                if (isChanged) {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    userRepository.save(user);
                }
            }
        }
        return isChanged;
    }
}