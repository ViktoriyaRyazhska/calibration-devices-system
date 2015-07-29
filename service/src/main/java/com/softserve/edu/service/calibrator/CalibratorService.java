package com.softserve.edu.service.calibrator;

import com.softserve.edu.entity.BbiProtocol;
import com.softserve.edu.entity.Organization;
import com.softserve.edu.entity.Verification;
import com.softserve.edu.repository.OrganizationRepository;
import com.softserve.edu.repository.UploadBbiRepository;
import com.softserve.edu.repository.VerificationRepository;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class CalibratorService {

    @Autowired
    private OrganizationRepository calibratorRepository;

    @Autowired
    private UploadBbiRepository uploadBbiRepository;

    @PersistenceContext
    private EntityManager em;

    @Autowired
    private VerificationRepository verificationRepository;


    @Transactional(readOnly = true)
    public List<Organization> findByDistrict(String district, String type) {
        System.err.println("searching calibrators");
        return calibratorRepository.getByTypeAndDistrict(district, type);
    }

    @Transactional(readOnly = true)
    public Organization findById(Long id) {
        return calibratorRepository.findOne(id);
    }

    @Transactional
    public void uploadBbi(InputStream file, String idVerification, String originalFileFullName) throws IOException {
        String filename = originalFileFullName.substring(0, originalFileFullName.lastIndexOf('.'));
        byte[] bytesOfBbi = IOUtils.toByteArray(file);
        Verification verification = verificationRepository.findOne(idVerification);
        BbiProtocol bbiProtocol = new BbiProtocol(bytesOfBbi, verification, filename);
        uploadBbiRepository.save(bbiProtocol);
    }

    @Transactional(readOnly = true)
    public String findBbiFileByOrganizationId(String id) {
        return uploadBbiRepository.findFileNameByVerificationId(id);
    }

    @Transactional
    public void deleteBbiFile(String idVerification) {
        BbiProtocol bbiProtocol = uploadBbiRepository.findByVerification(idVerification);
        uploadBbiRepository.delete(bbiProtocol);
    }
}
