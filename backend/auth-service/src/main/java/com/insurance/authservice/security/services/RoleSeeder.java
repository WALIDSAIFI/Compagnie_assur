package com.insurance.authservice.security.services;


import com.insurance.authservice.model.ERole;
import com.insurance.authservice.model.Role;
import com.insurance.authservice.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class RoleSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public RoleSeeder(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) { 
            Arrays.asList(ERole.values()).forEach(role -> {
                roleRepository.save(new Role(role));
            });
            System.out.println("✅ Default roles added to database.");
        }
    }
}
