package com.softserve.edu.controller.provider;

import com.softserve.edu.controller.provider.util.VerificationPageDTOTransformer;
import com.softserve.edu.dto.provider.VerificationDTO;
import com.softserve.edu.dto.provider.VerificationReadStatusUpdateDTO;
import com.softserve.edu.dto.provider.VerificationStatusUpdateDTO;
import com.softserve.edu.dto.provider.VerificationUpdatingDTO;
import com.softserve.edu.dto.PageDTO;
import com.softserve.edu.dto.provider.EmployeeProvider;
import com.softserve.edu.dto.application.ClientStageVerificationDTO;
import com.softserve.edu.dto.provider.VerificationPageDTO;
import com.softserve.edu.entity.Address;
import com.softserve.edu.entity.ClientData;
import com.softserve.edu.entity.Organization;
import com.softserve.edu.entity.Verification;
import com.softserve.edu.entity.user.User;
import com.softserve.edu.entity.util.Status;
import com.softserve.edu.service.SecurityUserDetailsService;
import com.softserve.edu.service.calibrator.CalibratorService;
import com.softserve.edu.service.provider.ProviderEmployeeService;
import com.softserve.edu.service.provider.ProviderService;
import com.softserve.edu.service.utils.ListToPageTransformer;
import com.softserve.edu.service.verification.VerificationService;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "/provider/verifications/")
public class ProviderVerificationController {

    @Autowired
    VerificationService verificationService;

    @Autowired
    ProviderService providerService;

    @Autowired
    ProviderEmployeeService providerEmployeeService;

    @Autowired
    CalibratorService calibratorService;

    private final Logger logger = Logger.getLogger(ProviderVerificationController.class);

    @RequestMapping(value = "archive/{pageNumber}/{itemsPerPage}", method = RequestMethod.GET)
    public PageDTO<VerificationPageDTO> getPageOfAllVerificationsByProviderId(
            @PathVariable Integer pageNumber,
            @PathVariable Integer itemsPerPage,
            @AuthenticationPrincipal SecurityUserDetailsService.CustomUserDetails user) {

        Page<VerificationPageDTO> page = VerificationPageDTOTransformer
                .toDTO(verificationService
                        .findPageOfAllVerificationsByProviderId(
                                user.getOrganizationId(),
                                pageNumber,
                                itemsPerPage
                        ));

        return new PageDTO<>(page.getTotalElements(), page.getContent());
    }

    /**
     * Find page of verifications by specific criterias
     * 
     * @param pageNumber
     * @param itemsPerPage
     * @param verifDate (optional)
     * @param verifId (optional)
     * @param lastName (optional)
     * @param street (optional)
     * @param employeeUser
     * @return PageDTO<VerificationPageDTO>
     */
    @SuppressWarnings("static-access")
	@RequestMapping(value = "new/{pageNumber}/{itemsPerPage}/{verifDate}/{verifId}/{lastName}/{street}", method = RequestMethod.GET)
    public PageDTO<VerificationPageDTO> getPageOfAllSentVerificationsByProviderIdAndSearch(

    		@PathVariable Integer pageNumber,
    		@PathVariable Integer itemsPerPage,
    		@PathVariable String verifDate,
    		@PathVariable String verifId,
    		@PathVariable String lastName,
    		@PathVariable String street,
            @AuthenticationPrincipal SecurityUserDetailsService.CustomUserDetails employeeUser) {
    	
    	User providerEmployee = providerEmployeeService.oneProviderEmployee(employeeUser.getUsername());
       ListToPageTransformer<Verification> queryResult = verificationService.findPageOfSentVerificationsByProviderIdAndCriteriaSearch(
                employeeUser.getOrganizationId(),
                pageNumber,
                itemsPerPage,
                verifDate,
                verifId,
                lastName,
                street,
               providerEmployee
        );
        List<VerificationPageDTO> content = VerificationPageDTOTransformer.toDtoFromList(queryResult.getContent());
        return new PageDTO<VerificationPageDTO>(queryResult.getTotalItems(), content);
    }

    /**
     * Find count of new verifications that have Read Status "UNREAD"
     *
     * @return Long count
     */
    @RequestMapping(value = "new/count/provider", method = RequestMethod.GET)
    public Long getCountOfNewVerificationsByProviderId( @AuthenticationPrincipal SecurityUserDetailsService.CustomUserDetails user) {
        	return  verificationService.findCountOfNewVerificationsByProviderId(user.getOrganizationId());
    }


    /**
     * Find calibrators by district which correspond provider district
     *
     * @return calibrator
     */
    @RequestMapping(value = "new/calibrators", method = RequestMethod.GET)
    public List<Organization> updateVerification( @AuthenticationPrincipal SecurityUserDetailsService.CustomUserDetails user) {
        return calibratorService.findByDistrict(providerService.findById(user.getOrganizationId()).getAddress().getDistrict(), "CALIBRATOR");
    }


    @RequestMapping(value = "new/providerEmployees", method = RequestMethod.GET)
    public List<EmployeeProvider> employeeVerification(
            @AuthenticationPrincipal SecurityUserDetailsService.CustomUserDetails user) {
        User employee = providerEmployeeService.oneProviderEmployee(user.getUsername());
        String role = providerEmployeeService.getRoleByUserName(user.getUsername());
        List<EmployeeProvider> providerListEmployee = new ArrayList<>();

        if (role.equalsIgnoreCase("PROVIDER_ADMIN")){
            List<User> list = providerEmployeeService.getAllProviders("PROVIDER_EMPLOYEE", employee.getOrganization().getId());
            providerListEmployee = EmployeeProvider.giveListOfProviders(list,role);
        } else {
            EmployeeProvider userPage = new EmployeeProvider(employee.getUsername(), employee.getFirstName(), employee.getLastName(), employee.getMiddleName(), role);
            providerListEmployee.add(userPage);
        }
        return providerListEmployee;
    }

    /**
     * Update verificationsproviderListEmployee
     */
    @RequestMapping(value = "new/update", method = RequestMethod.PUT)
    public void updateVerification(
            @RequestBody VerificationUpdatingDTO verificationUpdatingDTO) {
        for (String verificationId : verificationUpdatingDTO.getIdsOfVerifications()) {
            verificationService.updateVerificationByprovider(verificationId, verificationUpdatingDTO.getCalibrator());
        }
    }
    
    
    @RequestMapping(value = "new/reject", method = RequestMethod.PUT)
    public void rejectVerification(@RequestBody VerificationStatusUpdateDTO verificationReadStatusUpdateDTO) {
			verificationService.updateVerificationStatus(verificationReadStatusUpdateDTO.getVerificationId(),
           					Status.valueOf(verificationReadStatusUpdateDTO.getStatus().toUpperCase()));
    }
    
    @RequestMapping(value = "new/accept", method = RequestMethod.PUT)
    public void acceptVerification(@RequestBody VerificationStatusUpdateDTO verificationReadStatusUpdateDTO) {
			verificationService.updateVerificationStatus(verificationReadStatusUpdateDTO.getVerificationId(),
           					Status.valueOf(verificationReadStatusUpdateDTO.getStatus().toUpperCase()));
    }

    /**
     * change read status of verification when Provider user reads it
     * @param verificationDto
     */
    @RequestMapping(value = "new/read", method = RequestMethod.PUT)
    public void markVerificationAsRead(@RequestBody VerificationReadStatusUpdateDTO verificationDto) {
        verificationService.updateVerificationReadStatus(verificationDto.getVerificationId(), verificationDto.getReadStatus());
    }

    @RequestMapping(value = "assign/providerEmployee", method = RequestMethod.PUT)
    public void assignProviderEmployee(@RequestBody VerificationUpdatingDTO verificationUpdatingDTO) {
        User providerEmployee = new User();
        String idVerification=verificationUpdatingDTO.getIdVerification();
        providerEmployee.setUsername(verificationUpdatingDTO.getEmployeeProvider().getUsername());
        verificationService.assignProviderEmployee(idVerification, providerEmployee);
    }
    @RequestMapping(value = "remove/providerEmployee", method = RequestMethod.PUT)
    public void removeProviderEmployee(@RequestBody VerificationUpdatingDTO verificationUpdatingDTO) {
        verificationService.assignProviderEmployee(verificationUpdatingDTO.getIdVerification(), null);
    }


    @RequestMapping(value = "new/{verificationId}", method = RequestMethod.GET)
    public ClientStageVerificationDTO getNewVerificationDetailsById(
            @PathVariable String verificationId,
            @AuthenticationPrincipal SecurityUserDetailsService.CustomUserDetails user) {

        Verification verification = verificationService
                .findByIdAndProviderId(
                        verificationId,
                        user.getOrganizationId()
                );

        ClientData clientData = verification.getClientData();
        Address address = clientData.getClientAddress();
        
        return new ClientStageVerificationDTO(clientData, address, null);
    }

    @RequestMapping(value = "archive/{verificationId}", method = RequestMethod.GET)
    public VerificationDTO getArchivalVerificationDetailsById(
            @PathVariable String verificationId,
            @AuthenticationPrincipal SecurityUserDetailsService.CustomUserDetails user) {

        Verification verification = verificationService
                .findByIdAndProviderId(verificationId, user.getOrganizationId());

        return new VerificationDTO(
                verification.getClientData(),
                verification.getId(),
                verification.getInitialDate(),
                verification.getExpirationDate(),
                verification.getStatus(),
                verification.getCalibrator(),
                verification.getCalibratorEmployee(),
                verification.getDevice(),
                verification.getProvider(),
                verification.getProviderEmployee(),
                verification.getStateVerificator(),
                verification.getStateVerificatorEmployee()
        );
    }
}
