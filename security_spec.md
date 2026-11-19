# Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants & Relationship Mapping
- **Master Source of Truth**: `/users/{userId}` is the root owner document for each authenticated researcher.
- **PII Isolation**: `/users/{userId}` holds `email` (PII). No blanket reads and no collection `list` are allowed on `/users`. Only the authenticated, verified owner (`request.auth.uid == userId`) can `get`, `create`, or `update` their own profile.
- **Subcollection Relational Sync (Master Gate)**:
  - `/users/{userId}/savedGenomes/{genomeId}` requires the parent `/users/{userId}` document to exist on create/update/delete, and requires `resource.data.userId == request.auth.uid` on `list` (with no `get()`/`exists()` inside `allow list`).
  - `/users/{userId}/savedTerms/{termId}` requires the parent `/users/{userId}` document to exist on create/delete, and requires `resource.data.userId == request.auth.uid` on `list`.
- **Immutable Fields**: `uid` / `userId` and `createdAt` can never be changed after creation.
- **Temporal Integrity**: `createdAt` must equal `request.time` on create; `updatedAt` must equal `request.time` on create and update.
- **Bounded Arrays & Allowlists**: `savedGenomes.geneIds` must be a non-empty list of 1 to 6 strings, where all elements belong to the strict gene allowlist `['epas1', 'fam178b', 'lrp5', 'dec2', 'faahout', 'actn3']`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Profile Read**: Anonymous user attempts `get` on `/users/alice`. Expected: `PERMISSION_DENIED`.
2. **Cross-User PII Read**: Signed-in user `bob` attempts `get` on `/users/alice`. Expected: `PERMISSION_DENIED`.
3. **User Collection Enumeration**: Signed-in user `alice` attempts `list` on `/users`. Expected: `PERMISSION_DENIED`.
4. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts `create` on `/users/alice`. Expected: `PERMISSION_DENIED`.
5. **Shadow Field Injection (Profile)**: `alice` creates `/users/alice` with extra ghost field `{ isAdmin: true }`. Expected: `PERMISSION_DENIED`.
6. **Identity Spoofing (Saved Genome)**: `alice` creates `/users/alice/savedGenomes/g1` with `userId: "bob"`. Expected: `PERMISSION_DENIED`.
7. **Orphaned Subcollection Write**: `alice` creates `/users/alice/savedGenomes/g1` when parent `/users/alice` does not exist. Expected: `PERMISSION_DENIED`.
8. **ID Poisoning**: `alice` creates `/users/alice/savedGenomes/bad..id$123` (invalid characters or > 128 chars). Expected: `PERMISSION_DENIED`.
9. **Client Timestamp Forgery**: `alice` creates `/users/alice/savedGenomes/g1` with `createdAt: Timestamp(2020-01-01)` instead of `request.time`. Expected: `PERMISSION_DENIED`.
10. **Array Exhaustion / Invalid Gene Injection**: `alice` creates `/users/alice/savedGenomes/g1` with `geneIds: ['epas1', 'malicious_gene']` or 7 items. Expected: `PERMISSION_DENIED`.
11. **Value Poisoning on Update**: `alice` updates `/users/alice/savedGenomes/g1` setting `label` to a 200-char string (exceeding `maxLength: 80`) or `synergyIndex: 999`. Expected: `PERMISSION_DENIED`.
12. **Immutable Field Mutation**: `alice` updates `/users/alice/savedGenomes/g1` attempting to alter `createdAt` or `userId`. Expected: `PERMISSION_DENIED`.
