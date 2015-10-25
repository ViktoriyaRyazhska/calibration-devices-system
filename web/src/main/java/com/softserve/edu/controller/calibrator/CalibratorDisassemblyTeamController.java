package com.softserve.edu.controller.calibrator;


import com.softserve.edu.dto.PageDTO;
import com.softserve.edu.dto.calibrator.CalibrationDisassemblyTeamDTO;
import com.softserve.edu.dto.calibrator.DisassemblyTeamPageItem;
import com.softserve.edu.entity.catalogue.Team.DisassemblyTeam;
import com.softserve.edu.entity.organization.Organization;
import com.softserve.edu.service.admin.OrganizationService;
import com.softserve.edu.service.calibrator.CalibratorDisassemblyTeamService;
import com.softserve.edu.service.exceptions.DuplicateRecordException;
import com.softserve.edu.service.user.SecurityUserDetailsService;
import com.softserve.edu.service.user.UserService;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/calibrator/disassemblyTeam/", produces = "application/json")
public class CalibratorDisassemblyTeamController {

    private final Logger logger = Logger.getLogger(CalibratorDisassemblyTeamController.class);


    @Autowired
    private CalibratorDisassemblyTeamService teamService;

    @Autowired
    private UserService userService;

    @Autowired
    private OrganizationService organizationService;

    /**
     * Responds a page according to input data and search value
     * @param pageNumber current page number
     * @param itemsPerPage counts of elements per one page
     * @param search keyword for looking entities by DisassemblyTeam.name
     * @return a page of DisassemblyTeam with their total amount
     */
    @RequestMapping(value = "{pageNumber}/{itemsPerPage}/{search}", method = RequestMethod.GET)
    public PageDTO<DisassemblyTeamPageItem> pageDisassemblyTeamsWithSearch(
            @PathVariable Integer pageNumber, @PathVariable Integer itemsPerPage, @PathVariable String search,
            @AuthenticationPrincipal SecurityUserDetailsService.CustomUserDetails user) {

        Organization organization = organizationService.getOrganizationById(user.getOrganizationId());
        Page<DisassemblyTeamPageItem> page = teamService
                .findByOrganizationAndSearchAndPagination(pageNumber, itemsPerPage,organization, search)
                .map(disassemblyTeam -> new DisassemblyTeamPageItem(disassemblyTeam.getId(),
                        disassemblyTeam.getName(), disassemblyTeam.getEffectiveTo(),
                        disassemblyTeam.getSpecialization(), disassemblyTeam.getLeaderFullName(),
                        disassemblyTeam.getLeaderPhone(), disassemblyTeam.getLeaderEmail()));
        return new PageDTO<>(page.getTotalElements(), page.getContent());
    }

    /**
     *  Responds a page according to input data.
     *
     *  <p>
     * Note that this uses method {@code pageDisassemblyTeamsWithSearch}, whereas
     * search values is {@literal null}
     *
     * @param pageNumber current page number
     * @param itemsPerPage counts of elements per one page
     * @return a page of DisassemblyTeam with their total amount
     */
    @RequestMapping(value = "{pageNumber}/{itemsPerPage}", method = RequestMethod.GET)
    public PageDTO<DisassemblyTeamPageItem> getDisassemblyTeamsPage(@PathVariable Integer pageNumber,
                                                                    @PathVariable Integer itemsPerPage,
                                                                    @AuthenticationPrincipal SecurityUserDetailsService.CustomUserDetails user) {
        return pageDisassemblyTeamsWithSearch(pageNumber, itemsPerPage, null, user);
    }

    /**
     * Responds DisassemblyTeam by Id
     * @param disassemblyTeamId
     * @return DisassemblyTeam
     */
    @RequestMapping(value = "getDisassemblyTeam/{disassemblyTeamId}", method = RequestMethod.GET)
    public ResponseEntity getDisassemblyTeam(@PathVariable String disassemblyTeamId){
        DisassemblyTeam foundDisassemblyTeam = teamService.findById(disassemblyTeamId);
        return new ResponseEntity<>(foundDisassemblyTeam, HttpStatus.OK);
    }

    /**
     * Saves Disassembly team in database
     * @param disassemblyTeamDTO object with disassembly team data
     * @return a response body with http status {@literal CREATED} if everything
     *         DisassemblyTeam successfully created or else http
     *         status {@literal CONFLICT}
     */
    @RequestMapping(value = "add", method = RequestMethod.POST)
    public ResponseEntity addDisassemblyTeam(@RequestBody CalibrationDisassemblyTeamDTO disassemblyTeamDTO,
                                             @AuthenticationPrincipal SecurityUserDetailsService.CustomUserDetails user){
        HttpStatus httpStatus = HttpStatus.CREATED;
        Organization currentOrganization = organizationService.getOrganizationById(user.getOrganizationId());
        try {
            DisassemblyTeam createdDisassemblyTeam = disassemblyTeamDTO.saveTeam(currentOrganization);
            teamService.add(createdDisassemblyTeam);
        }catch (DuplicateRecordException e) {
            logger.error("GOT EXCEPTION " + e.getMessage());
            httpStatus = HttpStatus.CONFLICT;//from body get a message
            return new ResponseEntity(e, httpStatus);
        }catch (Exception e) {
            logger.error("GOT EXCEPTION " + e.getMessage());
            httpStatus = HttpStatus.CONFLICT;
        }
        return new ResponseEntity(httpStatus);
    }

    /**
     * Edit DisassemblyTeam in database
     *
     * @param disassemblyTeamDTO object with edited team data
     * @param disassemblyTeamId
     * @return a response body with http status {@Literal CREATED} if everything Disassembly team successfully
     * edited or else http status {@Literal CONFLICT}
     */
    @RequestMapping(value = "edit/{disassemblyTeamId}", method = RequestMethod.POST)
    public ResponseEntity editDisassemblyTeam(@RequestBody CalibrationDisassemblyTeamDTO disassemblyTeamDTO,
                                                 @PathVariable String disassemblyTeamId){
        HttpStatus httpStatus = HttpStatus.OK;
        try {
            teamService.edit(disassemblyTeamId, disassemblyTeamDTO.getName(),
                    disassemblyTeamDTO.getEffectiveTo(), disassemblyTeamDTO.getSpecialization(),
                    disassemblyTeamDTO.getLeaderFullName(), disassemblyTeamDTO.getLeaderPhone(),
                    disassemblyTeamDTO.getLeaderEmail());
        } catch (Exception e) {
            logger.error("GOT EXCEPTION " + e.getMessage());
            httpStatus = HttpStatus.CONFLICT;
        }
        return new ResponseEntity(httpStatus);
    }

    /**
     * Delete disassembly team from database
     * @param disassemblyTeamId
     * return http status {@Literal OK} if disassembly team successfully deleted from database,
     * else http status {@literal CONFLICT}
     */
    @RequestMapping(value = "delete/{disassemblyTeamId}", method = RequestMethod.POST)
    private ResponseEntity deleteDisassemblyTeam(@PathVariable String disassemblyTeamId) {
        HttpStatus httpStatus = HttpStatus.OK;
        try {
            teamService.delete(disassemblyTeamId);
        } catch (Exception e) {
            logger.error("GOT EXCEPTION " + e.getMessage());
            httpStatus = HttpStatus.CONFLICT;
        }
        return new ResponseEntity(httpStatus);
    }
}
