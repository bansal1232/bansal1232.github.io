My last post covered Java interview questions. But for most backend roles in India, knowing core Java alone won't get you through the loop — the interviewer will almost always pivot to Spring Boot.

So I put this together to bridge that gap.

See how many of these you can answer without reaching for Google:

- You annotate a method with @Transactional and call it from another method in the same class. The transaction doesn't start. Why?
- @Component, @Service, @Repository, @Controller — Spring treats them almost identically. So why do all four exist?
- A REST endpoint returns a User entity with a lazy-loaded List<Order>. In prod you get LazyInitializationException. What happened, and which fix is the right one?
- Constructor injection vs field injection — most people say "constructor is better" but can't say why. Name three concrete reasons.
- You have two beans of the same type. Spring throws NoUniqueBeanDefinitionException at startup. What are your three options to fix it, and which one survives a refactor best?
- spring-boot-starter-parent manages 200+ library versions for you. Where does that BOM actually live, and what happens if you override one version?
- @Async on a method, called from inside the same class. It runs on the caller's thread anyway. Same root cause as the @Transactional one above — what is it?
- application.yml, environment variables, command-line args, @TestPropertySource — when they conflict, which one wins?
- DispatcherServlet, HandlerMapping, HandlerAdapter, ViewResolver. Trace what each one does for a single GET /users/42 request.
- You add @Cacheable to a method. Two threads call it at the same time with the same key on a cold cache. How many times does the underlying method run?
- Filter, HandlerInterceptor, and AOP @Around — three ways to wrap cross-cutting logic around a request. Which layer fires first, and when would you reach for each?
- Spring AOP uses proxies. JDK dynamic proxy vs CGLIB — when does Spring pick which, and why does your aspect silently stop working when you mark a method final?


Full guide with 30 sections — IoC, bean lifecycle, auto-configuration, JPA gotchas, @Transactional propagation, Spring Security filter chain, Resilience4j and native image. Link in the comments.

More deep-dives on my Design and Development page (https://lnkd.in/gYBPJVTS)

#SpringBoot #Java #InterviewPrep #Backend #SpringFramework
