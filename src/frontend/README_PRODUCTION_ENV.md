# Production Environment Configuration

## Overview
This document describes the environment variables required for production deployment of the Safran Test Bench Management System frontend.

## Required Environment Variables

### 1. Canister IDs

#### `CANISTER_ID_BACKEND`
- **Description**: The principal ID of the backend canister on mainnet
- **Format**: `xxxxx-xxxxx-xxxxx-xxxxx-xxx` (IC principal format)
- **Example**: `rrkah-fqaaa-aaaaa-aaaaq-cai`
- **Source**: Output from `dfx canister --network ic id backend`
- **Usage**: Used by the frontend to connect to the backend actor

#### `CANISTER_ID_FRONTEND`
- **Description**: The principal ID of the frontend canister on mainnet
- **Format**: `xxxxx-xxxxx-xxxxx-xxxxx-xxx` (IC principal format)
- **Example**: `ryjl3-tyaaa-aaaaa-aaaba-cai`
- **Source**: Output from `dfx canister --network ic id frontend`
- **Usage**: Used for asset references and routing

### 2. Internet Identity Configuration

#### `II_URL`
- **Description**: URL of the Internet Identity service
- **Production Value**: `https://identity.ic0.app`
- **Local Development**: `http://localhost:4943/?canisterId=<local-ii-canister-id>`
- **Usage**: Used by `useInternetIdentity` hook for authentication

### 3. Network Configuration

#### `DFX_NETWORK`
- **Description**: The dfx network target
- **Production Value**: `ic`
- **Local Development**: `local`
- **Usage**: Determines which network the canisters are deployed to

## Environment Variable Injection

### Build-Time Injection (Vite)
The frontend uses Vite's environment variable system. Variables are injected at build time via `vite.config.ts`:

