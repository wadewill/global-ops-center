package com.listingscore.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthRateLimiter {
    private final StringRedisTemplate redis;
    private final boolean redisEnabled;
    private final Map<String, Window> localWindows = new ConcurrentHashMap<>();
    public AuthRateLimiter(StringRedisTemplate redis, @Value("${listingscore.redis.enabled:false}") boolean redisEnabled) { this.redis = redis; this.redisEnabled = redisEnabled; }

    public void register(String ip, String email) { check("register:ip:" + ip, 5, Duration.ofHours(1)); check("register:email:" + email, 3, Duration.ofHours(1)); }
    public void login(String ip, String email) { check("login:ip:" + ip, 10, Duration.ofMinutes(15)); check("login:email:" + email, 8, Duration.ofMinutes(15)); }

    private void check(String key, int limit, Duration window) {
        long count; long retryAfter;
        if (redisEnabled) try {
            String redisKey = "listingscore:rate:" + key;
            Long increment = redis.opsForValue().increment(redisKey);
            if (increment != null && increment == 1) redis.expire(redisKey, window);
            count = increment == null ? limit + 1L : increment;
            Long seconds = redis.getExpire(redisKey);
            retryAfter = seconds == null || seconds < 1 ? window.toSeconds() : seconds;
            if (count > limit) throw new RateLimitException(retryAfter);
            return;
        } catch (RateLimitException exception) { throw exception;
        } catch (RuntimeException ignored) { /* retain abuse protection if Redis is temporarily unavailable */ }
        Window state = localWindows.compute(key, (ignored, previous) -> previous == null || previous.expiresAt < System.currentTimeMillis() ? new Window(1, System.currentTimeMillis() + window.toMillis()) : new Window(previous.count + 1, previous.expiresAt));
        count = state.count; retryAfter = Math.max(1, (state.expiresAt - System.currentTimeMillis()) / 1000);
        if (count > limit) throw new RateLimitException(retryAfter);
    }
    private record Window(long count, long expiresAt) { }
}
