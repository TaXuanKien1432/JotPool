package com.noteapp.notetaking.security;

import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        System.out.println(">>> CustomOAuth2UserService called for provider: "
                + request.getClientRegistration().getRegistrationId());
        OAuth2User oAuth2User = super.loadUser(request);

        String registrationId = request.getClientRegistration().getRegistrationId(); //"google" or "github"
        String providerId = oAuth2User.getName(); //Google: sub, Github: numeric ID
        String name = oAuth2User.getAttribute("name");
        String email = oAuth2User.getAttribute("email");
        if (email == null) email = oAuth2User.getAttribute("login") + "@github.local";

        User user = null;

        if (registrationId.equals("google")) {
            user = userRepository.findByGoogleId(providerId).orElse(null);
        } else if (registrationId.equals("github")) {
            user = userRepository.findByGithubId(providerId).orElse(null);
        }
        //cannot find by providerId then find by email
        if (user == null) {
            user = userRepository.findByEmail(email).orElse(null);
        }
        //cannot find by email then create new user
        if (user == null) user = new User();

        if (registrationId.equals("google")) {
            user.setEmail(email);
            user.setName(name);
            user.setProfilePicture(oAuth2User.getAttribute("picture"));
            user.setAuthProvider("GOOGLE");
            user.setGoogleId(providerId);
            user.setVerified(true);
            userRepository.save(user);
            System.out.println(">>> Google save email: " + email);
        } else if (registrationId.equals("github")) {
            user.setEmail(email);
            user.setName(name != null ? name : oAuth2User.getAttribute("login"));
            user.setProfilePicture(oAuth2User.getAttribute("avatar_url"));
            user.setAuthProvider("GITHUB");
            user.setGithubId(providerId);
            user.setVerified(true);
            userRepository.save(user);
            System.out.println(">>> Github save email: " + email);
        }

        return oAuth2User;
    }
}
