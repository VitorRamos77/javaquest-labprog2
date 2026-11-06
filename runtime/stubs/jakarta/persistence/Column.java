package jakarta.persistence;
import java.lang.annotation.*;
@Retention(RetentionPolicy.RUNTIME) @Target({ElementType.FIELD, ElementType.METHOD})
public @interface Column { String name() default ""; boolean nullable() default true; boolean unique() default false; int length() default 255; }
