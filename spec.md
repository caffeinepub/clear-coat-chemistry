# Clear Coat Chemistry

## Current State
Full e-commerce store for auto care products with product management, cart, checkout, orders, and an admin dashboard. The admin system uses a token-based claim flow where the first caller with the correct CAFFEINE_ADMIN_TOKEN becomes admin.

**Bug:** The `access-control.mo` `initialize` function checks if the caller already has any role before checking if they provided the correct admin token. When a user signs in first (getting role `#user`), and then goes to `/admin` and enters the correct token, nothing happens -- the existing `#user` role short-circuits the admin upgrade. The portal keeps prompting for credentials.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `access-control.mo`: Fix the `initialize` function to check the admin token FIRST, before checking if a role already exists. If the admin has not been assigned yet and the correct token is provided, upgrade the caller to `#admin` regardless of their existing role.

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend with corrected admin initialization logic: check `not state.adminAssigned and userProvidedToken == adminToken` first, and if true, set caller to `#admin`. Only fall back to the "skip if already has role / assign user" logic if the token check fails.
