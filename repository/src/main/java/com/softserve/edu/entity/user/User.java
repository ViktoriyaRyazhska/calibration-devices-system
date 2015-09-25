package com.softserve.edu.entity.user;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.softserve.edu.entity.AddEmployeeBuilderNew;
import com.softserve.edu.entity.Address;
import com.softserve.edu.entity.Organization;
import lombok.*;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

//TODO : Avaliable typo: some query on repository side crashes after refactoring. Refactor to primitives
@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "username")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
@Table(name = "USER")
public class User {

    @Id
    private String username;

    private String password;
    private String firstName;
    private String lastName;
    private String middleName;
    private String email;
    private String phone;
    private Boolean isAvaliable = false;

    @Embedded
    private Address address;

    @ManyToOne
    @JoinColumn(name = "organizationId")
    @JsonManagedReference
    private Organization organization;

    @ManyToMany(mappedBy = "users")
    private Set<UserRole> userRoles = new HashSet<>();

    public User(AddEmployeeBuilderNew builder) {
        username = builder.username;
        password = builder.password;
        firstName = builder.firstName;
        lastName = builder.lastName;
        middleName = builder.middleName;
        email = builder.email;
        phone = builder.phone;
        address = builder.address;
        isAvaliable = builder.isAveliable;
    }

    /**
     * Required constructor for saving employee in database. Employee cannot
     * exists without these parameters.
     *
     * @param username username
     * @param password password
     */
    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    /**
     * Required constructor for saving employee in database. Employee cannot
     * exists without these parameters.
     *
     * @param username     username
     * @param password     password
     * @param organization its organization
     */
    public User(String username, String password, Organization organization) {
        this.username = username;
        this.password = password;
        this.organization = organization;
    }

    /**
     * Completes constructor above with optional values.
     *
     * @param firstName  first name
     * @param lastName   last name
     * @param middleName Middle name
     */
    public User(String firstName, String lastName, String middleName,
                String username, String password, Organization organization) {
        this(username, password, organization);
        this.firstName = firstName;
        this.lastName = lastName;
        this.middleName = middleName;
    }

    /**
     * Completes constructor above with optional values.
     *
     * @param firstName first name
     * @param lastName  last name
     * @param email     email
     * @param phone     phone number
     */
    public User(String username, String password, Organization organization, String firstName, String lastName,
                String email, String phone) {
        this(username, password, organization);
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
    }
}
