package com.aaspass;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@ConfigurationPropertiesScan
@SpringBootApplication
public class AaspassServiceBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AaspassServiceBackendApplication.class, args);
	}

}
