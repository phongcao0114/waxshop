package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.junit.jupiter.api.Disabled;

@SpringBootTest
@Disabled("Disabled to avoid DB connection errors during unit testing.")
class DemoApplicationTests {

	@Test
	void contextLoads() {
	}

}
