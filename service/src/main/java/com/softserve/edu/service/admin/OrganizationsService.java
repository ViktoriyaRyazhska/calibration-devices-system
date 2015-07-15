package com.softserve.edu.service.admin;

import com.softserve.edu.entity.*;
import com.softserve.edu.entity.user.User;
import com.softserve.edu.entity.user.UserRole;
import com.softserve.edu.entity.util.OrganizationName;
import com.softserve.edu.repository.OrganizationRepository;
import com.softserve.edu.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

@Service
public class OrganizationsService {

	@Autowired
	private OrganizationRepository organizationRepository;

	@Autowired
	private UserRepository userRepository;

	@PersistenceContext
	private EntityManager em;

	@Transactional
	public void addOrganizationWithAdmin(String name, String email,
			String phone, String type, String username, String password,
			Address address) {
		String passwordEncoded = new BCryptPasswordEncoder().encode(password);
		Organization organization = new Organization(name, email, phone,
				address);
		OrganizationType organizationType = (OrganizationType) em
				.createQuery(
						"SELECT ot FROM OrganizationType ot WHERE ot.type=:t")
				.setParameter("t", type).getSingleResult();
		organization.addOrganizationType(organizationType);
		organizationRepository.save(organization);
		User employeeAdmin = new User(username, passwordEncoded, organization);
		String stringUserRole = type + "_ADMIN";
		UserRole userRole = (UserRole) em
				.createQuery("SELECT ur FROM UserRole ur WHERE ur.role=:r")
				.setParameter("r", stringUserRole).getSingleResult();
		System.out.println(userRole.getRole());
		employeeAdmin.addUserRole(userRole);
		userRepository.save(employeeAdmin);
	}

	@Transactional
	public Page<Organization> getOrganizationsBySearchAndPagination(
			int pageNumber, int itemsPerPage, String search) {
		/* pagination starts from 1 at client side, but Spring Data JPA from 0 */
		PageRequest pageRequest = new PageRequest(pageNumber - 1, itemsPerPage);
		return search == null ? organizationRepository.findAll(pageRequest)
				: organizationRepository.findByNameLikeIgnoreCase("%" + search
						+ "%", pageRequest);
	}

	@Transactional(readOnly = true)
	public Organization getOrganizationById(Long id) {
		return organizationRepository.findOne(id);
	}

	@Transactional
	public String getOrganizationType(Organization organization) {
		Long id = organization.getId();
//		String res = organizationRepository.getTypeByOrganizationId(id);
//		String res = (String) em
//				.createQuery("select t.type from OrganizationType t inner join t.organizations o where o.id=:id")
//				.setParameter("id", id).getSingleResult();
//		String res = organizationRepository.getTypeById(id);
		return "";
	}

	@Transactional
	public void editOrganization(Long organizationId, String name,
			String phone, String email, Address address) {
		Organization organization = organizationRepository
				.findOne(organizationId);
		organization.setName(name);
		organization.setPhone(phone);
		organization.setEmail(email);
		organization.setAddress(address);
	}
}
