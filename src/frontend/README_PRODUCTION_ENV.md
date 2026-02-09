# Production Environment Configuration

## Overview
This document describes the environment variables required for production deployment of the Safran Test Bench Management System frontend. All variables must be set correctly before building and deploying to production.

## Required Environment Variables

### 1. Canister IDs

#### `CANISTER_ID_BACKEND`
- **Description**: The principal ID of the backend canister on mainnet
- **Format**: `xxxxx-xxxxx-xxxxx-xxxxx-xxx` (IC principal format)
- **Example**: `rrkah-fqaaa-aaaaa-aaaaq-cai`
- **Source**: Output from `dfx canister --network ic id backend`
- **Usage**: Used by the frontend to connect to the backend actor
- **Required**: Yes (build will fail if missing)
- **Validation**: Must be a valid IC principal format

#### `CANISTER_ID_FRONTEND`
- **Description**: The principal ID of the frontend canister on mainnet
- **Format**: `xxxxx-xxxxx-xxxxx-xxxxx-xxx` (IC principal format)
- **Example**: `ryjl3-tyaaa-aaaaa-aaaba-cai`
- **Source**: Output from `dfx canister --network ic id frontend`
- **Usage**: Used for asset references and routing
- **Required**: Yes (build will fail if missing)
- **Validation**: Must be a valid IC principal format

### 2. Internet Identity Configuration

#### `II_URL`
- **Description**: URL of the Internet Identity service
- **Production Value**: `https://identity.ic0.app` (MUST use this exact value for production)
- **Local Development**: `http://localhost:4943/?canisterId=<local-ii-canister-id>`
- **Usage**: Used by `useInternetIdentity` hook for authentication
- **Required**: Yes (authentication will fail if missing or incorrect)
- **Validation**: Must be a valid HTTPS URL for production

### 3. Network Configuration

#### `DFX_NETWORK`
- **Description**: The dfx network target
- **Production Value**: `ic` (MUST use this exact value for production)
- **Local Development**: `local`
- **Usage**: Determines which network the canisters are deployed to
- **Required**: Yes (determines network context)
- **Validation**: Must be either `ic` or `local`

## Environment Variable Injection

### Build-Time Injection (Vite)
The frontend uses Vite's environment variable system. Variables are injected at build time via `vite.config.ts`:

