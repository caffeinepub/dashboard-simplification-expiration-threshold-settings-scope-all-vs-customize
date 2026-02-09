# Production Deployment Checklist - Draft Version 47

## Overview
This document outlines the steps to deploy Draft Version 47 to production. **No feature or code changes are included in this deployment** - this is a promotion of the existing, tested codebase to the production environment.

## Pre-Deployment Checklist

### 1. Environment Verification
- [ ] Verify all production environment variables are set correctly (see `README_PRODUCTION_ENV.md`)
- [ ] Confirm `CANISTER_ID_BACKEND` points to the production backend canister (format: `xxxxx-xxxxx-xxxxx-xxxxx-xxx`)
- [ ] Confirm `CANISTER_ID_FRONTEND` points to the production frontend canister (format: `xxxxx-xxxxx-xxxxx-xxxxx-xxx`)
- [ ] Verify `II_URL` is set to `https://identity.ic0.app` (production Internet Identity)
- [ ] Verify `DFX_NETWORK` is set to `ic` (mainnet)
- [ ] Confirm all environment variables are available in the build environment

### 2. Build Preparation
- [ ] Ensure the current codebase matches Draft Version 47
- [ ] Clear any local build artifacts: `rm -rf frontend/dist`
- [ ] Run `pnpm typescript-check` to verify no type errors
- [ ] Run `pnpm lint` to verify code quality
- [ ] Verify `emptyOutDir: true` is set in `vite.config.ts` (ensures clean build)

### 3. Backend Canister Health Check (MUST complete before frontend deployment)
- [ ] Verify backend canister is deployed and healthy on mainnet
- [ ] Check backend canister cycles balance: `dfx canister --network ic status backend`
- [ ] Confirm backend has sufficient cycles (minimum 1T cycles recommended)
- [ ] Test backend canister query calls are responding:
  ```bash
  dfx canister --network ic call backend getAllowedEmailDomain
  ```
- [ ] Verify access control initialization has completed successfully
- [ ] Confirm no recent backend errors in canister logs

## Deployment Steps

### Order of Operations
**CRITICAL**: Backend must be healthy and verified before deploying frontend assets. Frontend depends on backend availability.

### 1. Build Frontend
