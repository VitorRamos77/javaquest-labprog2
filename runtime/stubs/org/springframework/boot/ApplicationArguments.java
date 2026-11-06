package org.springframework.boot;
import java.util.*;
public interface ApplicationArguments {
    String[] getSourceArgs(); Set<String> getOptionNames(); boolean containsOption(String name);
    List<String> getOptionValues(String name); List<String> getNonOptionArgs();
}
