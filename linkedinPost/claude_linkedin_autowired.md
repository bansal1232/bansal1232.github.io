Most Spring developers don’t realize they’re writing a decade-old style in 2026. 



Back then, every tutorial looked like this:



@Service
public class OrderService {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private MailService mailService;
}



One annotation per dependency. Clean. Simple. Done.



And honestly? Almost all of us wrote Spring that way for years.



But then something interesting happened.



In June 2016, Spring 4.3 quietly started pushing constructor injection instead. IDEs began showing yellow warnings on `@Autowired` fields. Most developers ignored them.



That warning exists for a reason.



Because field injection creates classes that hide their dependencies.



Your constructor says:





public OrderService() {}



but the class may actually depend on multiple services hidden inside the file through field injection.



That creates a problem: the constructor suggests the class can be created without any dependencies, even though Spring is injecting them behind the scenes.



With constructor injection, the contract becomes explicit immediately:



@Service
public class OrderService {
    private final UserRepo userRepo;
    private final MailService mailService;

    public OrderService(UserRepo userRepo, MailService mailService) {
        this.userRepo = userRepo;
        this.mailService = mailService;
    }
}



No @Autowired anywhere. Since Spring 4.3, if a class has a single constructor, Spring auto-injects through it — the annotation is optional.



And with Lombok, the boilerplate disappears completely:



@Service
@RequiredArgsConstructor
public class OrderService {
    private final UserRepo userRepo;
    private final MailService mailService;
}



Same wiring. Same behaviour. But now the class is honest about what it needs, the fields are final, and you can `new OrderService(mockRepo, mockMail)` in a plain JUnit test without ever booting Spring.



It also makes the dependencies mandatory at object creation time, which prevents partially initialized objects and makes the class easier to test without Spring.



And the benefits go way beyond readability:



- Dependencies can be final → immutable objects

- Unit tests become dead simple → no Spring context needed

- Circular dependencies fail fast at startup

- Classes stop being tightly coupled to Spring

- Easier debugging, easier refactoring, cleaner architecture



This is why modern Spring officially recommends constructor injection.



Not because field injection is “broken", but because constructor injection scales better when codebases and teams become large.



The funny part? 🥲 



A lot of tutorials still teach field injection today — even though the framework team moved away from it almost a decade ago.



Wanna read more about these cool hacks, check out my page. Link in the comment.



More backend deep-dives on my Design and Development page (https://lnkd.in/gYBPJVTS)



#Java #SpringBoot #Backend #CleanCode #SoftwareEngineering #DependencyInjection #SystemDesign


━━━━━━━━━━━━━━━━━━━━

𝟭. 𝗬𝗢ss𝗨𝗥 𝗗𝗜𝗦𝗞 𝗗𝗢𝗘𝗦𝗡'𝗧 𝗞𝗡𝗢𝗪 𝗪𝗛𝗔𝗧 𝗔 "𝗙𝗜𝗟𝗘" 𝗜𝗦 💾

━━━━━━━━━━━━━━━━━━━