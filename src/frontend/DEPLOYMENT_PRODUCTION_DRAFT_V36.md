# Production Deployment Checklist - Draft Version 36

## Overview
This document outlines the steps to deploy Draft Version 36 to production. **No feature or code changes are included in this deployment** - this is a promotion of the existing, tested codebase to the production environment.

## Pre-Deployment Checklist

### 1. Environment Verification
- [ ] Verify all production environment variables are set correctly (see `README_PRODUCTION_ENV.md`)
- [ ] Confirm `CANISTER_ID_BACKEND` points to the production backend canister
- [ ] Confirm `II_URL` points to the production Internet Identity service
- [ ] Verify `DFX_NETWORK` is set to `ic` (mainnet)

### 2. Build Preparation
- [ ] Ensure the current codebase matches Draft Version 36
- [ ] Run `pnpm typescript-check` to verify no type errors
- [ ] Run `pnpm lint` to verify code quality
- [ ] Clear any local build artifacts: `rm -rf frontend/dist`

### 3. Backend Canister Status
- [ ] Verify backend canister is deployed and healthy on mainnet
- [ ] Confirm backend canister has sufficient cycles
- [ ] Test backend canister query calls are responding
- [ ] Verify access control initialization has completed successfully

## Deployment Steps

### 1. Build Frontend
