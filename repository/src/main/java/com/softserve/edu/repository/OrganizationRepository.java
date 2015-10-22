package com.softserve.edu.repository;

import com.softserve.edu.entity.catalogue.Locality;
import com.softserve.edu.entity.catalogue.util.LocalityDTO;
import com.softserve.edu.entity.enumeration.device.DeviceType;
import com.softserve.edu.entity.enumeration.organization.OrganizationType;
import com.softserve.edu.entity.organization.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface OrganizationRepository extends CrudRepository<Organization, Long> {

    Page<Organization> findAll(Pageable pageable);

    /**
     * Find organization types by organization id
     * @param organizationId
     * @return
     */
    @Query("SELECT elements(org.organizationTypes) FROM Organization org WHERE org.id=:organizationId")
    Set<OrganizationType> findOrganizationTypesById(@Param("organizationId") Long organizationId);

    /**
     * Find all device types by organization id
     * @param organizationId
     * @return
     */
    @Query("SELECT elements(org.deviceTypes) FROM Organization org WHERE org.id=:organizationId")
    Set<DeviceType> findDeviceTypesByOrganizationId(@Param("organizationId") Long organizationId);

    /**
     * FInd all organizations in selected location by
     * @param localityId
     * @return
     */
    @Query("SELECT o FROM Organization o INNER JOIN o.localities l WHERE l.id=:localityId")
    List<Organization> findOrganizationByLocalityId(@Param("localityId") Long localityId);

    /**
     * Find all organizations in selected locality and organization type
     *
     * @param localityId
     * @param organizationType
     * @return
     */
    @Query("SELECT org FROM Organization org " +
            "INNER JOIN org.localities l " +
            "WHERE l.id=:localityId AND  :organizationType in elements(org.organizationTypes)")
    List<Organization> findOrganizationByLocalityIdAndType(@Param("localityId") Long localityId, @Param("organizationType") OrganizationType organizationType);

    /**
     * Find all organizations in selected  and organization type
     *
     * @param organizationType
     * @return
     */
    @Query("SELECT org FROM Organization org " +
            "WHERE ( :organizationType in elements(org.organizationTypes)) AND ( :deviceType in elements(org.deviceTypes)) ")
    List<Organization> findByOrganizationTypeAndDeviceType(@Param("organizationType") OrganizationType organizationType,
                                                           @Param("deviceType") DeviceType deviceType);

    /**
     * Find all organizations in selected locality, organization type and device type
     *
     * @param localityId  id of locality
     * @param orgType  type of organization
     * @param deviceType  device type
     * @return list of organizations
     */
    @Query("SELECT org FROM Organization org " +
            "INNER JOIN org.localities l " +
            "WHERE l.id=:localityId AND  :orgType in elements(org.organizationTypes) AND :deviceType in elements(org.deviceTypes)")
    List<Organization> findByLocalityIdAndTypeAndDevice(@Param("localityId") Long localityId,
                                                        @Param("orgType") OrganizationType orgType, @Param("deviceType") DeviceType deviceType );



    /**
     * Find all localities by organization id
     * @param organizationId
     * @return
     */
    @Query("SELECT NEW com.softserve.edu.entity.catalogue.util.LocalityDTO(l.id, l.designation, l.district.id) " +
            "FROM Organization org INNER JOIN org.localities l " +
            "WHERE org.id=:organizationId")
    List<LocalityDTO> findLocalitiesByOrganizationId(@Param("organizationId") Long organizationId);

}
