package com.listingscore.imports.api;

public enum Severity {
    BLOCKER(30), HIGH(15), MEDIUM(8), OPPORTUNITY(3);

    private final int penalty;

    Severity(int penalty) { this.penalty = penalty; }
    public int penalty() { return penalty; }
}
