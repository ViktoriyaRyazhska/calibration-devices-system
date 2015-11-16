package com.softserve.edu.repository.impl;

import com.softserve.edu.entity.device.CalibrationModule;
import com.softserve.edu.repository.CalibrationModuleRepository;
import com.softserve.edu.repository.CalibrationModuleRepositoryCustom;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

/**
 * Created by roman on 13.11.15.
 *
 */

@Repository
public class CalibrationModuleRepositoryImpl implements CalibrationModuleRepositoryCustom {

    @Autowired
    CalibrationModuleRepository calibrationModuleRepository;

    public CalibrationModule saveWithGenerating(CalibrationModule calibrationModule) {
        calibrationModuleRepository.save(calibrationModule);
        generateModuleNumber(calibrationModule);
        return calibrationModuleRepository.save(calibrationModule);
    }

    private void generateModuleNumber(CalibrationModule cm) {
        StringBuilder sb = new StringBuilder();
        switch (cm.getDeviceType()) {
            case WATER: sb.append("1"); break;
            case GASEOUS: sb.append("2"); break;
            case ELECTRICAL: sb.append("3"); break;
            case THERMAL: sb.append("4"); break;
            default: break;
        }
        sb.append(String.format("%03d", cm.getModuleId()));
        cm.setModuleNumber(sb.toString());
    }

}
