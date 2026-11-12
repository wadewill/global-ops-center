package com.listingscore.connections.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class CredentialCipher {
    private final SecretKeySpec key;
    private final SecureRandom random = new SecureRandom();
    public CredentialCipher(@Value("${listingscore.security.credential-key}") String secret) {
        try { key = new SecretKeySpec(MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8)), "AES"); }
        catch (Exception ex) { throw new IllegalStateException("Unable to configure credential encryption.", ex); }
    }
    public String encrypt(String plain) {
        try { byte[] iv = new byte[12]; random.nextBytes(iv); Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE,key,new GCMParameterSpec(128,iv)); byte[] encrypted=cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8)); return Base64.getEncoder().encodeToString(iv)+":"+Base64.getEncoder().encodeToString(encrypted); }
        catch (Exception ex) { throw new IllegalStateException("Unable to secure the API credential.", ex); }
    }
}
